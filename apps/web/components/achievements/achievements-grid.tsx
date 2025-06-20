"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AchievementCard, Achievement } from "./achievement-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target, Flag, Star, Award } from "lucide-react";

interface AchievementsGridProps {
  achievements: Achievement[];
  userAchievements?: Achievement[];
  showProgress?: boolean;
  className?: string;
}

const categoryConfig = {
  all: { label: "All", icon: Award },
  social: { label: "Social", icon: Users },
  gaming: { label: "Gaming", icon: Trophy },
  participation: { label: "Participation", icon: Target },
  milestone: { label: "Milestone", icon: Flag },
  special: { label: "Special", icon: Star }
};

export function AchievementsGrid({ 
  achievements, 
  userAchievements = [], 
  showProgress = true,
  className 
}: AchievementsGridProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Merge user achievements with all achievements
  const mergedAchievements = achievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.id === achievement.id);
    return {
      ...achievement,
      ...userAchievement
    };
  });

  // Filter achievements by category
  const filteredAchievements = selectedCategory === "all" 
    ? mergedAchievements
    : mergedAchievements.filter(achievement => achievement.category === selectedCategory);

  // Sort achievements: completed first, then by rarity, then by name
  const sortedAchievements = filteredAchievements.sort((a, b) => {
    // Completed achievements first
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    
    // Then by rarity (legendary first)
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });

  // Calculate stats for each category
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    
    Object.keys(categoryConfig).forEach(category => {
      if (category === "all") {
        stats[category] = {
          total: mergedAchievements.length,
          completed: mergedAchievements.filter(a => a.isCompleted).length
        };
      } else {
        const categoryAchievements = mergedAchievements.filter(a => a.category === category);
        stats[category] = {
          total: categoryAchievements.length,
          completed: categoryAchievements.filter(a => a.isCompleted).length
        };
      }
    });
    
    return stats;
  }, [mergedAchievements]);

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const stats = categoryStats[key];
            return (
              <TabsTrigger 
                key={key} 
                value={key}
                className="flex flex-col gap-1 py-3"
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stats?.completed || 0}/{stats?.total || 0}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(categoryConfig).map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={showProgress}
                />
              ))}
            </div>
            
            {sortedAchievements.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No achievements in this category yet.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}