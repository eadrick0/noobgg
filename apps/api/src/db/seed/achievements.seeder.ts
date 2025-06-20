import { db } from "../index";
import { achievements } from "../schemas/achievements.drizzle";

/*
 Simple seeder script for the `achievements` table.
 Usage (bun):
   bun run ts-node src/db/seed/achievements.seeder.ts
*/

async function seedAchievements() {
  // Check if table already has data
  const existing = await db.select().from(achievements).limit(1);
  if (existing.length > 0) {
    console.log("Achievements already exist. Skipping seeder.");
    return;
  }

  const achievementData = [
    // Social Achievements
    {
      name: "First Friend",
      description: "Add your first friend to your gaming network",
      iconUrl: "/icons/achievements/first-friend.svg",
      category: "social" as const,
      rarity: "common" as const,
      requirementType: "friend_count",
      requirementValue: 1,
      points: 10,
      displayOrder: 1,
    },
    {
      name: "Social Butterfly",
      description: "Build a network of 10 gaming friends",
      iconUrl: "/icons/achievements/social-butterfly.svg",
      category: "social" as const,
      rarity: "uncommon" as const,
      requirementType: "friend_count",
      requirementValue: 10,
      points: 50,
      displayOrder: 2,
    },
    {
      name: "Community Leader",
      description: "Reach 50 friends in your gaming network",
      iconUrl: "/icons/achievements/community-leader.svg",
      category: "social" as const,
      rarity: "rare" as const,
      requirementType: "friend_count",
      requirementValue: 50,
      points: 150,
      displayOrder: 3,
    },

    // Participation Achievements
    {
      name: "First Steps",
      description: "Join your first gaming lobby",
      iconUrl: "/icons/achievements/first-steps.svg",
      category: "participation" as const,
      rarity: "common" as const,
      requirementType: "lobby_joined",
      requirementValue: 1,
      points: 10,
      displayOrder: 10,
    },
    {
      name: "Active Gamer",
      description: "Join 25 gaming lobbies",
      iconUrl: "/icons/achievements/active-gamer.svg",
      category: "participation" as const,
      rarity: "uncommon" as const,
      requirementType: "lobby_joined",
      requirementValue: 25,
      points: 75,
      displayOrder: 11,
    },
    {
      name: "Lobby Legend",
      description: "Join 100 gaming lobbies",
      iconUrl: "/icons/achievements/lobby-legend.svg",
      category: "participation" as const,
      rarity: "rare" as const,
      requirementType: "lobby_joined",
      requirementValue: 100,
      points: 200,
      displayOrder: 12,
    },

    // Gaming Achievements
    {
      name: "Victory Royale",
      description: "Win your first game",
      iconUrl: "/icons/achievements/victory-royale.svg", 
      category: "gaming" as const,
      rarity: "common" as const,
      requirementType: "game_wins",
      requirementValue: 1,
      points: 25,
      displayOrder: 20,
    },
    {
      name: "Winning Streak",
      description: "Achieve 10 game victories",
      iconUrl: "/icons/achievements/winning-streak.svg",
      category: "gaming" as const,
      rarity: "uncommon" as const,
      requirementType: "game_wins",
      requirementValue: 10,
      points: 100,
      displayOrder: 21,
    },
    {
      name: "Champion",
      description: "Dominate with 50 game victories",
      iconUrl: "/icons/achievements/champion.svg",
      category: "gaming" as const,
      rarity: "epic" as const,
      requirementType: "game_wins",
      requirementValue: 50,
      points: 300,
      displayOrder: 22,
    },

    // Milestone Achievements
    {
      name: "Welcome to NoobGG",
      description: "Complete your profile setup",
      iconUrl: "/icons/achievements/welcome.svg",
      category: "milestone" as const,
      rarity: "common" as const,
      requirementType: "profile_complete",
      requirementValue: 1,
      points: 15,
      displayOrder: 30,
    },
    {
      name: "One Week Strong",
      description: "Stay active for 7 days",
      iconUrl: "/icons/achievements/one-week.svg",
      category: "milestone" as const,
      rarity: "uncommon" as const,
      requirementType: "days_active",
      requirementValue: 7,
      points: 50,
      displayOrder: 31,
    },
    {
      name: "Veteran",
      description: "One month of gaming excellence",
      iconUrl: "/icons/achievements/veteran.svg",
      category: "milestone" as const,
      rarity: "rare" as const,
      requirementType: "days_active",
      requirementValue: 30,
      points: 150,
      displayOrder: 32,
    },
    {
      name: "Noob No More",
      description: "Six months of gaming mastery",
      iconUrl: "/icons/achievements/noob-no-more.svg",
      category: "milestone" as const,
      rarity: "epic" as const,
      requirementType: "days_active",
      requirementValue: 180,
      points: 500,
      displayOrder: 33,
    },

    // Special Achievements
    {
      name: "Early Adopter",
      description: "Join NoobGG in its first month",
      iconUrl: "/icons/achievements/early-adopter.svg",
      category: "special" as const,
      rarity: "legendary" as const,
      requirementType: "early_adopter",
      requirementValue: 1,
      points: 1000,
      displayOrder: 40,
    },
    {
      name: "Beta Tester",
      description: "Help test new features",
      iconUrl: "/icons/achievements/beta-tester.svg",
      category: "special" as const,
      rarity: "epic" as const,
      requirementType: "beta_participation",
      requirementValue: 1,
      points: 250,
      displayOrder: 41,
    },
    {
      name: "Tournament Warrior",
      description: "Participate in a tournament",
      iconUrl: "/icons/achievements/tournament-warrior.svg",
      category: "special" as const,
      rarity: "rare" as const,
      requirementType: "tournament_participation",
      requirementValue: 1,
      points: 200,
      displayOrder: 42,
    }
  ];

  const rows = achievementData.map(achievement => ({
    ...achievement,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(achievements).values(rows);

  console.log(`Seeded ${rows.length} achievements.`);
}

seedAchievements()
  .then(() => {
    console.log("Achievements seeding complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding achievements:", err);
    process.exit(1);
  });