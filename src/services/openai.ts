/**
 * AI SERVICE - Cálculo de macros nutricionais
 * Usando OpenAI GPT com prompt de alta precisão
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
    console.warn('⚠️ VITE_OPENAI_API_KEY não configurada. Funcionalidades de IA não funcionarão.');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export interface FoodItem {
    name: string;
    weightG: number;
}

export interface NutritionData {
    name: string;
    weightG: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface NutritionResult {
    success: boolean;
    items: NutritionData[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    error?: string;
}

const SYSTEM_PROMPT = `Você é um motor de cálculo nutricional de alta precisão.

Sua única função é calcular macronutrientes com base em alimentos informados com peso exato.
Você NÃO deve:
- Estimar valores
- Supor alimentos similares
- Usar médias genéricas sem declarar
- Inventar dados nutricionais
- Ignorar o peso informado

### FONTE DE DADOS
Use exclusivamente tabelas nutricionais reconhecidas:
- TACO (Brasil)
- USDA FoodData Central
Quando houver divergência entre fontes, priorize:
1. TACO
2. USDA

Se um alimento NÃO existir exatamente na base, use o equivalente mais próximo.

### REGRAS DE CÁLCULO
- Todos os cálculos devem ser proporcionais ao peso informado
- Utilize valores nutricionais por 100g como base
- Faça conversão matemática exata
- Não arredonde durante o cálculo
- Arredonde SOMENTE no resultado final (2 casas decimais)
- Faça cálculos supondo que os alimentos já estão preparados/cozidos

### MACROS OBRIGATÓRIOS
Para cada alimento, calcule:
- Calorias (kcal)
- Proteínas (g)
- Carboidratos (g)
- Gorduras totais (g)

### RESULTADO
Retorne APENAS JSON estruturado exatamente neste formato:

{
  "alimentos": [
    {
      "nome": "",
      "peso_g": 0,
      "calorias_kcal": 0,
      "proteinas_g": 0,
      "carboidratos_g": 0,
      "gorduras_g": 0
    }
  ],
  "totais": {
    "calorias_kcal": 0,
    "proteinas_g": 0,
    "carboidratos_g": 0,
    "gorduras_g": 0
  }
}

### LINGUAGEM
- Não explique o cálculo
- Não escreva texto fora do JSON
- Não adicione observações
- Não faça recomendações nutricionais

Você é um sistema matemático, não um nutricionista.
Precisão é mais importante que rapidez.`;

/**
 * Calcula macros nutricionais usando OpenAI GPT com precisão
 */
export async function calculateNutritionWithAI(foods: FoodItem[]): Promise<NutritionResult> {
    if (foods.length === 0) {
        return {
            success: false,
            items: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            error: 'Nenhum alimento fornecido'
        };
    }

    // Montar lista de alimentos no formato esperado
    const foodList = foods.map(f => `${f.name} – ${f.weightG}g`).join('\n');

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: foodList
                }
            ],
            temperature: 0,
            max_tokens: 2048,
        });

        const text = response.choices[0]?.message?.content;

        if (!text) {
            throw new Error('Resposta vazia da IA');
        }

        // Limpar e parsear JSON
        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const result = JSON.parse(cleanedText);

        // Converter do formato da IA para o formato interno
        const items: NutritionData[] = (result.alimentos || []).map((item: any) => ({
            name: item.nome,
            weightG: item.peso_g,
            calories: Math.round(item.calorias_kcal),
            protein: Math.round(item.proteinas_g * 10) / 10,
            carbs: Math.round(item.carboidratos_g * 10) / 10,
            fat: Math.round(item.gorduras_g * 10) / 10
        }));

        const totals = {
            calories: Math.round(result.totais?.calorias_kcal || 0),
            protein: Math.round((result.totais?.proteinas_g || 0) * 10) / 10,
            carbs: Math.round((result.totais?.carboidratos_g || 0) * 10) / 10,
            fat: Math.round((result.totais?.gorduras_g || 0) * 10) / 10
        };

        return {
            success: true,
            items,
            totals
        };

    } catch (error) {
        console.error('Erro ao calcular nutrição:', error);

        let errorMessage = 'Erro ao calcular nutrição';
        if (error instanceof Error) {
            if (error.message.includes('429')) {
                errorMessage = 'Limite de requisições. Aguarde e tente novamente.';
            } else if (error.message.includes('401') || error.message.includes('API key')) {
                errorMessage = 'Chave de API inválida.';
            } else if (error.message.includes('insufficient_quota')) {
                errorMessage = 'Cota da API esgotada.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            items: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            error: errorMessage
        };
    }
}

/**
 * Processa transcrição de voz e calcula macros
 * Prompt especial para interpretar áudio com possíveis ruídos
 */
