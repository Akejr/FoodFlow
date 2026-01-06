import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    User,
    StudentProfile,
    NutritionGoals,
    DailyNutrition,
    MealLog,
    AiTip,
    UserStreak,
    OnboardingData
} from '../types';

interface AppState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Profile
    studentProfile: StudentProfile | null;
    nutritionGoals: NutritionGoals | null;

    // Daily Data
    todayNutrition: DailyNutrition | null;

    // Engagement
    streak: UserStreak | null;
    tips: AiTip[];

    // Onboarding
    onboardingData: Partial<OnboardingData>;
    onboardingStep: number;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setStudentProfile: (profile: StudentProfile) => void;
    setNutritionGoals: (goals: NutritionGoals) => void;
    setTodayNutrition: (nutrition: DailyNutrition) => void;
    addMealLog: (meal: MealLog) => void;
    setStreak: (streak: UserStreak) => void;
    setTips: (tips: AiTip[]) => void;
    updateOnboarding: (data: Partial<OnboardingData>) => void;
    setOnboardingStep: (step: number) => void;
    resetOnboarding: () => void;
    logout: () => void;
}

const initialOnboardingData: Partial<OnboardingData> = {};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial State
            user: null,
            isAuthenticated: false,
            isLoading: true,
            studentProfile: null,
            nutritionGoals: null,
            todayNutrition: null,
            streak: null,
            tips: [],
            onboardingData: initialOnboardingData,
            onboardingStep: 0,

            // Actions
            setUser: (user) => set({
                user,
                isAuthenticated: !!user
            }),

            setLoading: (isLoading) => set({ isLoading }),

            setStudentProfile: (studentProfile) => set({ studentProfile }),

            setNutritionGoals: (nutritionGoals) => set({ nutritionGoals }),

            setTodayNutrition: (todayNutrition) => set({ todayNutrition }),

            addMealLog: (meal) => {
                const { todayNutrition } = get();
                if (!todayNutrition) return;

                set({
                    todayNutrition: {
                        ...todayNutrition,
                        calories: todayNutrition.calories + meal.calories,
                        protein: todayNutrition.protein + meal.protein,
                        carbs: todayNutrition.carbs + meal.carbs,
                        fat: todayNutrition.fat + meal.fat,
                        meals: [...todayNutrition.meals, meal]
                    }
                });
            },

            setStreak: (streak) => set({ streak }),

            setTips: (tips) => set({ tips }),

            updateOnboarding: (data) => set((state) => ({
                onboardingData: { ...state.onboardingData, ...data }
            })),

            setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

            resetOnboarding: () => set({
                onboardingData: initialOnboardingData,
                onboardingStep: 0
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                studentProfile: null,
                nutritionGoals: null,
                todayNutrition: null,
                streak: null,
                tips: [],
                onboardingData: initialOnboardingData,
                onboardingStep: 0
            })
        }),
        {
            name: 'foodflow-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                studentProfile: state.studentProfile,
                nutritionGoals: state.nutritionGoals,
                onboardingData: state.onboardingData,
                onboardingStep: state.onboardingStep
            })
        }
    )
);
