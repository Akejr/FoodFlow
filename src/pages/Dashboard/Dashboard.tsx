import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { ProgressBar } from '../../components/ui';
import { BottomNav } from '../../components/BottomNav';
import { DashboardSkeleton } from './DashboardSkeleton';
import type { MealLog } from '../../types';
import './Dashboard.css';

export const Dashboard = () => {
    const {
        user,
        nutritionGoals,
        dashboardConsumed,
        dashboardLoaded,
        setDashboardConsumed
    } = useAppStore();

    const [showTip, setShowTip] = useState(true);
    const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });

    const loadTodayMeals = useCallback(async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const today = new Date().toISOString().split('T')[0];
            const { data: meals } = await supabase
                .from('meal_logs')
                .select('*')
                .eq('user_id', authUser.id)
                .gte('logged_at', `${today}T00:00:00`)
                .lte('logged_at', `${today}T23:59:59`);

            if (meals && meals.length > 0) {
                const totals = meals.reduce((acc: typeof dashboardConsumed, meal: MealLog) => ({
                    calories: acc.calories + meal.calories,
                    protein: acc.protein + meal.protein,
                    carbs: acc.carbs + meal.carbs,
                    fat: acc.fat + meal.fat
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                setDashboardConsumed(totals);
            } else {
                setDashboardConsumed({ calories: 0, protein: 0, carbs: 0, fat: 0 });
            }
        } catch (error) {
            console.error('Erro ao carregar refeições:', error);
            if (!dashboardLoaded) {
                setDashboardConsumed({ calories: 0, protein: 0, carbs: 0, fat: 0 });
            }
        }
    }, [setDashboardConsumed, dashboardLoaded]);

    useEffect(() => {
        loadTodayMeals();
    }, [loadTodayMeals]);

    // Só mostra skeleton na primeira vez
    if (!dashboardLoaded) {
        return <DashboardSkeleton />;
    }

    // Calcular percentuais
    const goals = {
        calories: nutritionGoals?.calories || 2000,
        protein: nutritionGoals?.proteinG || 150,
        carbs: (nutritionGoals?.carbsMinG || 200),
        fat: (nutritionGoals?.fatMinG || 50)
    };

    const caloriesPercentage = Math.min(Math.round((dashboardConsumed.calories / goals.calories) * 100), 100);
    const userName = user?.fullName?.split(' ')[0] || 'Usuário';
    const userAvatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face';

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <div className="dashboard__greeting">
                    <span className="dashboard__date">{date}</span>
                    <h1 className="dashboard__title">Olá, {userName}</h1>
                </div>
                <div className="dashboard__avatar">
                    <img src={userAvatar} alt={userName} />
                    <div className="dashboard__avatar-badge">
                        <span className="material-symbols-outlined">sync</span>
                    </div>
                </div>
            </header>

            {/* AI Tip */}
            {showTip && dashboardConsumed.calories > 0 && (
                <div className="dashboard__tip">
                    <div className="dashboard__tip-icon">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <p>
                        Ótimo progresso! Você já consumiu <strong>{dashboardConsumed.calories} kcal</strong> de {goals.calories} kcal.
                        {dashboardConsumed.calories < goals.calories * 0.5 && ' Continue assim!'}
                    </p>
                    <button
                        className="dashboard__tip-close"
                        onClick={() => setShowTip(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {/* Calories Card */}
            <section className="dashboard__calories">
                <div className="dashboard__calories-glow" />
                <div className="dashboard__calories-content">
                    <div className="dashboard__calories-header">
                        <div className="dashboard__calories-label">
                            <div className="dashboard__calories-icon">
                                <span className="material-symbols-outlined">local_fire_department</span>
                            </div>
                            <div>
                                <h3>Calorias</h3>
                                <span>Meta Diária</span>
                            </div>
                        </div>
                        <div className="dashboard__calories-values">
                            <div className="dashboard__calories-current">
                                <span className="value">{dashboardConsumed.calories.toLocaleString('pt-BR')}</span>
                                <span className="max">/ {goals.calories.toLocaleString('pt-BR')}</span>
                            </div>
                            <span className="dashboard__calories-percentage">{caloriesPercentage}% Consumido</span>
                        </div>
                    </div>

                    <div className="dashboard__calories-bar">
                        <div
                            className="dashboard__calories-fill"
                            style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
                        />
                    </div>

                    <div className="dashboard__calories-meals">
                        <span>Café</span>
                        <span>Almoço</span>
                        <span className="active">Jantar?</span>
                    </div>
                </div>
            </section>

            {/* Macros Section */}
            <section className="dashboard__macros">
                <h2 className="dashboard__macros-title">
                    Macros
                    <span className="dashboard__macros-badge">Resumo</span>
                </h2>

                <div className="dashboard__macros-list">
                    <ProgressBar
                        value={dashboardConsumed.protein}
                        max={goals.protein}
                        label="Proteínas"
                        sublabel={`${Math.max(0, goals.protein - dashboardConsumed.protein)}g restantes`}
                        icon="egg_alt"
                    />

                    <ProgressBar
                        value={dashboardConsumed.carbs}
                        max={goals.carbs}
                        label="Carboidratos"
                        sublabel={`${Math.max(0, goals.carbs - dashboardConsumed.carbs)}g restantes`}
                        icon="bakery_dining"
                    />

                    <ProgressBar
                        value={dashboardConsumed.fat}
                        max={goals.fat}
                        label="Gorduras"
                        sublabel=""
                        icon="water_drop"
                        exceeded={dashboardConsumed.fat > goals.fat}
                    />
                </div>
            </section>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
