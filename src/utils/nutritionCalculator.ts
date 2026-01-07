/**
 * FOODFLOW - NUTRITION CALCULATOR
 * Baseado em Mifflin-St Jeor (TMB) e diretrizes científicas
 * 
 * Melhorias implementadas:
 * - Validações de mínimos/máximos calóricos
 * - Mínimo de carboidratos (100g)
 * - Tipos TypeScript fortes
 * - Nomenclatura em inglês
 */

import type { Sex, UserGoal, ActivityLevel } from '../types';

export interface UserPhysicalData {
    sex: Sex;
    age: number;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevel;
    goal: UserGoal;
}

export interface NutritionPlan {
    name: 'flexible' | 'balanced' | 'aggressive';
    label: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description: string;
}

/**
 * Calcula a Taxa Metabólica Basal usando fórmula Mifflin-St Jeor
 * Referência: Mifflin et al. (1990) - A new predictive equation for resting energy expenditure
 */
function calculateBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
    if (sex === 'male') {
        return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        // female ou other - usa fórmula feminina como base
        return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
}

/**
 * Retorna o fator de atividade física
 * Baseado em Harris-Benedict Activity Factor
 */
function getActivityFactor(level: ActivityLevel): number {
    const factors: Record<ActivityLevel, number> = {
        sedentary: 1.2,        // Trabalho de escritório, pouco exercício
        light: 1.375,          // Exercício leve 1-2x/semana
        moderate: 1.55,        // Exercício moderado 3-5x/semana
        active: 1.725,         // Exercício intenso 6-7x/semana
        very_active: 1.9       // Atleta, treino 2x/dia
    };
    return factors[level];
}

/**
 * Ajusta calorias baseado no objetivo e intensidade
 */
function adjustCalories(tdee: number, goal: UserGoal, intensity: 'flexible' | 'balanced' | 'aggressive'): number {
    const adjustments: Record<typeof intensity, Record<UserGoal, number>> = {
        flexible: {
            lose: -0.10,      // -10% (0.5kg/semana)
            maintain: 0,
            gain: 0.10        // +10% (ganho lento)
        },
        balanced: {
            lose: -0.20,      // -20% (0.5-0.75kg/semana)
            maintain: 0,
            gain: 0.15        // +15% (ganho moderado)
        },
        aggressive: {
            lose: -0.30,      // -30% (0.75-1kg/semana)
            maintain: 0,
            gain: 0.25        // +25% (ganho acelerado)
        }
    };

    const adjustment = adjustments[intensity][goal];
    return Math.round(tdee * (1 + adjustment));
}

/**
 * Calcula distribuição de macronutrientes
 * Proteína: priorizada, varia com objetivo/intensidade
 * Gorduras: 20-30% das calorias
 * Carboidratos: preenche o restante
 */
function calculateMacros(
    calories: number,
    weightKg: number,
    _sex: Sex,
    goal: UserGoal,
    intensity: 'flexible' | 'balanced' | 'aggressive'
): { protein: number; carbs: number; fat: number } {
    // PROTEÍNA (g/kg de peso)
    let proteinPerKg: number;

    if (goal === 'lose') {
        // Emagrecimento: mais proteína para preservar massa muscular
        if (intensity === 'flexible') proteinPerKg = 1.8;
        else if (intensity === 'balanced') proteinPerKg = 2.0;
        else proteinPerKg = 2.5; // aggressive
    } else if (goal === 'gain') {
        // Ganho: proteína para construir massa
        if (intensity === 'flexible') proteinPerKg = 1.6;
        else if (intensity === 'balanced') proteinPerKg = 2.0;
        else proteinPerKg = 2.2; // aggressive
    } else {
        // Manutenção: proteína moderada
        proteinPerKg = 1.6;
    }

    const protein = Math.round(proteinPerKg * weightKg);
    const proteinCalories = protein * 4; // 4 cal/g

    // GORDURAS (20-30% das calorias)
    let fatPercent: number;
    if (intensity === 'aggressive') fatPercent = 0.20; // Máximo de energia para carbs
    else if (intensity === 'flexible') fatPercent = 0.25;
    else fatPercent = 0.30; // balanced

    const fatCalories = calories * fatPercent;
    const fat = Math.round(fatCalories / 9); // 9 cal/g

    // CARBOIDRATOS (restante das calorias)
    const carbCalories = calories - (proteinCalories + fatCalories);
    let carbs = Math.round(carbCalories / 4); // 4 cal/g

    // VALIDAÇÃO: Mínimo de 100g carboidratos (evitar cetose não intencional)
    if (carbs < 100) {
        carbs = 100;
    }

    return { protein, carbs, fat };
}

/**
 * Aplica validações de segurança calórica
 */
function validateCalories(calories: number, sex: Sex): number {
    // Mínimos seguros baseados em pesquisa científica
    const minCalories = sex === 'male' ? 1500 : 1200;
    const maxCalories = 6000; // Limite superior

    if (calories < minCalories) return minCalories;
    if (calories > maxCalories) return maxCalories;
    return calories;
}

/**
 * FUNÇÃO PRINCIPAL: Gera os 3 planos nutricionais
 */
export function generateNutritionPlans(userData: UserPhysicalData): NutritionPlan[] {
    // 1. Calcular TMB (Basal Metabolic Rate)
    const bmr = calculateBMR(
        userData.sex,
        userData.weightKg,
        userData.heightCm,
        userData.age
    );

    // 2. Calcular TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * getActivityFactor(userData.activityLevel);

    // 3. Gerar os 3 planos
    const intensities: Array<'flexible' | 'balanced' | 'aggressive'> = ['flexible', 'balanced', 'aggressive'];

    const plans: NutritionPlan[] = intensities.map(intensity => {
        // Ajustar calorias
        let calories = adjustCalories(tdee, userData.goal, intensity);

        // Validar segurança
        calories = validateCalories(calories, userData.sex);

        // Calcular macros
        const macros = calculateMacros(calories, userData.weightKg, userData.sex, userData.goal, intensity);

        // Labels e descrições em português
        const labels: Record<typeof intensity, string> = {
            flexible: 'Mais Flexível',
            balanced: 'Equilibrado',
            aggressive: 'Mais Agressivo'
        };

        const descriptions: Record<typeof intensity, string> = {
            flexible: userData.goal === 'lose'
                ? 'Perda gradual e sustentável (~0.5kg/semana)'
                : userData.goal === 'gain'
                    ? 'Ganho muscular lento e limpo'
                    : 'Manutenção confortável',
            balanced: userData.goal === 'lose'
                ? 'Ritmo moderado de perda (~0.5-0.75kg/semana)'
                : userData.goal === 'gain'
                    ? 'Ganho moderado com mínimo de gordura'
                    : 'Equilíbrio perfeito',
            aggressive: userData.goal === 'lose'
                ? 'Perda acelerada (~0.75-1kg/semana)'
                : userData.goal === 'gain'
                    ? 'Ganho rápido (pode acumular gordura)'
                    : 'Manutenção rigorosa'
        };

        return {
            name: intensity,
            label: labels[intensity],
            calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            description: descriptions[intensity]
        };
    });

    return plans;
}

/**
 * Calcula progresso percentual de uma meta
 */
export function calculateMacroProgress(consumed: number, goal: number): number {
    return Math.min(Math.round((consumed / goal) * 100), 100);
}

/**
 * Verifica se ultrapassou a meta
 */
export function isOverGoal(consumed: number, goal: number): boolean {
    return consumed > goal;
}
