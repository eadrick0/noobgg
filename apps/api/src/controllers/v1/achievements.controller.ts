import { Context } from "hono";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "../../db";
import { 
  achievements, 
  userAchievements, 
  achievementProgress 
} from "../../db/schemas/achievements.drizzle";
import { userProfiles } from "../../db/schemas/user-profile.drizzle";
import { getTranslation } from "../../utils/translation";
import { ApiError } from "../../middleware/errorHandler";
import { convertBigIntToString } from "../../utils/bigint-serializer";

// Get all achievements
export const getAllAchievementsController = async (
  c: Context<{
    Variables: { locale: string; messages: Record<string, string> };
  }>
) => {
  const achievementsList = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      iconUrl: achievements.iconUrl,
      category: achievements.category,
      rarity: achievements.rarity,
      points: achievements.points,
      requirementType: achievements.requirementType,
      requirementValue: achievements.requirementValue,
      gameId: achievements.gameId,
    })
    .from(achievements)
    .where(eq(achievements.isActive, true))
    .orderBy(asc(achievements.displayOrder), asc(achievements.name));

  return c.json({
    success: true,
    message: "Achievements retrieved successfully",
    data: convertBigIntToString(achievementsList)
  });
};

// Get achievement by ID
export const getAchievementByIdController = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    const errorMessage = getTranslation(c, "validation_invalidId");
    throw new ApiError(errorMessage, 400);
  }

  const id = BigInt(idParam);
  const achievement = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.isActive, true)));

  if (achievement.length === 0) {
    throw new ApiError("Achievement not found", 404);
  }

  return c.json({
    success: true,
    message: "Achievement retrieved successfully",
    data: convertBigIntToString(achievement[0])
  });
};

// Get user's achievements
export const getUserAchievementsController = async (c: Context) => {
  const userIdParam = c.req.param("userId");
  if (!userIdParam || !/^\d+$/.test(userIdParam)) {
    const errorMessage = getTranslation(c, "validation_invalidId");
    throw new ApiError(errorMessage, 400);
  }

  const userId = BigInt(userIdParam);

  // Get user's completed achievements
  const userAchievementsList = await db
    .select({
      id: userAchievements.id,
      achievementId: userAchievements.achievementId,
      earnedAt: userAchievements.earnedAt,
      currentProgress: userAchievements.currentProgress,
      isCompleted: userAchievements.isCompleted,
      // Achievement details
      achievementName: achievements.name,
      achievementDescription: achievements.description,
      achievementIconUrl: achievements.iconUrl,
      achievementCategory: achievements.category,
      achievementRarity: achievements.rarity,
      achievementPoints: achievements.points,
      requirementValue: achievements.requirementValue,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userProfileId, userId))
    .orderBy(desc(userAchievements.earnedAt));

  // Calculate total points
  const totalPoints = userAchievementsList
    .filter(ua => ua.isCompleted)
    .reduce((sum, ua) => sum + (ua.achievementPoints || 0), 0);

  return c.json({
    success: true,
    message: "User achievements retrieved successfully",
    data: {
      achievements: convertBigIntToString(userAchievementsList),
      totalPoints,
      completedCount: userAchievementsList.filter(ua => ua.isCompleted).length,
      inProgressCount: userAchievementsList.filter(ua => !ua.isCompleted).length
    }
  });
};

// Get user's achievement progress for a specific achievement
export const getUserAchievementProgressController = async (c: Context) => {
  const userIdParam = c.req.param("userId");
  const achievementIdParam = c.req.param("achievementId");

  if (!userIdParam || !/^\d+$/.test(userIdParam) || 
      !achievementIdParam || !/^\d+$/.test(achievementIdParam)) {
    const errorMessage = getTranslation(c, "validation_invalidId");
    throw new ApiError(errorMessage, 400);
  }

  const userId = BigInt(userIdParam);
  const achievementId = BigInt(achievementIdParam);

  const progress = await db
    .select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userProfileId, userId),
      eq(userAchievements.achievementId, achievementId)
    ));

  if (progress.length === 0) {
    return c.json({
      success: true,
      message: "No progress found for this achievement",
      data: {
        currentProgress: 0,
        isCompleted: false,
        progressPercentage: 0
      }
    });
  }

  const achievementDetails = await db
    .select({ requirementValue: achievements.requirementValue })
    .from(achievements)
    .where(eq(achievements.id, achievementId));

  const requirementValue = achievementDetails[0]?.requirementValue || 1;
  const currentProgress = progress[0].currentProgress;
  const progressPercentage = Math.min((currentProgress / requirementValue) * 100, 100);

  return c.json({
    success: true,
    message: "Achievement progress retrieved successfully",
    data: {
      ...convertBigIntToString(progress[0]),
      progressPercentage: Math.round(progressPercentage * 100) / 100
    }
  });
};

