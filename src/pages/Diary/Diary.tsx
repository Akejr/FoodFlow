import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { generateNutritionInsight } from '../../services/openai';
import { BottomNav } from '../../components/BottomNav';
import { DiarySkeleton } from './DiarySkeleton';
import type { MealLog } from '../../types';
import './Diary.css';

const mealTypeLabels: Record<string, { name: string; icon: string; color: string }> = {
    breakfast: { name: 'Café da Manhã', icon: 'wb_twilight', color: 'orange' },
    lunch: { name: 'Almoço', icon: 'sunny', color: 'yellow' },
    dinner: { name: 'Jantar', icon: 'dark_mode', color: 'blue' },
    snack: { name: 'Lanche', icon: 'tapas', color: 'purple' }
};

export const Diary = () => {
    const navigate = useNavigate();
    const { 
        nutritionGoals,
        diaryLoaded,
        cachedDiaryMeals,
        cachedDiaryConsumed,
        setCachedDiaryData
    } = useAppStore();

    // Date navigation
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data states - inicializa com cache se disponível
    const [meals, setMeals] = useState<MealLog[]>(diaryLoaded ? cachedDiaryMeals : []);
    const [loading, setLoading] = useState(!diaryLoaded); // Só carrega se não tiver cache
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    // Totals - inicializa com cache se disponível
    const [consumed, setConsumed] = useState(
        diaryLoaded ? cachedDiaryConsumed : { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // AI Insight
    const [insight, setInsight] = useState<{
        title: string;
        description: string;
        tips: string[];
    } | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    // Goals
    const goals = {
        calories: nutritionGoals?.calories || 2000,
        protein: nutritionGoals?.proteinG || 150,
        carbs: nutritionGoals?.carbsMinG || 200,
        fat: nutritionGoals?.fatMinG || 50
    };

    // Format date for display
    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return {
                main: 'Hoje',
                sub: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
            };
        } else if (date.toDateString() === yesterday.toDateString()) {
            return {
                main: 'Ontem',
                sub: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
            };
        } else {
            return {
                main: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
                sub: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
            };
        }
    };

    // Navigate dates
    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        if (newDate <= new Date()) {
            setSelectedDate(newDate);
        }
    };

    // Load meals for selected date
    const loadMeals = async () => {
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Usuário não autenticado');
                setLoading(false);
                return;
            }

            const dateStr = selectedDate.toISOString().split('T')[0];
            const startOfDay = `${dateStr}T00:00:00`;
            const endOfDay = `${dateStr}T23:59:59`;

            const { data: mealData, error: dbError } = await supabase
                .from('meal_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('logged_at', startOfDay)
                .lte('logged_at', endOfDay)
                .order('logged_at', { ascending: true });

            if (dbError) throw dbError;

            setMeals(mealData || []);

            // Calculate totals
            if (mealData && mealData.length > 0) {
                const totals = mealData.reduce(
                    (acc, meal) => ({
                        calories: acc.calories + (meal.calories || 0),
                        protein: acc.protein + (meal.protein || 0),
                        carbs: acc.carbs + (meal.carbs || 0),
                        fat: acc.fat + (meal.fat || 0)
                    }),
                    { calories: 0, protein: 0, carbs: 0, fat: 0 }
                );
                setConsumed(totals);
                
                // Salva no cache
                setCachedDiaryData(mealData, totals);
            } else {
                const emptyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                setConsumed(emptyTotals);
                
                // Salva cache vazio
                setCachedDiaryData([], emptyTotals);
            }
        } catch (err: any) {
            console.error('Erro ao carregar refeições:', err);
            setError(err.message || 'Erro ao carregar dados');
            
            // Se falhar e não tiver cache, limpa
            if (!diaryLoaded) {
                setMeals([]);
                setConsumed({ calories: 0, protein: 0, carbs: 0, fat: 0 });
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete meal
    const handleDeleteMeal = async (mealId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta refeição?')) return;

        setDeleting(mealId);
        try {
            const { error } = await supabase
                .from('meal_logs')
                .delete()
                .eq('id', mealId);

            if (error) throw error;

            // Reload meals after deletion
            await loadMeals();
        } catch (err: any) {
            console.error('Erro ao excluir refeição:', err);
            alert('Erro ao excluir refeição');
        } finally {
            setDeleting(null);
        }
    };

    // Load data on date change
    useEffect(() => {
        loadMeals();
    }, [selectedDate]);

    // Generate AI insight when meals change
    useEffect(() => {
        // Não gera insight se estiver carregando ou não tiver refeições
        if (loading || meals.length === 0) {
            setInsight(null);
            return;
        }

        const generateInsight = async () => {
            setLoadingInsight(true);
            try {
                const result = await generateNutritionInsight(
                    meals.map((m) => ({
                        food_name: m.foodName,
                        calories: m.calories,
                        protein: m.protein,
                        carbs: m.carbs,
                        fat: m.fat,
                        meal_type: m.mealType
                    })),
                    {
                        calories: goals.calories,
                        proteinG: goals.protein,
                        carbsMinG: goals.carbs,
                        fatMinG: goals.fat
                    },
                    consumed
                );

                if (result.success && result.insight) {
                    setInsight(result.insight);
                }
            } catch (error) {
                console.error('Erro ao gerar insight:', error);
            } finally {
                setLoadingInsight(false);
            }
        };

        // Delay para não gerar insight imediatamente
        const timer = setTimeout(() => {
            generateInsight();
        }, 1000);

        return () => clearTimeout(timer);
    }, [meals.length, consumed.calories]); // Dependências simplificadas

    // Group meals by type
    const mealsByType = meals.reduce((acc, meal) => {
        const type = meal.mealType || 'snack';
        if (!acc[type]) acc[type] = [];
        acc[type].push(meal);
        return acc;
    }, {} as Record<string, MealLog[]>);

    const { main: dateMain, sub: dateSub } = formatDate(selectedDate);
    const caloriesRemaining = Math.max(0, goals.calories - consumed.calories);
    const caloriesPercentage = Math.min(Math.round((consumed.calories / goals.calories) * 100), 100);
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // Só mostra skeleton na primeira vez (quando não tem cache)
    if (!diaryLoaded && loading) {
        return <DiarySkeleton />;
    }

    return (
        <div className="diary">
            {/* Header with Date Navigation */}
            <header className="diary__header">
                <button className="diary__nav-btn" onClick={goToPreviousDay}>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="diary__date">
                    <h2 className="diary__date-title">{dateMain}</h2>
                    <span className="diary__date-subtitle">{dateSub}</span>
                </div>
                <button
                    className="diary__nav-btn"
                    onClick={goToNextDay}
                    disabled={isToday}
                    style={{ opacity: isToday ? 0.3 : 1 }}
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </header>

            {/* Content */}
            <main className="diary__content">
                {error ? (
                    <div className="diary__error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                        <button className="diary__retry-btn" onClick={loadMeals}>
                            Tentar Novamente
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Calories Card */}
                        <section className="diary__calories-card">
                            <div className="diary__calories-header">
                                <div className="diary__calories-info">
                                    <p className="diary__calories-label">Calorias Disponíveis</p>
                                    <div className="diary__calories-value">
                                        <span className="diary__calories-main">{caloriesRemaining}</span>
                                        <span className="diary__calories-max">/ {goals.calories} kcal</span>
                                    </div>
                                </div>
                                <div className="diary__calories-icon">
                                    <span className="material-symbols-outlined">local_fire_department</span>
                                </div>
                            </div>
                            <div className="diary__calories-progress-section">
                                <div className="diary__calories-stats">
                                    <span>{caloriesPercentage}% da meta</span>
                                    <span>{consumed.calories} consumidas</span>
                                </div>
                                <div className="diary__calories-progress">
                                    <div
                                        className="diary__calories-progress-fill"
                                        style={{ width: `${caloriesPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Macros Grid */}
                        <section className="diary__macros-grid">
                            <div className="diary__macro-card diary__macro-card--protein">
                                <div className="diary__macro-bg-icon">
                                    <span className="material-symbols-outlined">egg_alt</span>
                                </div>
                                <p className="diary__macro-label">Proteína</p>
                                <p className="diary__macro-value">{Math.round(consumed.protein)}g</p>
                                <div className="diary__macro-progress">
                                    <div
                                        className="diary__macro-progress-fill diary__macro-progress-fill--protein"
                                        style={{
                                            width: `${Math.min((consumed.protein / goals.protein) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="diary__macro-goal">Meta: {goals.protein}g</p>
                            </div>

                            <div className="diary__macro-card diary__macro-card--carbs">
                                <div className="diary__macro-bg-icon">
                                    <span className="material-symbols-outlined">bakery_dining</span>
                                </div>
                                <p className="diary__macro-label">Carbos</p>
                                <p className="diary__macro-value">{Math.round(consumed.carbs)}g</p>
                                <div className="diary__macro-progress">
                                    <div
                                        className="diary__macro-progress-fill diary__macro-progress-fill--carbs"
                                        style={{
                                            width: `${Math.min((consumed.carbs / goals.carbs) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="diary__macro-goal">Meta: {goals.carbs}g</p>
                            </div>

                            <div className="diary__macro-card diary__macro-card--fat">
                                <div className="diary__macro-bg-icon">
                                    <span className="material-symbols-outlined">oil_barrel</span>
                                </div>
                                <p className="diary__macro-label">Gorduras</p>
                                <p className="diary__macro-value">{Math.round(consumed.fat)}g</p>
                                <div className="diary__macro-progress">
                                    <div
                                        className="diary__macro-progress-fill diary__macro-progress-fill--fat"
                                        style={{
                                            width: `${Math.min((consumed.fat / goals.fat) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="diary__macro-goal">Meta: {goals.fat}g</p>
                            </div>
                        </section>

                        {/* AI Insight */}
                        {meals.length > 0 && (
                            <section className="diary__ai-card">
                                <div className="diary__ai-glow"></div>
                                <div className="diary__ai-content">
                                    <div className="diary__ai-header">
                                        <span className="material-symbols-outlined">
                                            {loadingInsight ? 'sync' : 'auto_awesome'}
                                        </span>
                                        <p className="diary__ai-tag">Insight da IA</p>
                                    </div>
                                    {loadingInsight ? (
                                        <div className="diary__ai-loading">
                                            <p>Analisando suas refeições...</p>
                                        </div>
                                    ) : insight ? (
                                        <>
                                            <h3 className="diary__ai-title">{insight.title}</h3>
                                            <p className="diary__ai-description">{insight.description}</p>
                                            {insight.tips && insight.tips.length > 0 && (
                                                <div className="diary__ai-tips">
                                                    {insight.tips.map((tip, i) => (
                                                        <div key={i} className="diary__ai-tip">
                                                            <span className="material-symbols-outlined">
                                                                lightbulb
                                                            </span>
                                                            <span>{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="diary__ai-loading">
                                            <p>Gerando insights personalizados...</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Meals Header */}
                        <div className="diary__meals-header">
                            <h2 className="diary__meals-title">Refeições</h2>
                        </div>

                        {/* Meals List */}
                        <section className="diary__meals">
                            {meals.length === 0 ? (
                                <div className="diary__empty">
                                    <span className="material-symbols-outlined">restaurant</span>
                                    <p>Nenhuma refeição registrada</p>
                                    <button
                                        className="diary__empty-btn"
                                        onClick={() => navigate('/add-meal')}
                                    >
                                        Adicionar Refeição
                                    </button>
                                </div>
                            ) : (
                                Object.entries(mealsByType).map(([type, typeMeals]) => {
                                    const typeInfo = mealTypeLabels[type] || mealTypeLabels.snack;
                                    const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

                                    return (
                                        <article key={type} className="diary__meal">
                                            <div
                                                className={`diary__meal-header diary__meal-header--${typeInfo.color}`}
                                            >
                                                <div className="diary__meal-info">
                                                    <div
                                                        className={`diary__meal-icon diary__meal-icon--${typeInfo.color}`}
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {typeInfo.icon}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="diary__meal-name">{typeInfo.name}</h3>
                                                        <p className="diary__meal-time">
                                                            {typeMeals.length} item(s)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="diary__meal-calories">
                                                    <span className="diary__meal-calories-value">
                                                        {typeCalories}
                                                    </span>
                                                    <span className="diary__meal-calories-unit">kcal</span>
                                                </div>
                                            </div>

                                            <div className="diary__meal-foods">
                                                {typeMeals.map((meal) => (
                                                    <div key={meal.id} className="diary__food-item">
                                                        <div className="diary__food-name">
                                                            <div className="diary__food-bullet"></div>
                                                            <span>{meal.foodName}</span>
                                                        </div>
                                                        <div className="diary__food-actions">
                                                            <span className="diary__food-calories">
                                                                {meal.calories} kcal
                                                            </span>
                                                            <button
                                                                className="diary__food-delete"
                                                                onClick={() => handleDeleteMeal(meal.id)}
                                                                disabled={deleting === meal.id}
                                                            >
                                                                <span className="material-symbols-outlined">
                                                                    {deleting === meal.id ? 'sync' : 'delete'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="diary__meal-macros">
                                                <div className="diary__meal-macro diary__meal-macro--protein">
                                                    <div className="diary__meal-macro-dot"></div>
                                                    <span>
                                                        {Math.round(
                                                            typeMeals.reduce((s, m) => s + m.protein, 0)
                                                        )}
                                                        g Prot
                                                    </span>
                                                </div>
                                                <div className="diary__meal-macro diary__meal-macro--carbs">
                                                    <div className="diary__meal-macro-dot"></div>
                                                    <span>
                                                        {Math.round(typeMeals.reduce((s, m) => s + m.carbs, 0))}g
                                                        Carb
                                                    </span>
                                                </div>
                                                <div className="diary__meal-macro diary__meal-macro--fat">
                                                    <div className="diary__meal-macro-dot"></div>
                                                    <span>
                                                        {Math.round(typeMeals.reduce((s, m) => s + m.fat, 0))}g
                                                        Gord
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </section>
                    </>
                )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
