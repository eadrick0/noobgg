import { Hono } from 'hono';
import {
  getAllAchievementsController,
  getAchievementByIdController,
  getUserAchievementsController,
  getUserAchievementProgressController,
  awardAchievementController,
  getAchievementsByCategoryController,
  getAchievementLeaderboardController
} from '../../controllers/v1/achievements.controller';

const achievements = new Hono();

// Get all achievements
achievements.get('/', getAllAchievementsController);

// Get achievement by ID
achievements.get('/:id', getAchievementByIdController);

// Get achievements by category
achievements.get('/category/:category', getAchievementsByCategoryController);

// Get achievement leaderboard
achievements.get('/leaderboard', getAchievementLeaderboardController);

// Get user's achievements
achievements.get('/user/:userId', getUserAchievementsController);

// Get user's progress for specific achievement
achievements.get('/user/:userId/achievement/:achievementId', getUserAchievementProgressController);

// Award achievement to user (internal endpoint)
achievements.post('/award', awardAchievementController);

export default achievements;