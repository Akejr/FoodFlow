import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, RadioCardGroup, Select } from '../../components/ui';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';

import type { Sex, UserGoal, ActivityLevel } from '../../types';
import './Onboarding.css';

const sexOptions = [
    { value: 'male', label: 'Masculino', icon: 'male' },
    { value: 'female', label: 'Feminino', icon: 'female' },
    { value: 'other', label: 'Outro', icon: 'transgender' }
];

const goalOptions = [
    { value: 'lose', label: 'Emagrecimento', icon: 'monitor_weight', description: 'Reduzir peso corporal' },
    { value: 'gain', label: 'Ganho de Massa', icon: 'fitness_center', description: 'Aumentar massa muscular' },
    { value: 'maintain', label: 'Manutenção', icon: 'balance', description: 'Manter peso atual' }
];

const activityOptions = [
    { value: 'sedentary', label: 'Sedentário (Trabalho de escritório)' },
    { value: 'light', label: 'Levemente Ativo (1-2 dias/sem)' },
    { value: 'moderate', label: 'Moderadamente Ativo (3-5 dias/sem)' },
    { value: 'active', label: 'Muito Ativo (6-7 dias/sem)' },
    { value: 'very_active', label: 'Atleta (2x por dia)' }
];

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { onboardingData, updateOnboarding, onboardingStep, setOnboardingStep } = useAppStore();

    const [formData, setFormData] = useState<{
        fullName: string;
        email: string;
        password: string;
        age: string;
        sex: string;
        heightCm: string;
        weightKg: string;
        goal: string;
        activityLevel: string;
    }>({
        fullName: onboardingData.fullName || '',
        email: '',
        password: '',
        age: onboardingData.age?.toString() || '',
        sex: onboardingData.sex || '',
        heightCm: onboardingData.heightCm?.toString() || '',
        weightKg: onboardingData.weightKg?.toString() || '',
        goal: onboardingData.goal || '',
        activityLevel: onboardingData.activityLevel || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalSteps = 3;

    const handleBack = () => {

        if (onboardingStep === 0) {
            navigate('/');
        } else {
            setOnboardingStep(onboardingStep - 1);
        }
    };

    const handleNext = () => {
        updateOnboarding(formData as any);

        if (onboardingStep < totalSteps - 1) {
            setOnboardingStep(onboardingStep + 1);
        } else {
            // Ir para Goals SEM criar usuário ainda
            navigate('/goals');
        }
    };

    const isStepValid = () => {
        switch (onboardingStep) {
            case 0:
                return formData.fullName.trim() !== '' && formData.email !== '' && formData.password.length >= 6;
            case 1:
                return formData.age !== '' && formData.sex !== '' && formData.heightCm !== '' && formData.weightKg !== '';
            case 2:
                return formData.goal !== '' && formData.activityLevel !== '';
            default:
                return false;
        }
    };

    return (
        <div className="onboarding">
            {/* Header */}
            <header className="onboarding__header">
                <button className="onboarding__back" onClick={handleBack}>
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div className="onboarding__progress-info">
                    <span>Passo {onboardingStep + 1} de {totalSteps}</span>
                </div>
                <div className="onboarding__spacer" />
            </header>

            {/* Progress Bar */}
            <div className="onboarding__progress">
                <div
                    className="onboarding__progress-fill"
                    style={{ width: `${((onboardingStep + 1) / totalSteps) * 100}%` }}
                />
            </div>

            {/* Content */}
            <main className="onboarding__content">
                {/* Step 1: Personal Info */}
                {onboardingStep === 0 && (
                    <div className="onboarding__step animate-slide-up">
                        <h1 className="onboarding__title">Vamos começar</h1>
                        <p className="onboarding__subtitle">
                            Seu treinador usará essas informações para calibrar suas metas com IA.
                        </p>

                        {error && (
                            <div className="onboarding__error">
                                <span className="material-symbols-outlined">error</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="onboarding__form">
                            <Input
                                label="Nome"
                                placeholder="Seu nome completo"
                                iconRight="person"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />

                            <Input
                                label="E-mail"
                                type="email"
                                placeholder="seu@email.com"
                                iconRight="mail"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <Input
                                label="Senha"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                iconRight="lock"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />

                            <Input
                                label="Idade"
                                type="number"
                                inputMode="numeric"
                                placeholder="ex: 21"
                                suffix="Anos"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />

                            <div className="onboarding__field">
                                <div className="onboarding__field-header">
                                    <label>Sexo</label>
                                    <span>Usado para cálculo calórico</span>
                                </div>
                                <RadioCardGroup
                                    name="sex"
                                    value={formData.sex}
                                    onChange={(value) => setFormData({ ...formData, sex: value as Sex })}
                                    options={sexOptions}
                                    columns={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Physical Data */}
                {onboardingStep === 1 && (
                    <div className="onboarding__step animate-slide-up">
                        <h1 className="onboarding__title">
                            Dados <span className="text-primary">Físicos</span>
                        </h1>
                        <p className="onboarding__subtitle">
                            Preencha seus dados para que nossa IA calcule as metas nutricionais ideais para você.
                        </p>

                        <div className="onboarding__form">
                            <div className="onboarding__grid">
                                <Input
                                    label="Altura"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="175"
                                    suffix="cm"
                                    value={formData.heightCm}
                                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                                />

                                <Input
                                    label="Peso"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="70"
                                    suffix="kg"
                                    value={formData.weightKg}
                                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Goals */}
                {onboardingStep === 2 && (
                    <div className="onboarding__step animate-slide-up">
                        <h1 className="onboarding__title">
                            Seu <span className="text-primary">Objetivo</span>
                        </h1>
                        <p className="onboarding__subtitle">
                            Qual é o seu objetivo principal?
                        </p>

                        <div className="onboarding__form">
                            <div className="onboarding__goal-options">
                                {goalOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`goal-option ${formData.goal === option.value ? 'goal-option--selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="goal"
                                            value={option.value}
                                            checked={formData.goal === option.value}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value as UserGoal })}
                                        />
                                        <div className="goal-option__icon">
                                            <span className="material-symbols-outlined">{option.icon}</span>
                                        </div>
                                        <div className="goal-option__content">
                                            <span className="goal-option__label">{option.label}</span>
                                            <span className="goal-option__description">{option.description}</span>
                                        </div>
                                        <div className="goal-option__check">
                                            <span className="material-symbols-outlined">check</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <Select
                                label="Nível de Atividade Física"
                                value={formData.activityLevel}
                                onChange={(value) => setFormData({ ...formData, activityLevel: value as ActivityLevel })}
                                options={activityOptions}
                                placeholder="Selecione o nível"
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* CTA */}
            <div className="onboarding__cta">
                <Button
                    fullWidth
                    size="lg"
                    icon={onboardingStep === totalSteps - 1 ? 'auto_awesome' : 'arrow_forward'}
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                >
                    {loading ? 'Criando conta...' : (onboardingStep === totalSteps - 1 ? 'Calcular Objetivos' : 'Próximo')}
                </Button>
            </div>
        </div>
    );
};
