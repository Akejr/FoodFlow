import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
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

interface SmartTip {
    type: 'warning' | 'success' | 'info' | 'motivation';
    icon: string;
    badge: string;
    title: string;
    text: string;
    image: string;
    impact: string;
}

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

    // Data states
    const [meals, setMeals] = useState<MealLog[]>(diaryLoaded ? cachedDiaryMeals : []);
    const [loading, setLoading] = useState(!diaryLoaded);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    // Totals
    const [consumed, setConsumed] = useState(
        diaryLoaded ? cachedDiaryConsumed : { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Stats
    const [streak, setStreak] = useState(0);
    const [weeklyAdherence, setWeeklyAdherence] = useState(0);

    // Expanded meals
    const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

    // Tips carousel
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const tipsContainerRef = useRef<HTMLDivElement>(null);

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

    // Toggle meal expansion
    const toggleMeal = (mealKey: string) => {
        setExpandedMeals(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mealKey)) {
                newSet.delete(mealKey);
            } else {
                newSet.add(mealKey);
            }
            return newSet;
        });
    };

    // Generate smart tips based on consumed vs goals - SEMPRE 4 dicas
    const smartTips = useMemo((): SmartTip[] => {
        const tips: SmartTip[] = [];
        const hour = new Date().getHours();

        // Pool de dicas condicionais (baseadas no progresso)

        // 1. Gordura alta (>80% da meta)
        if (consumed.fat >= goals.fat * 0.8) {
            tips.push({
                type: 'warning',
                icon: 'warning',
                badge: 'Atenção',
                title: 'Cuidado com as gorduras',
                text: `Você consumiu ${Math.round(consumed.fat)}g de ${goals.fat}g. Modere nas próximas refeições.`,
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop',
                impact: 'Impacta meta semanal'
            });
        }

        // 2. Proteína baixa (após 12h e <50%)
        if (hour >= 12 && consumed.protein < goals.protein * 0.5) {
            tips.push({
                type: 'warning',
                icon: 'egg_alt',
                badge: 'Reforçar',
                title: 'Aumente a proteína',
                text: `Apenas ${Math.round(consumed.protein)}g de ${goals.protein}g. Inclua carnes ou ovos.`,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=300&fit=crop',
                impact: 'Essencial para músculos'
            });
        }

        // 3. Calorias baixas (após 18h e <60%)
        if (hour >= 18 && consumed.calories < goals.calories * 0.6) {
            tips.push({
                type: 'info',
                icon: 'restaurant',
                badge: 'Lembrete',
                title: 'Calorias baixas',
                text: 'Você ainda tem bastante espaço para comer. Não pule refeições!',
                image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=300&fit=crop',
                impact: 'Energia para o corpo'
            });
        }

        // 4. Calorias dentro da meta (90-110%)
        if (consumed.calories >= goals.calories * 0.9 && consumed.calories <= goals.calories * 1.1) {
            tips.push({
                type: 'success',
                icon: 'thumb_up',
                badge: 'Parabéns',
                title: 'Meta calórica atingida! 🎉',
                text: 'Excelente! Você manteve as calorias dentro do objetivo.',
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=300&fit=crop',
                impact: 'Objetivo do dia concluído'
            });
        }

        // 5. Sequência (>2 dias)
        if (streak >= 2) {
            tips.push({
                type: 'motivation',
                icon: 'local_fire_department',
                badge: 'Fogo',
                title: `${streak} dias seguidos! 🔥`,
                text: 'Sua consistência está incrível. Continue assim!',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop',
                impact: 'Hábito em construção'
            });
        }

        // 6. Aderência semanal boa (>60%)
        if (weeklyAdherence >= 60) {
            tips.push({
                type: 'success',
                icon: 'trending_up',
                badge: 'Sucesso',
                title: 'Semana produtiva!',
                text: `${weeklyAdherence}% de aderência esta semana. Continue firme!`,
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=300&fit=crop',
                impact: 'Resultados aparecem'
            });
        }

        // Pool de dicas genéricas para completar 4
        const defaultTips: SmartTip[] = [
            {
                type: 'info',
                icon: 'water_drop',
                badge: 'Saúde',
                title: 'Hidratação importa',
                text: 'Lembre-se de beber água. 2L por dia ajuda no metabolismo.',
                image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=300&fit=crop',
                impact: 'Bem-estar geral'
            },
            {
                type: 'info',
                icon: 'bedtime',
                badge: 'Dica',
                title: 'Evite comer tarde',
                text: 'Tente fazer sua última refeição até 3h antes de dormir.',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=300&fit=crop',
                impact: 'Digestão saudável'
            },
            {
                type: 'motivation',
                icon: 'fitness_center',
                badge: 'Motivação',
                title: 'Você está no caminho!',
                text: 'Cada registro conta. Continue acompanhando suas refeições.',
                image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=300&fit=crop',
                impact: 'Progresso constante'
            },
            {
                type: 'info',
                icon: 'schedule',
                badge: 'Rotina',
                title: 'Regularidade é chave',
                text: 'Tente manter horários fixos para suas refeições.',
                image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=300&fit=crop',
                impact: 'Metabolismo regular'
            }
        ];

        // Completar até ter 4 dicas
        let index = 0;
        while (tips.length < 4 && index < defaultTips.length) {
            tips.push(defaultTips[index]);
            index++;
        }

        return tips.slice(0, 4);
    }, [consumed, goals, streak, weeklyAdherence]);

    // Load meals for selected date
    const loadMeals = useCallback(async () => {
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

            // Map snake_case to camelCase
            const mappedMeals: MealLog[] = (mealData || []).map((m: any) => ({
                id: m.id,
                userId: m.user_id,
                foodId: m.food_id,
                foodName: m.food_name,
                quantityG: m.quantity_g,
                calories: m.calories,
                protein: m.protein,
                carbs: m.carbs,
                fat: m.fat,
                mealType: m.meal_type,
                loggedAt: m.logged_at
            }));

            setMeals(mappedMeals);

            // Calculate totals
            if (mappedMeals.length > 0) {
                const totals = mappedMeals.reduce(
                    (acc, meal) => ({
                        calories: acc.calories + (meal.calories || 0),
                        protein: acc.protein + (meal.protein || 0),
                        carbs: acc.carbs + (meal.carbs || 0),
                        fat: acc.fat + (meal.fat || 0)
                    }),
                    { calories: 0, protein: 0, carbs: 0, fat: 0 }
                );
                setConsumed(totals);
                setCachedDiaryData(mappedMeals, totals);
            } else {
                const emptyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                setConsumed(emptyTotals);
                setCachedDiaryData([], emptyTotals);
            }
        } catch (err: any) {
            console.error('Erro ao carregar refeições:', err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, setCachedDiaryData]);

    // Calculate streak and adherence
    const calculateStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get last 7 days of data for streak and adherence
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push(d.toISOString().split('T')[0]);
            }

            const { data: weekData } = await supabase
                .from('meal_logs')
                .select('logged_at, calories')
                .eq('user_id', user.id)
                .gte('logged_at', `${dates[6]}T00:00:00`)
                .order('logged_at', { ascending: false });

            if (!weekData) return;

            // Group by date and sum calories
            const dailyCalories: Record<string, number> = {};
            weekData.forEach((m: any) => {
                const date = m.logged_at.split('T')[0];
                dailyCalories[date] = (dailyCalories[date] || 0) + m.calories;
            });

            // Calculate streak (consecutive days with meals)
            let currentStreak = 0;
            for (let i = 0; i < 7; i++) {
                if (dailyCalories[dates[i]] && dailyCalories[dates[i]] > 0) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            setStreak(currentStreak);

            // Calculate weekly adherence (days within 80-120% of goal)
            let daysOnTarget = 0;
            dates.forEach(date => {
                const cals = dailyCalories[date] || 0;
                if (cals >= goals.calories * 0.8 && cals <= goals.calories * 1.2) {
                    daysOnTarget++;
                }
            });
            setWeeklyAdherence(Math.round((daysOnTarget / 7) * 100));

        } catch (err) {
            console.error('Erro ao calcular stats:', err);
        }
    };

    // Delete meal
    const handleDeleteMeal = async (mealId: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        setDeleting(mealId);
        try {
            const { error } = await supabase
                .from('meal_logs')
                .delete()
                .eq('id', mealId);

            if (error) throw error;
            await loadMeals();
        } catch (err: any) {
            console.error('Erro ao excluir refeição:', err);
            alert('Erro ao excluir refeição');
        } finally {
            setDeleting(null);
        }
    };

    // Handle tips scroll
    const handleTipsScroll = () => {
        if (tipsContainerRef.current) {
            const scrollLeft = tipsContainerRef.current.scrollLeft;
            const cardWidth = tipsContainerRef.current.offsetWidth - 32;
            const index = Math.round(scrollLeft / cardWidth);
            setCurrentTipIndex(index);
        }
    };

    // Load data on mount and date change
    useEffect(() => {
        loadMeals();
        calculateStats();
    }, [selectedDate]);

    // Group meals by time and type
    const mealGroups = useMemo(() => {
        return meals.reduce((groups, meal) => {
            const mealDate = new Date(meal.loggedAt);
            const timeKey = `${meal.mealType}-${mealDate.getHours()}:${mealDate.getMinutes()}`;

            if (!groups[timeKey]) {
                groups[timeKey] = {
                    mealType: meal.mealType,
                    loggedAt: meal.loggedAt,
                    items: []
                };
            }
            groups[timeKey].items.push(meal);
            return groups;
        }, {} as Record<string, { mealType: string; loggedAt: string; items: MealLog[] }>);
    }, [meals]);

    const groupedMealsList = Object.entries(mealGroups);

    const { main: dateMain, sub: dateSub } = formatDate(selectedDate);
    const caloriesRemaining = Math.max(0, goals.calories - consumed.calories);
    const caloriesPercentage = Math.min(Math.round((consumed.calories / goals.calories) * 100), 100);
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // Show skeleton only on first load
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

            {/* Main Content */}
            <main className="diary__content">
                {error ? (
                    <div className="diary__error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                        <button onClick={loadMeals}>Tentar Novamente</button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <section className="diary__stats">
                            <div className="diary__stat">
                                <div className="diary__stat-header">
                                    <span className="material-symbols-outlined">local_fire_department</span>
                                    {streak > 0 && <span className="diary__stat-badge">+{streak}</span>}
                                </div>
                                <div className="diary__stat-value">{streak} Dias</div>
                                <div className="diary__stat-label">Sequência</div>
                            </div>
                            <div className="diary__stat">
                                <div className="diary__stat-header">
                                    <span className="material-symbols-outlined">donut_large</span>
                                </div>
                                <div className="diary__stat-value">{weeklyAdherence}%</div>
                                <div className="diary__stat-label">Aderência Semanal</div>
                            </div>
                        </section>

                        {/* Tips Carousel */}
                        {smartTips.length > 0 && (
                            <section className="diary__tips-carousel">
                                <div
                                    ref={tipsContainerRef}
                                    className="diary__tips-container"
                                    onScroll={handleTipsScroll}
                                >
                                    {smartTips.map((tip, index) => (
                                        <div key={index} className={`diary__tip-card diary__tip-card--${tip.type}`}>
                                            <div
                                                className="diary__tip-image"
                                                style={{ backgroundImage: `url(${tip.image})` }}
                                            >
                                                <div className={`diary__tip-badge diary__tip-badge--${tip.type}`}>
                                                    <span className="material-symbols-outlined">{tip.icon}</span>
                                                    <span>{tip.badge}</span>
                                                </div>
                                            </div>
                                            <div className="diary__tip-content">
                                                <span className="diary__tip-label">Insight de Hoje</span>
                                                <h3>{tip.title}</h3>
                                                <p>{tip.text}</p>
                                                <div className="diary__tip-footer">
                                                    <span>{tip.impact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {smartTips.length > 1 && (
                                    <div className="diary__tips-dots">
                                        {smartTips.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`diary__tips-dot ${index === currentTipIndex ? 'diary__tips-dot--active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Calories Card */}
                        <section className="diary__calories-card">
                            <div className="diary__calories-header">
                                <div className="diary__calories-info">
                                    <p className="diary__calories-label">Calorias Disponíveis</p>
                                    <div className="diary__calories-value">
                                        <span className="diary__calories-main">{Math.round(caloriesRemaining)}</span>
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
                                    <span>{Math.round(consumed.calories)} consumidas</span>
                                </div>
                                <div className="diary__calories-progress">
                                    <div
                                        className="diary__calories-progress-fill"
                                        style={{ width: `${caloriesPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Meals Section */}
                        <section className="diary__meals-section">
                            <div className="diary__meals-header">
                                <h2 className="diary__meals-title">Refeições</h2>
                            </div>

                            {groupedMealsList.length === 0 ? (
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
                                <div className="diary__meals-list">
                                    {groupedMealsList.map(([key, group]) => {
                                        const typeInfo = mealTypeLabels[group.mealType] || mealTypeLabels.snack;
                                        const mealTime = new Date(group.loggedAt).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        const totalCalories = group.items.reduce((sum, m) => sum + m.calories, 0);
                                        const totalProtein = group.items.reduce((sum, m) => sum + m.protein, 0);
                                        const totalCarbs = group.items.reduce((sum, m) => sum + m.carbs, 0);
                                        const totalFat = group.items.reduce((sum, m) => sum + m.fat, 0);
                                        const isExpanded = expandedMeals.has(key);

                                        return (
                                            <article
                                                key={key}
                                                className={`diary__meal-collapsible ${isExpanded ? 'diary__meal-collapsible--expanded' : ''}`}
                                            >
                                                {/* Toggle Header */}
                                                <button
                                                    className="diary__meal-toggle"
                                                    onClick={() => toggleMeal(key)}
                                                >
                                                    <div className="diary__meal-toggle-left">
                                                        <div className={`diary__meal-toggle-icon diary__meal-toggle-icon--${typeInfo.color}`}>
                                                            <span className="material-symbols-outlined">{typeInfo.icon}</span>
                                                        </div>
                                                        <div className="diary__meal-toggle-info">
                                                            <span className="diary__meal-toggle-title">{typeInfo.name}</span>
                                                            <span className="diary__meal-toggle-time">{mealTime}</span>
                                                        </div>
                                                    </div>
                                                    <div className="diary__meal-toggle-right">
                                                        <div className="diary__meal-toggle-calories">
                                                            <span className="diary__meal-toggle-calories-value">{Math.round(totalCalories)}</span>
                                                            <span className="diary__meal-toggle-calories-unit">kcal</span>
                                                        </div>
                                                        <span className="material-symbols-outlined diary__meal-toggle-arrow">
                                                            expand_more
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Macros Compact */}
                                                <div className="diary__meal-macros-compact">
                                                    <div className="diary__meal-macro-compact">
                                                        <div className="diary__meal-macro-compact-dot diary__meal-macro-compact-dot--protein" />
                                                        <span>{Math.round(totalProtein)}g Prot</span>
                                                    </div>
                                                    <div className="diary__meal-macro-compact">
                                                        <div className="diary__meal-macro-compact-dot diary__meal-macro-compact-dot--carbs" />
                                                        <span>{Math.round(totalCarbs)}g Carb</span>
                                                    </div>
                                                    <div className="diary__meal-macro-compact">
                                                        <div className="diary__meal-macro-compact-dot diary__meal-macro-compact-dot--fat" />
                                                        <span>{Math.round(totalFat)}g Gord</span>
                                                    </div>
                                                </div>

                                                {/* Dropdown Items */}
                                                <div className="diary__meal-dropdown">
                                                    <div className="diary__meal-dropdown-content">
                                                        {group.items.map((meal) => (
                                                            <div key={meal.id} className="diary__meal-dropdown-item">
                                                                <div className="diary__meal-dropdown-name">
                                                                    <div className="diary__meal-dropdown-bullet" />
                                                                    <span>{meal.foodName}</span>
                                                                </div>
                                                                <div className="diary__meal-dropdown-actions">
                                                                    <span className="diary__meal-dropdown-quantity">
                                                                        {meal.quantityG}g
                                                                    </span>
                                                                    <button
                                                                        className="diary__meal-dropdown-delete"
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
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
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
