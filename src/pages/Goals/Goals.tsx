import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { generateNutritionPlans, type NutritionPlan } from '../../utils/nutritionCalculator';
import './Goals.css';

export const Goals: React.FC = () => {
    const navigate = useNavigate();
    const { onboardingData } = useAppStore();

    const [plans, setPlans] = useState<NutritionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<'flexible' | 'balanced' | 'aggressive'>('balanced');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gerar planos ao montar o componente
    useEffect(() => {
        if (onboardingData.age && onboardingData.weightKg && onboardingData.heightCm) {
            try {
                const calculatedPlans = generateNutritionPlans({
                    sex: onboardingData.sex!,
                    age: onboardingData.age,
                    weightKg: onboardingData.weightKg,
                    heightCm: onboardingData.heightCm,
                    activityLevel: onboardingData.activityLevel!,
                    goal: onboardingData.goal!
                });
                setPlans(calculatedPlans);
            } catch (err) {
                console.error('Erro ao calcular planos:', err);
                setError('Erro ao calcular metas. Tente novamente.');
            }
        }
    }, [onboardingData]);

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            // DEBUG: Ver dados do onboarding
            console.log('Dados do onboarding:', onboardingData);

            // Validar dados obrigatórios
            if (!onboardingData.email || !onboardingData.password) {
                throw new Error('Email ou senha não foram preenchidos no cadastro');
            }

            if (!onboardingData.fullName || !onboardingData.age || !onboardingData.sex ||
                !onboardingData.heightCm || !onboardingData.weightKg ||
                !onboardingData.goal || !onboardingData.activityLevel) {
                throw new Error('Dados do cadastro incompletos');
            }

            // Encontrar plano selecionado
            const selectedPlanData = plans.find(p => p.name === selectedPlan);
            if (!selectedPlanData) throw new Error('Plano não encontrado');

            // 1. Criar usuário no Supabase Auth
            console.log('Criando usuário com email:', onboardingData.email);
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: onboardingData.email,
                password: onboardingData.password,
                options: {
                    data: {
                        full_name: onboardingData.fullName
                    }
                }
            });

            if (signUpError) throw signUpError;

            const userId = authData.user?.id;
            if (!userId) throw new Error('Erro ao criar usuário');

            // 2. Criar profile básico
            console.log('📝 Criando profile com full_name:', onboardingData.fullName);
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                email: onboardingData.email!,
                full_name: onboardingData.fullName!,
                role: 'student'
            });

            if (profileError) {
                console.error('❌ Erro ao criar profile:', profileError);
                throw profileError;
            }
            console.log('✅ Profile criado com sucesso');

            // 3. Criar user_streaks
            await supabase.from('user_streaks').insert({ user_id: userId });

            // 4. Salvar perfil físico
            const { error: studentProfileError } = await supabase
                .from('student_profiles')
                .insert({
                    user_id: userId,
                    age: onboardingData.age!,
                    sex: onboardingData.sex!,
                    height_cm: onboardingData.heightCm!,
                    weight_kg: onboardingData.weightKg!,
                    goal: onboardingData.goal!,
                    activity_level: onboardingData.activityLevel!
                });

            if (studentProfileError) throw studentProfileError;

            // 5. Salvar metas nutricionais
            const { error: goalsError } = await supabase
                .from('nutrition_goals')
                .insert({
                    user_id: userId,
                    calories: selectedPlanData.calories,
                    protein_g: selectedPlanData.protein,
                    carbs_min_g: Math.round(selectedPlanData.carbs * 0.9),
                    carbs_max_g: Math.round(selectedPlanData.carbs * 1.1),
                    fat_min_g: Math.round(selectedPlanData.fat * 0.9),
                    fat_max_g: Math.round(selectedPlanData.fat * 1.1)
                });

            if (goalsError) throw goalsError;

            // 6. Ir para Dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
            console.error('Erro ao criar conta:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/onboarding');
    };

    if (plans.length === 0) {
        return (
            <div className="goals">
                <div className="goals__loading">
                    <p>Calculando suas metas personalizadas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="goals">
            {/* Header */}
            <header className="goals__header">
                <button className="goals__back" onClick={handleBack}>
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div className="goals__progress-info">
                    <span>Passo 3 de 3</span>
                </div>
                <div className="goals__spacer" />
            </header>

            {/* Progress Bar */}
            <div className="goals__progress">
                <div className="goals__progress-fill" style={{ width: '100%' }} />
            </div>

            {/* Content */}
            <main className="goals__content">
                <div className="goals__intro">
                    <div className="goals__icon">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <h1 className="goals__title">Metas Calculadas</h1>
                    <p className="goals__subtitle">
                        A IA analisou seus dados e criou 3 estratégias nutricionais personalizadas para você.
                    </p>
                </div>

                <div className="goals__plans">
                    {plans.map((plan) => {
                        const colorClass = `plan--${plan.name}`;
                        const isRecommended = plan.name === 'balanced';

                        return (
                            <label
                                key={plan.name}
                                className={`plan ${colorClass} ${selectedPlan === plan.name ? 'plan--selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="plan"
                                    value={plan.name}
                                    checked={selectedPlan === plan.name}
                                    onChange={() => setSelectedPlan(plan.name)}
                                />

                                {isRecommended && (
                                    <div className="plan__badge">Recomendado pela IA</div>
                                )}

                                <div className="plan__header">
                                    <div className="plan__info">
                                        <div className="plan__name">
                                            {plan.label}
                                            {isRecommended && (
                                                <span className="material-symbols-outlined filled">verified</span>
                                            )}
                                        </div>
                                        <div className="plan__description">{plan.description}</div>
                                    </div>
                                    <div className="plan__calories">
                                        <span className="plan__calories-value">{plan.calories.toLocaleString('pt-BR')}</span>
                                        <span className="plan__calories-label">kcal/dia</span>
                                    </div>
                                </div>

                                <div className="plan__bar">
                                    <div className="plan__bar-segment plan__bar-segment--protein" style={{ width: '30%' }} />
                                    <div className="plan__bar-segment plan__bar-segment--carbs" style={{ width: '45%' }} />
                                    <div className="plan__bar-segment plan__bar-segment--fat" style={{ width: '25%' }} />
                                </div>

                                <div className="plan__macros">
                                    <div className="plan__macro">
                                        <span className="plan__macro-label">Proteína</span>
                                        <span className="plan__macro-value">{plan.protein}g</span>
                                    </div>
                                    <div className="plan__macro">
                                        <span className="plan__macro-label">Carbo</span>
                                        <span className="plan__macro-value">{plan.carbs}g</span>
                                    </div>
                                    <div className="plan__macro">
                                        <span className="plan__macro-label">Gordura</span>
                                        <span className="plan__macro-value">{plan.fat}g</span>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="goals__info">
                    <span className="material-symbols-outlined">info</span>
                    <p>
                        Você poderá ajustar essas metas manualmente mais tarde nas configurações do seu perfil.
                    </p>
                </div>
            </main>

            {/* CTA */}
            <div className="goals__cta">
                {error && (
                    <div className="goals__error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                )}
                <Button
                    fullWidth
                    size="lg"
                    icon="check"
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? 'Salvando metas...' : 'Confirmar Metas'}
                </Button>
            </div>
        </div>
    );
};
