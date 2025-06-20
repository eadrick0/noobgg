"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementCard, Achievement } from '@/components/achievements/achievement-card';
import { AchievementsSummary } from '@/components/achievements/achievements-summary';
import { Trophy, Award, Target, Calendar, Crown } from 'lucide-react';

interface AchievementsTabProps {
  achievements: Achievement[];
  userAchievements: Achievement[];
  totalPoints?: number;
  isOwnProfile?: boolean;
}

export function AchievementsTab({ 
  achievements, 
  userAchievements, 
  totalPoints = 0,
  isOwnProfile = false 
}: AchievementsTabProps) {
  const completedAchievements = userAchievements.filter(a => a.isCompleted);
  const inProgressAchievements = userAchievements.filter(a => !a.isCompleted && (a.currentProgress || 0) > 0);
  
  // Recent achievements (last 6)
  const recentAchievements = completedAchievements
    .filter(a => a.earnedAt)
    .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
    .slice(0, 6);

  // Rare achievements
  const rareAchievements = completedAchievements.filter(a => 
    a.rarity === "rare" || a.rarity === "epic" || a.rarity === "legendary"
  );

  return (
    <div className="space-y-6">
      {/* Achievement Summary for Profile */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {completedAchievements.length} achievements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedAchievements.length / achievements.length) * 100)}% of all achievements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rare Unlocked</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rareAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              Epic, legendary & rare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  compact={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rare Achievements Showcase */}
      {rareAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Rare Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {rareAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Achievements - only show for own profile */}
      {isOwnProfile && inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {inProgressAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={true}
                  compact={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {["social", "gaming", "participation", "milestone", "special"].map(category => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const categoryCompleted = completedAchievements.filter(a => a.category === category);
              const percentage = categoryAchievements.length > 0 
                ? (categoryCompleted.length / categoryAchievements.length) * 100 
                : 0;

              const categoryIcons = {
                social: "👥",
                gaming: "🎮", 
                participation: "🎯",
                milestone: "🏆",
                special: "⭐"
              };

              return (
                <div key={category} className="text-center space-y-2">
                  <div className="text-2xl">{categoryIcons[category]}</div>
                  <div className="font-medium capitalize">{category}</div>
                  <div className="text-sm text-muted-foreground">
                    {categoryCompleted.length}/{categoryAchievements.length}
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(percentage)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action for Empty State */}
      {completedAchievements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isOwnProfile ? "Start Your Achievement Journey!" : "No Achievements Yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isOwnProfile 
                ? "Complete your profile, join lobbies, and start gaming to unlock achievements."
                : "This user hasn't unlocked any achievements yet."
              }
            </p>
            {isOwnProfile && (
              <div className="flex gap-2 justify-center">
                <Badge variant="outline">Complete Profile (+15 pts)</Badge>
                <Badge variant="outline">Join First Lobby (+10 pts)</Badge>
                <Badge variant="outline">Add Friend (+10 pts)</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}