export interface Exercise {
  id: string;
  name: string;
  reps: string;
  note?: string;
}

export interface WorkoutDay {
  id: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  name: string;
  focus: string;
  rounds: number;
  exercises: Exercise[];
}

export interface MealItem {
  id: string;
  name: string;
  description: string;
  time: string;
  group?: string; // Optional collapsible named group
}

export interface ProteinSource {
  id: string;
  emoji: string;
  name: string;
  note: string;
  proteinAmount: string;
  group?: string;
}

export interface MacroTargets {
  calories: number;
  caloriesUnit: string;
  protein: number;
  proteinUnit: string;
  carbs: number;
  carbsUnit: string;
  fat: number;
  fatUnit: string;
}

export interface UserStats {
  weight: string;
  activityLevel: string;
  goal: string;
}

export interface UserConfig {
  workouts: Record<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN', WorkoutDay>;
  meals: MealItem[];
  proteinSources: ProteinSource[];
  macroTargets: MacroTargets;
  userStats: UserStats;
}

export interface TodayState {
  date: string; // BST YYYY-MM-DD
  workout: Record<string, { roundsCompleted?: number; [key: string]: any }>; // { MON: { roundsCompleted: 2, ex_id_1: true } }
  diet: {
    meals: Record<string, boolean>; // { meal_id_1: true }
    macros: {
      calories: boolean;
      protein: boolean;
      carbs: boolean;
      fat: boolean;
    };
  };
}

export interface HistoryEntry {
  id: string;
  date: string; // Formatted date e.g. "Mon, 9 Jun 2026"
  rawDate: string; // YYYY-MM-DD
  dayId: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  dayName: string;
  focus: string;
  workoutSnapshot: {
    total: number;
    completed: number;
    roundsCompleted?: number;
    roundsTotal?: number;
    exercises: (Exercise & { completed: boolean })[];
  };
  dietSnapshot: {
    mealsTotal: number;
    mealsCompleted: number;
    macrosTotal: number;
    macrosCompleted: number;
    meals: (MealItem & { completed: boolean })[];
    macros: {
      calories: boolean;
      protein: boolean;
      carbs: boolean;
      fat: boolean;
    };
  };
  status: 'Full' | 'Partial' | 'Skipped';
}
