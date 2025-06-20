"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Target, TrendingUp, Crown } from "lucide-react";
import { Achievement } from "./achievement-card";

interface AchievementsSummaryProps {
  achievements: Achievement[];
  userAchievements: Achievement[];
  totalPoints?: number;
  className?: string;
}

export function AchievementsSummary({ 
  achievements, 
  userAchievements, 
  totalPoints = 0,
  className 
}: AchievementsSummaryProps) {
  const completedCount = userAchievements.filter(a => a.isCompleted).length;
  const inProgressCount = userAchievements.filter(a => !a.isCompleted && (a.currentProgress || 0) > 0).length;
  const totalCount = achievements.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  // Calculate rarity distribution
  const rarityStats = React.useMemo(() => {
    const completed = userAchievements.filter(a => a.isCompleted);
    return {
      legendary: completed.filter(a => a.rarity === "legendary").length,
      epic: completed.filter(a => a.rarity === "epic").length,
      rare: completed.filter(a => a.rarity === "rare").length,
      uncommon: completed.filter(a => a.rarity === "uncommon").length,
      common: completed.filter(a => a.rarity === "common").length,
    };
  }, [userAchievements]);

  // Recent achievements (last 5)
  const recentAchievements = React.useMemo(() => {
    return userAchievements
      .filter(a => a.isCompleted && a.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, 3);
  }, [userAchievements]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {/* Overall Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Progress
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(completionPercentage)}% completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Achievement Points
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From {completedCount} achievements
          </p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            In Progress
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressCount}</div>
          <p className="text-xs text-muted-foreground">
            Achievements started
          </p>
        </CardContent>
      </Card>

      {/* Rarity Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Rare Achievements
          </CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {rarityStats.legendary > 0 && (
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Legendary</Badge>
                <span className="text-sm font-medium">{rarityStats.legendary}</span>
              </div>
            )}
            {rarityStats.epic > 0 && (
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800 text-xs">Epic</Badge>
                <span className="text-sm font-medium">{rarityStats.epic}</span>
              </div>
            )}
            {rarityStats.rare > 0 && (
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 text-xs">Rare</Badge>
                <span className="text-sm font-medium">{rarityStats.rare}</span>
              </div>
            )}
            {rarityStats.legendary === 0 && rarityStats.epic === 0 && rarityStats.rare === 0 && (
              <p className="text-xs text-muted-foreground">No rare achievements yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements - spans full width */}
      {recentAchievements.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {achievement.iconUrl ? (
                      <img 
                        src={achievement.iconUrl} 
                        alt={achievement.name}
                        className="w-6 h-6"
                      />
                    ) : (
                      <Trophy className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.earnedAt && new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    +{achievement.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}