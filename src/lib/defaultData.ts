import { UserConfig, WorkoutDay, MealItem, ProteinSource, MacroTargets, UserStats, TodayState } from '../types';

export const DEFAULT_USER_STATS: UserStats = {
  weight: '50 kg',
  activityLevel: 'Very Active',
  goal: 'Lean Bulk',
};

export const DEFAULT_MACRO_TARGETS: MacroTargets = {
  calories: 2700,
  caloriesUnit: 'kcal',
  protein: 110,
  proteinUnit: 'g',
  carbs: 370,
  carbsUnit: 'g',
  fat: 80,
  fatUnit: 'g',
};

export const DEFAULT_WORKOUTS: Record<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN', WorkoutDay> = {
  MON: {
    id: 'MON',
    name: 'MONDAY',
    focus: 'Push + Abs',
    rounds: 3,
    exercises: [
      { id: 'mon_1', name: 'Push-ups', reps: '20' },
      { id: 'mon_2', name: 'Diamond Push-ups', reps: '10' },
      { id: 'mon_3', name: 'Dips', reps: '15' },
      { id: 'mon_4', name: 'Pike Push-ups', reps: '10' },
      { id: 'mon_5', name: 'Backpack Rows', reps: '12' },
      { id: 'mon_6', name: 'Body Hollow Hold', reps: '30 sec' },
      { id: 'mon_7', name: 'Leg Raises', reps: '15' },
      { id: 'mon_8', name: 'Toe Touches', reps: '20' },
    ],
  },
  TUE: {
    id: 'TUE',
    name: 'TUESDAY',
    focus: 'Legs – Power',
    rounds: 3,
    exercises: [
      { id: 'tue_1', name: 'Squats', reps: '25' },
      { id: 'tue_2', name: 'Lunges', reps: '12 each' },
      { id: 'tue_3', name: 'Lateral Lunges', reps: '10 each' },
      { id: 'tue_4', name: 'Jump Squats', reps: '12' },
      { id: 'tue_5', name: 'Calf Raises', reps: '30' },
      { id: 'tue_6', name: 'Glute Bridges', reps: '20' },
      { id: 'tue_7', name: 'Single-leg Deadlift', reps: '10 each', note: 'use backpack' },
    ],
  },
  WED: {
    id: 'WED',
    name: 'WEDNESDAY',
    focus: 'Abs + Light Upper',
    rounds: 3,
    exercises: [
      { id: 'wed_1', name: 'Body Hollow Hold', reps: '30 sec' },
      { id: 'wed_2', name: 'Leg Raises', reps: '15' },
      { id: 'wed_3', name: 'Russian Twists', reps: '20 each' },
      { id: 'wed_4', name: 'Bicycle Crunches', reps: '20 each' },
      { id: 'wed_5', name: 'Sit-ups', reps: '15' },
      { id: 'wed_6', name: 'Push-ups', reps: '15' },
      { id: 'wed_7', name: 'Backpack Bicep Curls', reps: '15' },
    ],
  },
  THU: {
    id: 'THU',
    name: 'THURSDAY',
    focus: 'Push + Back',
    rounds: 3,
    exercises: [
      { id: 'thu_1', name: 'Push-ups', reps: '20' },
      { id: 'thu_2', name: 'Decline Push-ups', reps: '12', note: 'feet elevated on chair' },
      { id: 'thu_3', name: 'Dips', reps: '15' },
      { id: 'thu_4', name: 'Backpack Rows', reps: '12 x3 sets', note: 'finish all 3 sets before moving on' },
      { id: 'thu_5', name: 'Wall Hang', reps: '20 sec' },
      { id: 'thu_6', name: 'Dead Hang', reps: '30 sec' },
      { id: 'thu_7', name: 'Russian Twists', reps: '20 each' },
    ],
  },
  FRI: {
    id: 'FRI',
    name: 'FRIDAY',
    focus: 'Upper Only',
    rounds: 3,
    exercises: [
      { id: 'fri_1', name: 'Push-ups', reps: '20' },
      { id: 'fri_2', name: 'Dips', reps: '15' },
      { id: 'fri_3', name: 'Backpack Rows', reps: '12' },
      { id: 'fri_4', name: 'Pike Push-ups', reps: '10' },
      { id: 'fri_5', name: 'Backpack Bicep Curls', reps: '15' },
      { id: 'fri_6', name: 'Body Hollow Hold', reps: '30 sec' },
    ],
  },
  SAT: {
    id: 'SAT',
    name: 'SATURDAY',
    focus: 'Abs Only',
    rounds: 3,
    exercises: [
      { id: 'sat_1', name: 'Body Hollow Hold', reps: '30 sec' },
      { id: 'sat_2', name: 'Leg Raises', reps: '15' },
      { id: 'sat_3', name: 'Toe Touches', reps: '20' },
      { id: 'sat_4', name: 'Sit-ups', reps: '15' },
      { id: 'sat_5', name: 'Plank', reps: '45 sec' },
      { id: 'sat_6', name: 'Mountain Climbers', reps: '20' },
    ],
  },
  SUN: {
    id: 'SUN',
    name: 'SUNDAY',
    focus: 'Legs – Strength',
    rounds: 3,
    exercises: [
      { id: 'sun_1', name: 'Squats', reps: '25' },
      { id: 'sun_2', name: 'Lunges', reps: '12 each' },
      { id: 'sun_3', name: 'Glute Bridges', reps: '20' },
      { id: 'sun_4', name: 'Calf Raises', reps: '30' },
      { id: 'sun_5', name: 'Tuck Jumps', reps: '10' },
      { id: 'sun_6', name: 'Nordic Curl', reps: '10', note: 'hook feet under something heavy, lower slowly' },
    ],
  },
};

