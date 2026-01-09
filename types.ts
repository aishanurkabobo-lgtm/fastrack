
export interface WorkoutData {
  [date: string]: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementStats {
  points: number;
  level: number;
  nextLevelPoints: number;
  badges: Badge[];
  weeklyConsistency: number; // 0-7
}

export interface UserStats {
  streak: number;
  totalWorkouts: number;
  bestStreak: number;
  achievements: AchievementStats;
}

export enum GameType {
  FLAPPY = 'FLAPPY',
  DINO = 'DINO',
  NONE = 'NONE'
}

export interface MotivationMessage {
  text: string;
  author: string;
}
