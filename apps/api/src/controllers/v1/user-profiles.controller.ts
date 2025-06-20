import { Context } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { userProfiles } from "../../db/schemas/user-profile.drizzle";
import {
  createUserProfileDto,
  updateUserProfileDto,
} from "@repo/shared/dto/user-profile.dto";
import { ApiError } from "../../middleware/errorHandler";
import { AchievementTrackerService } from "../../services/achievement-tracker.service";

function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (obj !== null && typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToString(value);
    }
    return converted;
  }
  return obj;
}

export const getUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, id));
  if (!user) throw new ApiError("User not found", 404);
  const safeUser = convertBigIntToString(user);
  return c.json(safeUser);
};

export const createUserProfile = async (c: Context) => {
  const data = await c.req.json();
  const result = createUserProfileDto.safeParse(data);
  if (!result.success) {
    throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  }
  try {
    const user = await db.transaction(async (tx) => {
      const [isKeycloakUserExists] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userKeycloakId, result.data.userKeycloakId));
      if (isKeycloakUserExists)
        throw new ApiError("Keycloak ID already exists", 409);
      const [isUsernameTaken] = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userName, result.data.userName));
      if (isUsernameTaken) throw new ApiError("Username already exists", 409);
      const [newUser] = await tx
        .insert(userProfiles)
        .values({
          ...result.data,
          birthDate: result.data.birthDate
            ? new Date(result.data.birthDate)
            : undefined,
          lastOnline: result.data.lastOnline
            ? new Date(result.data.lastOnline)
            : undefined,
          createdAt: new Date(),
        })
        .returning();
      return newUser;
    });
    const safeUser = convertBigIntToString(user);
    return c.json(
      {
        success: true,
        message: "User profile created successfully",
        data: safeUser,
      },
      201
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Internal server error", 500);
  }
};

export const updateUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  const data = await c.req.json();
  const result = updateUserProfileDto.safeParse(data);
  if (!result.success) {
    throw new ApiError(JSON.stringify(result.error.flatten().fieldErrors), 400);
  }
  if (Object.keys(result.data).length === 0) {
    throw new ApiError("No data provided", 400);
  }
  if (result.data.userKeycloakId) {
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userKeycloakId, result.data.userKeycloakId));
    if (existing && existing.id !== id) {
      throw new ApiError("Keycloak ID already exists", 409);
    }
  }
  if (result.data.userName) {
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userName, result.data.userName));
    if (existing && existing.id !== id) {
      throw new ApiError("Username already exists", 409);
    }
  }
  const [user] = await db
    .update(userProfiles)
    .set({
      ...result.data,
      birthDate: result.data.birthDate
        ? new Date(result.data.birthDate)
        : undefined,
      lastOnline: result.data.lastOnline
        ? new Date(result.data.lastOnline)
        : undefined,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.id, id))
    .returning();
  if (!user) throw new ApiError("User not found", 404);
  
  // Check if profile is complete and track achievement
  const isProfileComplete = user.firstName && user.lastName && user.bio && user.birthDate;
  if (isProfileComplete) {
    await AchievementTrackerService.onProfileComplete(user.id);
  }
  
  const safeUser = convertBigIntToString(user);
  return c.json(
    {
      success: true,
      message: "User profile updated successfully",
      data: safeUser,
    },
    201
  );
};

export const deleteUserProfile = async (c: Context) => {
  const idParam = c.req.param("id");
  if (!idParam || !/^\d+$/.test(idParam)) {
    throw new ApiError("Invalid id", 400);
  }
  const id = BigInt(idParam);
  const [user] = await db
    .update(userProfiles)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.id, id))
    .returning();
  if (!user) throw new ApiError("User not found", 404);
  const safeUser = convertBigIntToString(user);
  return c.json(
    {
      success: true,
      message: "User profile deleted successfully",
      data: safeUser,
    },
    201
  );
};