export const DEFAULT_MEALS: MealItem[] = [
  {
    id: 'meal_1',
    name: 'On Waking — Lemon Water',
    description: 'warm water + lemon + turmeric + honey, empty stomach',
    time: '07:00',
    group: 'Morning',
  },
  {
    id: 'meal_2',
    name: 'Breakfast — 3–4 Eggs',
    description: 'any style, add bread or oats',
    time: '08:00',
    group: 'Morning',
  },
  {
    id: 'meal_3',
    name: 'Lunch — Full Balanced Meal',
    description: 'protein + carbs + vegetables',
    time: '13:00',
    group: 'Afternoon & Night',
  },
  {
    id: 'meal_4',
    name: 'Pre-Workout — Carbs + Protein',
    description: 'rice or oats + banana + egg or chicken, 1–2 hrs before',
    time: '16:00',
    group: 'Workout Window',
  },
  {
    id: 'meal_5',
    name: 'Post-Workout — Main Recovery Meal',
    description: 'chicken or eggs + rice, within 1 hour after',
    time: '18:30',
    group: 'Workout Window',
  },
  {
    id: 'meal_6',
    name: 'Before Bed — Slow Protein',
    description: 'eggs, milk, or Greek yogurt',
    time: '22:00',
    group: 'Afternoon & Night',
  },
];

export const DEFAULT_PROTEIN_SOURCES: ProteinSource[] = [
  { id: 'prot_1', emoji: '🥚', name: 'Eggs', note: 'Eat 4–6 daily', proteinAmount: '6g each', group: 'Daily Staples' },
  { id: 'prot_2', emoji: '🍗', name: 'Chicken Breast', note: 'Eat daily if possible', proteinAmount: '25g/100g', group: 'Daily Staples' },
  { id: 'prot_3', emoji: '🐟', name: 'Tuna (canned)', note: 'No cooking needed', proteinAmount: '25g/100g', group: 'Daily Staples' },
  { id: 'prot_4', emoji: '🥛', name: 'Whole Milk', note: 'Great for bulking', proteinAmount: '8g/cup', group: 'Secondary Options' },
  { id: 'prot_5', emoji: '🐄', name: 'Beef / Lamb', note: 'High protein + iron', proteinAmount: '25g/100g', group: 'Secondary Options' },
  { id: 'prot_6', emoji: '🫙', name: 'Greek Yogurt', note: 'Good before bed', proteinAmount: '15g/cup', group: 'Secondary Options' },
  { id: 'prot_7', emoji: '🐠', name: 'Salmon / Fish', note: 'Good for recovery', proteinAmount: '22g/100g', group: 'Secondary Options' },
];

export const DEFAULT_CONFIG: UserConfig = {
  workouts: DEFAULT_WORKOUTS,
  meals: DEFAULT_MEALS,
  proteinSources: DEFAULT_PROTEIN_SOURCES,
  macroTargets: DEFAULT_MACRO_TARGETS,
  userStats: DEFAULT_USER_STATS,
};

export const getInitialTodayState = (dateStr: string): TodayState => ({
  date: dateStr,
  workout: {
    MON: { roundsCompleted: 0 },
    TUE: { roundsCompleted: 0 },
    WED: { roundsCompleted: 0 },
    THU: { roundsCompleted: 0 },
    FRI: { roundsCompleted: 0 },
    SAT: { roundsCompleted: 0 },
    SUN: { roundsCompleted: 0 },
  },
  diet: {
    meals: {},
    macros: {
      calories: false,
      protein: false,
      carbs: false,
      fat: false,
    },
  },
});
