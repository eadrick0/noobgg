import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { lobbyMembers } from "../../db/schemas/lobby-members.drizzle";
import { lobbies } from "../../db/schemas/lobbies.drizzle";
import { ApiError } from "../../middleware/errorHandler";
import { convertBigIntToString } from "../../utils/bigint-serializer";
import { AchievementTrackerService } from "../../services/achievement-tracker.service";

export const joinLobbyController = async (c: Context) => {
  const data = await c.req.json();
  const { lobbyId, memberId } = data;

  if (!lobbyId || !memberId) {
    throw new ApiError("lobbyId and memberId are required", 400);
  }

  // Check if lobby exists
  const lobby = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.id, BigInt(lobbyId)));

  if (lobby.length === 0) {
    throw new ApiError("Lobby not found", 404);
  }

  // Check if user is already a member
  const existingMember = await db
    .select()
    .from(lobbyMembers)
    .where(and(
      eq(lobbyMembers.lobbyId, BigInt(lobbyId)),
      eq(lobbyMembers.memberId, BigInt(memberId))
    ));

  if (existingMember.length > 0) {
    throw new ApiError("User is already a member of this lobby", 400);
  }

  // Add user to lobby
  const [newMember] = await db
    .insert(lobbyMembers)
    .values({
      lobbyId: BigInt(lobbyId),
      memberId: BigInt(memberId),
      isAdmin: false
    })
    .returning();

  // Track achievement for joining lobby
  await AchievementTrackerService.onLobbyJoined(
    BigInt(memberId),
    lobby[0].gameId
  );

  return c.json({
    success: true,
    message: "Successfully joined lobby",
    data: convertBigIntToString(newMember)
  }, 201);
};

export const getLobbyMembersController = async (c: Context) => {
  const lobbyIdParam = c.req.param("lobbyId");
  if (!lobbyIdParam || !/^\d+$/.test(lobbyIdParam)) {
    throw new ApiError("Invalid lobby ID", 400);
  }

  const lobbyId = BigInt(lobbyIdParam);
  
  const members = await db
    .select()
    .from(lobbyMembers)
    .where(eq(lobbyMembers.lobbyId, lobbyId));

  return c.json({
    success: true,
    data: convertBigIntToString(members)
  });
};

export const leaveLobbyController = async (c: Context) => {
  const data = await c.req.json();
  const { lobbyId, memberId } = data;

  if (!lobbyId || !memberId) {
    throw new ApiError("lobbyId and memberId are required", 400);
  }

  // Check if user is a member
  const member = await db
    .select()
    .from(lobbyMembers)
    .where(and(
      eq(lobbyMembers.lobbyId, BigInt(lobbyId)),
      eq(lobbyMembers.memberId, BigInt(memberId))
    ));

  if (member.length === 0) {
    throw new ApiError("User is not a member of this lobby", 404);
  }

  // Remove user from lobby
  await db
    .delete(lobbyMembers)
    .where(eq(lobbyMembers.id, member[0].id));

  return c.json({
    success: true,
    message: "Successfully left lobby"
  });
};