// Award achievement to user (internal use)
export const awardAchievementController = async (c: Context) => {
  const { userProfileId, achievementId, currentProgress } = await c.req.json();

  if (!userProfileId || !achievementId) {
    throw new ApiError("Missing required fields", 400);
  }

  // Check if achievement exists and is active
  const achievement = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.id, BigInt(achievementId)), eq(achievements.isActive, true)));

  if (achievement.length === 0) {
    throw new ApiError("Achievement not found or inactive", 404);
  }

  // Check if user already has this achievement
  const existingUserAchievement = await db
    .select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userProfileId, BigInt(userProfileId)),
      eq(userAchievements.achievementId, BigInt(achievementId))
    ));

  const progress = currentProgress || achievement[0].requirementValue;
  const isCompleted = progress >= achievement[0].requirementValue;

  if (existingUserAchievement.length > 0) {
    // Update existing progress
    await db
      .update(userAchievements)
      .set({
        currentProgress: progress,
        isCompleted,
        earnedAt: isCompleted ? new Date() : existingUserAchievement[0].earnedAt
      })
      .where(eq(userAchievements.id, existingUserAchievement[0].id));

    return c.json({
      success: true,
      message: isCompleted ? "Achievement completed!" : "Achievement progress updated",
      data: { isCompleted, currentProgress: progress }
    });
  } else {
    // Create new user achievement
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values({
        userProfileId: BigInt(userProfileId),
        achievementId: BigInt(achievementId),
        currentProgress: progress,
        isCompleted,
        earnedAt: isCompleted ? new Date() : new Date()
      })
      .returning();

    return c.json({
      success: true,
      message: isCompleted ? "Achievement unlocked!" : "Achievement progress started",
      data: convertBigIntToString(newUserAchievement)
    }, 201);
  }
};

// Get achievements by category
export const getAchievementsByCategoryController = async (c: Context) => {
  const category = c.req.param("category");
  
  if (!category) {
    throw new ApiError("Category parameter is required", 400);
  }

  const achievementsList = await db
    .select()
    .from(achievements)
    .where(and(
      eq(achievements.category, category as any),
      eq(achievements.isActive, true)
    ))
    .orderBy(asc(achievements.displayOrder), asc(achievements.name));

  return c.json({
    success: true,
    message: `Achievements in category '${category}' retrieved successfully`,
    data: convertBigIntToString(achievementsList)
  });
};

// Get leaderboard by total achievement points
export const getAchievementLeaderboardController = async (c: Context) => {
  const limitParam = c.req.query("limit") || "10";
  const limit = parseInt(limitParam);

  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ApiError("Invalid limit parameter", 400);
  }

  // Get top users by achievement points
  const leaderboard = await db
    .select({
      userId: userAchievements.userProfileId,
      userName: userProfiles.userName,
      profileImageUrl: userProfiles.profileImageUrl,
      totalPoints: achievements.points,
      completedAchievements: userAchievements.id
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .innerJoin(userProfiles, eq(userAchievements.userProfileId, userProfiles.id))
    .where(eq(userAchievements.isCompleted, true))
    .limit(limit);

  // Group by user and calculate totals
  const userStats = leaderboard.reduce((acc, entry) => {
    const userId = entry.userId.toString();
    if (!acc[userId]) {
      acc[userId] = {
        userId: entry.userId,
        userName: entry.userName,
        profileImageUrl: entry.profileImageUrl,
        totalPoints: 0,
        completedCount: 0
      };
    }
    acc[userId].totalPoints += entry.totalPoints || 0;
    acc[userId].completedCount += 1;
    return acc;
  }, {} as Record<string, any>);

  const sortedLeaderboard = Object.values(userStats)
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
    .slice(0, limit);

  return c.json({
    success: true,
    message: "Achievement leaderboard retrieved successfully",
    data: convertBigIntToString(sortedLeaderboard)
  });
};