"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Clock, CheckCircle2 } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: "social" | "gaming" | "participation" | "milestone" | "special";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
  requirementType: string;
  requirementValue: number;
  isCompleted?: boolean;
  currentProgress?: number;
  earnedAt?: string;
  progressPercentage?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

const rarityStyles = {
  common: "border-gray-300 bg-gray-50",
  uncommon: "border-green-300 bg-green-50",
  rare: "border-blue-300 bg-blue-50",
  epic: "border-purple-300 bg-purple-50",
  legendary: "border-yellow-300 bg-yellow-50"
};

const rarityBadgeStyles = {
  common: "bg-gray-100 text-gray-800",
  uncommon: "bg-green-100 text-green-800",
  rare: "bg-blue-100 text-blue-800", 
  epic: "bg-purple-100 text-purple-800",
  legendary: "bg-yellow-100 text-yellow-800"
};

const categoryIcons = {
  social: "👥",
  gaming: "🎮",
  participation: "🎯",
  milestone: "🏆",
  special: "⭐"
};

export function AchievementCard({ 
  achievement, 
  showProgress = false, 
  compact = false,
  className 
}: AchievementCardProps) {
  const isCompleted = achievement.isCompleted || false;
  const progress = achievement.currentProgress || 0;
  const progressPercentage = achievement.progressPercentage || 
    (progress / achievement.requirementValue) * 100;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      rarityStyles[achievement.rarity],
      isCompleted ? "ring-2 ring-green-400" : "",
      !isCompleted && "opacity-75",
      compact ? "p-3" : "",
      className
    )}>
      {compact ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            {achievement.iconUrl ? (
              <img 
                src={achievement.iconUrl} 
                alt={achievement.name}
                className="w-8 h-8 rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">
                {categoryIcons[achievement.category]}
              </div>
            )}
            {isCompleted && (
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
            {!isCompleted && progress === 0 && (
              <Lock className="w-4 h-4 text-gray-400 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
              <Badge 
                variant="outline" 
                className={cn("text-xs px-1.5 py-0.5", rarityBadgeStyles[achievement.rarity])}
              >
                {achievement.rarity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
            {showProgress && !isCompleted && progress > 0 && (
              <div className="mt-1">
                <Progress value={progressPercentage} className="h-1" />
                <span className="text-xs text-muted-foreground">
                  {progress}/{achievement.requirementValue}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3" />
              {achievement.points}
            </div>
            {isCompleted && achievement.earnedAt && (
              <div className="text-xs text-green-600 font-medium">
                Earned
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {achievement.iconUrl ? (
                    <img 
                      src={achievement.iconUrl} 
                      alt={achievement.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
                      {categoryIcons[achievement.category]}
                    </div>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                  {!isCompleted && progress === 0 && (
                    <Lock className="w-5 h-5 text-gray-400 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                  {!isCompleted && progress > 0 && (
                    <Clock className="w-5 h-5 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={cn("mb-2", rarityBadgeStyles[achievement.rarity])}
                >
                  {achievement.rarity}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  {achievement.points} points
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {showProgress && !isCompleted && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {progress}/{achievement.requirementValue}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {Math.round(progressPercentage)}% complete
                </div>
              </div>
            )}
            {isCompleted && achievement.earnedAt && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</span>
              </div>
            )}
            {!isCompleted && progress === 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <Lock className="w-4 h-4" />
                <span>Not started</span>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}