export async function calculateNutritionFromVoice(transcript: string): Promise<NutritionResult> {
    if (!transcript.trim()) {
        return {
            success: false,
            items: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            error: 'Nenhuma transcrição fornecida'
        };
    }

    const VOICE_PROMPT = `Você é um motor de cálculo nutricional de alta precisão.

A entrada a seguir é uma TRANSCRIÇÃO DE ÁUDIO de um usuário informando o que comeu.
O áudio pode conter:
- Ruídos de fundo
- Palavras cortadas ou mal pronunciadas
- Hesitações ("ãh", "hm")
- Números falados por extenso ("cento e cinquenta gramas")

Sua tarefa:
1. INTERPRETAR da melhor forma possível os alimentos mencionados
2. INFERIR pesos razoáveis se não forem claramente especificados (use porções típicas brasileiras)
3. IGNORAR ruídos e palavras sem sentido
4. CALCULAR os macronutrientes com precisão

### FONTE DE DADOS
Use exclusivamente tabelas nutricionais reconhecidas:
- TACO (Brasil) - prioridade
- USDA FoodData Central

### REGRAS DE CÁLCULO
- Todos os cálculos proporcionais ao peso
- Utilize valores nutricionais por 100g como base
- Arredonde no resultado final (2 casas decimais)
- Suponha alimentos já preparados/cozidos

### RESULTADO
Retorne APENAS JSON estruturado:

{
  "alimentos": [
    {
      "nome": "nome interpretado do alimento",
      "peso_g": peso_estimado_ou_informado,
      "calorias_kcal": 0,
      "proteinas_g": 0,
      "carboidratos_g": 0,
      "gorduras_g": 0
    }
  ],
  "totais": {
    "calorias_kcal": 0,
    "proteinas_g": 0,
    "carboidratos_g": 0,
    "gorduras_g": 0
  }
}

### LINGUAGEM
- Não explique o cálculo
- Não escreva texto fora do JSON
- Não adicione observações`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: VOICE_PROMPT
                },
                {
                    role: "user",
                    content: `Transcrição do áudio: "${transcript}"`
                }
            ],
            temperature: 0.1,
            max_tokens: 2048,
        });

        const text = response.choices[0]?.message?.content;

        if (!text) {
            throw new Error('Resposta vazia da IA');
        }

        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const result = JSON.parse(cleanedText);

        const items: NutritionData[] = (result.alimentos || []).map((item: any) => ({
            name: item.nome,
            weightG: item.peso_g,
            calories: Math.round(item.calorias_kcal),
            protein: Math.round(item.proteinas_g * 10) / 10,
            carbs: Math.round(item.carboidratos_g * 10) / 10,
            fat: Math.round(item.gorduras_g * 10) / 10
        }));

        const totals = {
            calories: Math.round(result.totais?.calorias_kcal || 0),
            protein: Math.round((result.totais?.proteinas_g || 0) * 10) / 10,
            carbs: Math.round((result.totais?.carboidratos_g || 0) * 10) / 10,
            fat: Math.round((result.totais?.gorduras_g || 0) * 10) / 10
        };

        return {
            success: true,
            items,
            totals
        };

    } catch (error) {
        console.error('Erro ao processar voz:', error);

        let errorMessage = 'Erro ao processar áudio';
        if (error instanceof Error) {
            if (error.message.includes('429')) {
                errorMessage = 'Limite de requisições. Aguarde e tente novamente.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            items: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            error: errorMessage
        };
    }
}

/**
 * Gera insights nutricionais personalizados baseados nas refeições e metas
 */
export interface InsightData {
    title: string;
    description: string;
    tips: string[];
}

export interface InsightResult {
    success: boolean;
    insight?: InsightData;
    error?: string;
}

interface MealForInsight {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: string;
}

interface NutritionGoalsForInsight {
    calories: number;
    proteinG: number;
    carbsMinG: number;
    fatMinG: number;
}

