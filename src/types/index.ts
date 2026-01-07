// User Types
export type UserRole = 'student' | 'trainer';
export type UserGoal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Sex = 'male' | 'female' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    trainerId?: string;
    avatarUrl?: string;
    createdAt: string;
}

export interface StudentProfile {
    id: string;
    userId: string;
    age: number;
    sex: Sex;
    heightCm: number;
    weightKg: number;
    goal: UserGoal;
    activityLevel: ActivityLevel;
    updatedAt: string;
}

// Nutrition Types
export interface NutritionGoals {
    id: string;
    userId: string;
    calories: number;
    proteinG: number;
    carbsMinG: number;
    carbsMaxG: number;
    fatMinG: number;
    fatMaxG: number;
    calculatedAt: string;
}

export interface Food {
    id: string;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    isCustom: boolean;
    createdBy?: string;
}

export interface MealLog {
    id: string;
    userId: string;
    foodId?: string;
    foodName: string;
    quantityG: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: MealType;
    loggedAt: string;
}

export interface DailyNutrition {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meals: MealLog[];
}

// AI Types
export type TipType = 'daily' | 'weekly' | 'achievement' | 'warning' | 'info';

export interface AiTip {
    id: string;
    userId: string;
    tipText: string;
    tipType: TipType;
    createdAt: string;
    isRead: boolean;
}

// Engagement Types
export interface UserStreak {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastLogDate: string;
    weeklyAdherence: number; // percentage
}

// Subscription Types
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface Subscription {
    id: string;
    userId: string;
    trainerId: string;
    status: SubscriptionStatus;
    infinitypaySubscriptionId?: string;
    startedAt: string;
    expiresAt: string;
}

// Trainer Types
export type StudentStatus = 'green' | 'yellow' | 'red';

export interface TrainerStudent {
    id: string;
    fullName: string;
    avatarUrl?: string;
    status: StudentStatus;
    lastActivity: string;
    currentStreak: number;
    weeklyAdherence: number;
}

// Onboarding Types
export interface OnboardingData {
    email: string;
    password: string;
    fullName: string;
    age: number;
    sex: Sex;
    heightCm: number;
    weightKg: number;
    goal: UserGoal;
    activityLevel: ActivityLevel;
}

// Plan Options
export interface NutritionPlan {
    id: string;
    name: string;
    description: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isRecommended: boolean;
}
