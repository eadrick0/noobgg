import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  achievements, 
  userAchievements, 
  achievementProgress 
} from "../db/schemas/achievements.drizzle";
import { userProfiles } from "../db/schemas/user-profile.drizzle";

export interface AchievementTrigger {
  userProfileId: bigint;
  eventType: string;
  eventData?: Record<string, any>;
  gameId?: bigint;
}

export class AchievementTrackerService {
  /**
   * Track an achievement event and update user progress
   */
  static async trackEvent(trigger: AchievementTrigger): Promise<void> {
    try {
      // Get all active achievements that match this event type
      const relevantAchievements = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.isActive, true),
          eq(achievements.requirementType, trigger.eventType)
        ));

      // Filter by game if specified
      const filteredAchievements = relevantAchievements.filter(achievement => {
        if (trigger.gameId && achievement.gameId) {
          return achievement.gameId === trigger.gameId;
        }
        if (trigger.gameId && !achievement.gameId) {
          return false; // Game-specific event but achievement is not game-specific
        }
        return true; // No game filter or both are null
      });

      // Process each relevant achievement
      for (const achievement of filteredAchievements) {
        await this.updateAchievementProgress(
          trigger.userProfileId,
          achievement,
          trigger.eventData
        );
      }
    } catch (error) {
      console.error('Error tracking achievement event:', error);
      // Don't throw - achievement tracking shouldn't break main functionality
    }
  }

  /**
   * Update progress for a specific achievement
   */
  private static async updateAchievementProgress(
    userProfileId: bigint,
    achievement: typeof achievements.$inferSelect,
    eventData?: Record<string, any>
  ): Promise<void> {
    // Get current user achievement record
    const existingUserAchievement = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userProfileId, userProfileId),
        eq(userAchievements.achievementId, achievement.id)
      ));

    const currentProgress = existingUserAchievement[0]?.currentProgress || 0;
    const isAlreadyCompleted = existingUserAchievement[0]?.isCompleted || false;

    // Skip if already completed
    if (isAlreadyCompleted) {
      return;
    }

    // Calculate new progress based on achievement type
    const newProgress = this.calculateProgress(
      achievement.requirementType,
      currentProgress,
      achievement.requirementValue,
      eventData
    );

    const isCompleted = newProgress >= achievement.requirementValue;

    if (existingUserAchievement.length > 0) {
      // Update existing record
      await db
        .update(userAchievements)
        .set({
          currentProgress: newProgress,
          isCompleted,
          earnedAt: isCompleted ? new Date() : existingUserAchievement[0].earnedAt,
          isNotified: false // Reset notification flag for newly completed achievements
        })
        .where(eq(userAchievements.id, existingUserAchievement[0].id));
    } else {
      // Create new record
      await db
        .insert(userAchievements)
        .values({
          userProfileId,
          achievementId: achievement.id,
          currentProgress: newProgress,
          isCompleted,
          earnedAt: isCompleted ? new Date() : new Date(),
          isNotified: false
        });
    }

    // Log achievement completion
    if (isCompleted && !isAlreadyCompleted) {
      console.log(`🏆 Achievement unlocked: ${achievement.name} for user ${userProfileId}`);
      
      // Here you could trigger additional events like:
      // - Send notification
      // - Award bonus points
      // - Trigger other achievements
      // - Update user stats
    }
  }

  /**
   * Calculate new progress based on achievement type
   */
  private static calculateProgress(
    requirementType: string,
    currentProgress: number,
    requirementValue: number,
    eventData?: Record<string, any>
  ): number {
    switch (requirementType) {
      case 'lobby_joined':
      case 'friend_count':
      case 'game_wins':
      case 'tournament_participation':
        // Incremental achievements - add 1 to progress
        return Math.min(currentProgress + 1, requirementValue);

      case 'profile_complete':
      case 'early_adopter':
      case 'beta_participation':
        // Boolean achievements - complete instantly
        return requirementValue;

      case 'days_active':
        // Time-based achievements - set to specific value
        const daysActive = eventData?.daysActive || currentProgress;
        return Math.min(daysActive, requirementValue);

      case 'level_reached':
        // Level-based achievements
        const level = eventData?.level || currentProgress;
        return Math.min(level, requirementValue);

      case 'points_earned':
        // Cumulative points
        const pointsToAdd = eventData?.points || 1;
        return Math.min(currentProgress + pointsToAdd, requirementValue);

      default:
        // Default incremental behavior
        return Math.min(currentProgress + 1, requirementValue);
    }
  }

  /**
   * Common achievement triggers
   */
  static async onProfileComplete(userProfileId: bigint): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'profile_complete'
    });
  }

  static async onLobbyJoined(userProfileId: bigint, gameId?: bigint): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'lobby_joined',
      gameId
    });
  }

  static async onFriendAdded(userProfileId: bigint): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'friend_count'
    });
  }

  static async onGameWin(userProfileId: bigint, gameId?: bigint): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'game_wins',
      gameId
    });
  }

  static async onDailyLogin(userProfileId: bigint, daysActive: number): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'days_active',
      eventData: { daysActive }
    });
  }

  static async onTournamentJoin(userProfileId: bigint): Promise<void> {
    await this.trackEvent({
      userProfileId,
      eventType: 'tournament_participation'
    });
  }

  /**
   * Get unnotified completed achievements for a user
   */
  static async getUnnotifiedAchievements(userProfileId: bigint) {
    return await db
      .select({
        id: userAchievements.id,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        achievementName: achievements.name,
        achievementDescription: achievements.description,
        achievementPoints: achievements.points,
        achievementRarity: achievements.rarity,
        achievementIconUrl: achievements.iconUrl
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(and(
        eq(userAchievements.userProfileId, userProfileId),
        eq(userAchievements.isCompleted, true),
        eq(userAchievements.isNotified, false)
      ));
  }

  /**
   * Mark achievements as notified
   */
  static async markAsNotified(userAchievementIds: bigint[]): Promise<void> {
    if (userAchievementIds.length === 0) return;

    for (const id of userAchievementIds) {
      await db
        .update(userAchievements)
        .set({ isNotified: true })
        .where(eq(userAchievements.id, id));
    }
  }

  /**
   * Get user's achievement statistics
   */
  static async getUserAchievementStats(userProfileId: bigint) {
    const userAchievementsList = await db
      .select({
        id: userAchievements.id,
        isCompleted: userAchievements.isCompleted,
        points: achievements.points,
        rarity: achievements.rarity
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userProfileId, userProfileId));

    const completed = userAchievementsList.filter(ua => ua.isCompleted);
    const totalPoints = completed.reduce((sum, ua) => sum + (ua.points || 0), 0);
    
    const rarityCount = completed.reduce((acc, ua) => {
      acc[ua.rarity] = (acc[ua.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAchievements: userAchievementsList.length,
      completedAchievements: completed.length,
      totalPoints,
      rarityBreakdown: rarityCount
    };
  }
}