import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { useAppStore } from '../stores/appStore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { setUser: setStoreUser, logout: logoutStore } = useAppStore();

    useEffect(() => {
        console.log('AuthProvider mounted');

        // Timeout de segurança para loading
        const timeout = setTimeout(() => {
            console.warn('Auth check timeout - forcing loading false');
            setLoading(false);
        }, 5000);

        // Verificar sessão atual
        const checkSession = async () => {
            try {
                console.log('Checking session...');
                const { data: { session } = {} } = await supabase.auth.getSession(); // Added default empty object for data
                console.log('Session found:', !!session);

                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('Loading user data for:', session.user.id);
                    await loadUserData(session.user.id);
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
            } finally {
                console.log('Session check complete');
                setLoading(false);
                clearTimeout(timeout);
            }
        };

        checkSession();

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state change:', event);
                setUser(session?.user ?? null);

                if (event === 'SIGNED_IN' && session?.user) {
                    await loadUserData(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    logoutStore();
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const loadUserData = async (userId: string) => {
        try {
            console.log('🔍 Loading user data for userId:', userId);

            // Buscar perfil básico
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('📋 Profile data:', profile);
            console.log('❌ Profile error:', profileError);

            if (profile) {
                // Tentar pegar nome do metadata se não vier do banco
                const { data: { user: authUser } } = await supabase.auth.getUser();
                const fullName = profile.full_name || authUser?.user_metadata?.full_name || 'Usuário';

                console.log('👤 Full name resolved:', fullName);
                console.log('📧 Email:', profile.email);

                setStoreUser({
                    id: profile.id,
                    email: profile.email,
                    fullName: fullName,
                    role: profile.role,
                    trainerId: profile.trainer_id,
                    avatarUrl: profile.avatar_url,
                    createdAt: profile.created_at
                });

                console.log('✅ User set in store');
            }

            // Buscar student_profile
            const { data: studentProfile, error: studentError } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            console.log('🏋️ Student profile:', studentProfile);
            console.log('❌ Student error:', studentError);

            if (studentProfile) {
                useAppStore.getState().setStudentProfile({
                    id: studentProfile.id,
                    userId: studentProfile.user_id,
                    age: studentProfile.age,
                    sex: studentProfile.sex,
                    heightCm: studentProfile.height_cm,
                    weightKg: studentProfile.weight_kg,
                    goal: studentProfile.goal,
                    activityLevel: studentProfile.activity_level,
                    updatedAt: studentProfile.updated_at
                });
            }

            // Buscar nutrition_goals
            const { data: goals } = await supabase
                .from('nutrition_goals')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (goals) {
                useAppStore.getState().setNutritionGoals({
                    id: goals.id,
                    userId: goals.user_id,
                    calories: goals.calories,
                    proteinG: goals.protein_g,
                    carbsMinG: goals.carbs_min_g,
                    carbsMaxG: goals.carbs_max_g,
                    fatMinG: goals.fat_min_g,
                    fatMaxG: goals.fat_max_g,
                    calculatedAt: goals.calculated_at
                });
            }

            // Buscar user_streaks
            const { data: streak } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (streak) {
                useAppStore.getState().setStreak({
                    userId: streak.user_id,
                    currentStreak: streak.current_streak,
                    longestStreak: streak.longest_streak,
                    lastLogDate: streak.last_log_date,
                    weeklyAdherence: streak.weekly_adherence
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    };

    const signOut = async () => {
        console.log('🚪 Signing out...');

        // Timeout de 3 segundos
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Logout timeout')), 3000)
        );

        try {
            await Promise.race([
                supabase.auth.signOut(),
                timeoutPromise
            ]);
        } catch (error) {
            console.warn('⚠️ Logout timeout ou erro, limpando estado mesmo assim');
        }

        // Limpar estado local E store - garantir redirecionamento
        setUser(null);
        logoutStore();
        console.log('✅ Signed out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