export async function generateNutritionInsight(
    meals: MealForInsight[],
    goals: NutritionGoalsForInsight,
    consumed: { calories: number; protein: number; carbs: number; fat: number }
): Promise<InsightResult> {
    if (meals.length === 0) {
        return {
            success: true,
            insight: {
                title: "Comece seu dia!",
                description: "Adicione sua primeira refeição para receber insights personalizados.",
                tips: ["Registre suas refeições para acompanhar seu progresso"]
            }
        };
    }

    const INSIGHT_PROMPT = `Você é um nutricionista especializado e coach de saúde focado em gerar insights práticos e motivacionais.

### CONTEXTO DO USUÁRIO

**Metas Diárias:**
- Calorias: ${goals.calories} kcal
- Proteínas: ${goals.proteinG}g
- Carboidratos: ${goals.carbsMinG}g
- Gorduras: ${goals.fatMinG}g

**Consumo Atual:**
- Calorias: ${consumed.calories} kcal (${Math.round((consumed.calories / goals.calories) * 100)}%)
- Proteínas: ${consumed.protein}g (${Math.round((consumed.protein / goals.proteinG) * 100)}%)
- Carboidratos: ${consumed.carbs}g (${Math.round((consumed.carbs / goals.carbsMinG) * 100)}%)
- Gorduras: ${consumed.fat}g (${Math.round((consumed.fat / goals.fatMinG) * 100)}%)

**Refeições Registradas:**
${meals.map(m => `- ${m.food_name}: ${m.calories}kcal, P:${m.protein}g, C:${m.carbs}g, G:${m.fat}g (${m.meal_type})`).join('\n')}

### TAREFA

Gere um insight nutricional personalizado, prático e motivacional. Considere:
1. Progresso atual em relação às metas
2. Balanço de macronutrientes
3. Sugestões práticas para as próximas refeições
4. Tom positivo e encorajador

### FORMATO DE RESPOSTA

Retorne APENAS JSON:
{
    "title": "Título curto e impactante (máx 40 caracteres)",
    "description": "Análise principal em 1-2 frases (máx 120 caracteres)",
    "tips": ["Dica prática 1", "Dica prática 2"]
}

### REGRAS
- Seja específico e personalizado
- Use linguagem simples e direta
- Sempre inclua sugestões acionáveis
- Mantenha tom positivo mesmo em déficits
- Não use termos técnicos complexos`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: INSIGHT_PROMPT
                },
                {
                    role: "user",
                    content: "Gere o insight nutricional agora."
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const text = response.choices[0]?.message?.content;

        if (!text) {
            throw new Error('Resposta vazia da IA');
        }

        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const result = JSON.parse(cleanedText);

        return {
            success: true,
            insight: {
                title: result.title || "Seu Progresso",
                description: result.description || "Continue registrando suas refeições!",
                tips: result.tips || []
            }
        };

    } catch (error) {
        console.error('Erro ao gerar insight:', error);
        return {
            success: false,
            error: 'Erro ao gerar insight'
        };
    }
}

/**
 * Analisa foto corporal usando GPT-4 Vision
 */
export interface BodyAnalysisData {
    biotipo: string;
    areasParaFocar: string[];
    postura: string;
    sugestoesTreino: string[];
    observacoes: string;
}

export interface BodyAnalysisResult {
    success: boolean;
    data?: BodyAnalysisData;
    error?: string;
}

export async function analyzeBodyImage(imageBase64: string): Promise<BodyAnalysisResult> {
    if (!imageBase64) {
        return {
            success: false,
            error: 'Nenhuma imagem fornecida'
        };
    }

    const BODY_ANALYSIS_PROMPT = `Você é um especialista em avaliação física e personal trainer experiente.

Analise esta foto corporal e forneça uma avaliação construtiva e motivacional.

### O QUE ANALISAR

1. **Biotipo**: Identifique se é ectomorfo, mesomorfo, endomorfo ou combinações
2. **Áreas para Focar**: Liste 3-5 grupos musculares que podem ser desenvolvidos
3. **Postura**: Observe ombros, coluna, quadril - dê feedback construtivo
4. **Sugestões de Treino**: 3-5 sugestões práticas baseadas na análise
5. **Observações**: Comentário motivacional geral

### REGRAS

- Seja SEMPRE respeitoso e motivacional
- NÃO faça comentários negativos sobre peso ou aparência
- Foque em progresso e potencial
- Dê sugestões práticas e acionáveis
- Use linguagem positiva
- NUNCA sugira dietas extremas ou procedimentos médicos

### FORMATO DE RESPOSTA

Retorne APENAS JSON:
{
    "biotipo": "Descrição do biotipo identificado",
    "areasParaFocar": ["Área 1", "Área 2", "Área 3"],
    "postura": "Observações sobre postura",
    "sugestoesTreino": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
    "observacoes": "Comentário motivacional final"
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: BODY_ANALYSIS_PROMPT
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            temperature: 0.5,
            max_tokens: 1500,
        });

        const text = response.choices[0]?.message?.content;

        if (!text) {
            throw new Error('Resposta vazia da IA');
        }

        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const result = JSON.parse(cleanedText);

        return {
            success: true,
            data: {
                biotipo: result.biotipo || 'Não identificado',
                areasParaFocar: result.areasParaFocar || [],
                postura: result.postura || 'Sem observações',
                sugestoesTreino: result.sugestoesTreino || [],
                observacoes: result.observacoes || ''
            }
        };

    } catch (error) {
        console.error('Erro ao analisar imagem corporal:', error);

        let errorMessage = 'Erro ao analisar imagem';
        if (error instanceof Error) {
            if (error.message.includes('429')) {
                errorMessage = 'Limite de requisições. Aguarde e tente novamente.';
            } else if (error.message.includes('invalid_image')) {
                errorMessage = 'Imagem inválida. Use uma foto clara do corpo inteiro.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}
