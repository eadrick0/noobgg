import { pgTable, bigint, timestamp, text, varchar, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { userProfiles } from './user-profile.drizzle';

// Achievement categories enum
export const achievementCategoryEnum = pgEnum('achievement_category', [
  'social',        // Friend-related achievements
  'gaming',        // Game performance achievements  
  'participation', // Event/lobby participation
  'milestone',     // Profile/platform milestones
  'special'        // Limited time or special achievements
]);

// Achievement rarity enum
export const achievementRarityEnum = pgEnum('achievement_rarity', [
  'common',
  'uncommon', 
  'rare',
  'epic',
  'legendary'
]);

// Achievements table - defines all available achievements
export const achievements = pgTable('achievements', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  
  // Achievement details
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 255 }),
  category: achievementCategoryEnum('category').notNull(),
  rarity: achievementRarityEnum('rarity').notNull().default('common'),
  
  // Achievement requirements
  requirementType: varchar('requirement_type', { length: 50 }).notNull(), // 'lobby_count', 'friend_count', 'game_wins', etc.
  requirementValue: integer('requirement_value').notNull(), // The threshold to unlock
  
  // Points awarded for this achievement
  points: integer('points').notNull().default(10),
  
  // Is this achievement currently active?
  isActive: boolean('is_active').notNull().default(true),
  
  // Optional game-specific achievement
  gameId: bigint('game_id', { mode: 'bigint' }),
  
  // Display order
  displayOrder: integer('display_order').notNull().default(0),
});

// User achievements table - tracks which achievements users have earned
export const userAchievements = pgTable('user_achievements', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  // User and achievement reference
  userProfileId: bigint('user_profile_id', { mode: 'bigint' }).notNull().references(() => userProfiles.id),
  achievementId: bigint('achievement_id', { mode: 'bigint' }).notNull().references(() => achievements.id),
  
  // When the achievement was earned
  earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
  
  // Current progress (for tracking partial completion)
  currentProgress: integer('current_progress').notNull().default(0),
  
  // Is this achievement completed?
  isCompleted: boolean('is_completed').notNull().default(false),
  
  // Has the user been notified about this achievement?
  isNotified: boolean('is_notified').notNull().default(false),
});

// Achievement progress tracking table - for complex achievements that need detailed tracking
export const achievementProgress = pgTable('achievement_progress', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  
  userProfileId: bigint('user_profile_id', { mode: 'bigint' }).notNull().references(() => userProfiles.id),
  achievementId: bigint('achievement_id', { mode: 'bigint' }).notNull().references(() => achievements.id),
  
  // Progress tracking fields
  progressData: text('progress_data'), // JSON field for complex progress tracking
  lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
});