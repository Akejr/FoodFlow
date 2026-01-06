import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import './Goals.css';


interface Plan {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    isRecommended: boolean;
    colorClass: string;
}

export const Goals: React.FC = () => {
    const navigate = useNavigate();

    // Calculate goals based on onboarding data
    const baseCalories = 2800; // This would come from AI/calculation


    const plans: Plan[] = [
        {
            id: 'flexible',
            name: 'Mais Flexível',
            description: 'Progresso gradual e sustentável',
            calories: Math.round(baseCalories * 0.93),
            protein: 160,
            carbs: 320,
            fat: 75,
            isRecommended: false,
            colorClass: 'plan--flexible'
        },
        {
            id: 'recommended',
            name: 'Equilibrado',
            description: 'Otimizado para seu objetivo',
            calories: baseCalories,
            protein: 180,
            carbs: 350,
            fat: 80,
            isRecommended: true,
            colorClass: 'plan--recommended'
        },
        {
            id: 'aggressive',
            name: 'Mais Agressiva',
            description: 'Resultados rápidos, exige disciplina',
            calories: Math.round(baseCalories * 1.1),
            protein: 200,
            carbs: 400,
            fat: 90,
            isRecommended: false,
            colorClass: 'plan--aggressive'
        }
    ];

    const [selectedPlan, setSelectedPlan] = useState<string>('recommended');

    const handleConfirm = () => {
        const plan = plans.find(p => p.id === selectedPlan);
        if (plan) {
            // Save to store and navigate to dashboard
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        navigate('/onboarding');
    };

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
                    {plans.map((plan) => (
                        <label
                            key={plan.id}
                            className={`plan ${plan.colorClass} ${selectedPlan === plan.id ? 'plan--selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="plan"
                                value={plan.id}
                                checked={selectedPlan === plan.id}
                                onChange={() => setSelectedPlan(plan.id)}
                            />

                            {plan.isRecommended && (
                                <div className="plan__badge">Recomendado pela IA</div>
                            )}

                            <div className="plan__header">
                                <div className="plan__info">
                                    <div className="plan__name">
                                        {plan.name}
                                        {plan.isRecommended && (
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
                    ))}
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
                <Button
                    fullWidth
                    size="lg"
                    icon="check"
                    onClick={handleConfirm}
                >
                    Confirmar Metas
                </Button>
            </div>
        </div>
    );
};
