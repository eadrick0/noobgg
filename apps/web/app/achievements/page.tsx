"use client";

import * as React from "react";
import { AchievementsGrid } from "@/components/achievements/achievements-grid";
import { AchievementsSummary } from "@/components/achievements/achievements-summary";
import { Achievement } from "@/components/achievements/achievement-card";

// Mock data - in real app this would come from API
const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Friend",
    description: "Add your first friend to your gaming network",
    category: "social",
    rarity: "common",
    requirementType: "friend_count",
    requirementValue: 1,
    points: 10
  },
  {
    id: "2", 
    name: "Social Butterfly",
    description: "Build a network of 10 gaming friends",
    category: "social",
    rarity: "uncommon",
    requirementType: "friend_count",
    requirementValue: 10,
    points: 50
  },
  {
    id: "3",
    name: "Victory Royale",
    description: "Win your first game",
    category: "gaming",
    rarity: "common",
    requirementType: "game_wins",
    requirementValue: 1,
    points: 25
  },
  {
    id: "4",
    name: "Champion",
    description: "Dominate with 50 game victories",
    category: "gaming",
    rarity: "epic",
    requirementType: "game_wins",
    requirementValue: 50,
    points: 300
  },
  {
    id: "5",
    name: "First Steps",
    description: "Join your first gaming lobby",
    category: "participation",
    rarity: "common",
    requirementType: "lobby_joined",
    requirementValue: 1,
    points: 10
  },
  {
    id: "6",
    name: "Welcome to NoobGG",
    description: "Complete your profile setup",
    category: "milestone",
    rarity: "common",
    requirementType: "profile_complete",
    requirementValue: 1,
    points: 15
  },
  {
    id: "7",
    name: "Early Adopter",
    description: "Join NoobGG in its first month",
    category: "special",
    rarity: "legendary",
    requirementType: "early_adopter",
    requirementValue: 1,
    points: 1000
  }
];

const mockUserAchievements: Achievement[] = [
  {
    ...mockAchievements[0],
    isCompleted: true,
    currentProgress: 1,
    earnedAt: "2024-01-15"
  },
  {
    ...mockAchievements[1],
    isCompleted: false,
    currentProgress: 7,
    progressPercentage: 70
  },
  {
    ...mockAchievements[2],
    isCompleted: true,
    currentProgress: 1,
    earnedAt: "2024-01-20"
  },
  {
    ...mockAchievements[4],
    isCompleted: true,
    currentProgress: 1,
    earnedAt: "2024-01-10"
  },
  {
    ...mockAchievements[5],
    isCompleted: true,
    currentProgress: 1,
    earnedAt: "2024-01-05"
  }
];

export default function AchievementsPage() {
  const totalPoints = mockUserAchievements
    .filter(a => a.isCompleted)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Track your gaming milestones and unlock rewards as you progress
        </p>
      </div>

      <AchievementsSummary
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        totalPoints={totalPoints}
      />

      <AchievementsGrid
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
        showProgress={true}
      />
    </div>
  );
}