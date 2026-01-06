# 🚀 FoodFlow - Roadmap para Produção

## ✅ O Que Já Está Pronto (100% Frontend)

### Páginas Completas (8)
- ✅ Welcome - Tela inicial
- ✅ Onboarding - 3 steps de cadastro
- ✅ Goals - Seleção de plano
- ✅ Dashboard - Visão geral
- ✅ AddMeal - Registro de refeições
- ✅ Tips - Dicas da IA
- ✅ Profile - Perfil do usuário
- ✅ Diary - Diário de refeições

### Design System
- ✅ 5 componentes UI (Button, Input, Select, ProgressBar, RadioCard)
- ✅ CSS Variables padronizadas
- ✅ Container mobile 448px
- ✅ FAB central em todas as páginas
- ✅ Navegação consistente

### Infraestrutura
- ✅ Vite + React + TypeScript
- ✅ React Router configurado
- ✅ PWA configurado (manifest + service worker)
- ✅ Supabase client configurado
- ✅ Zustand store básico

---

## 🔨 O Que Falta Implementar

### 1️⃣ **AUTENTICAÇÃO** (Prioridade Alta)

#### O que fazer:
```typescript
// 1. Criar páginas de Login/Registro
src/pages/Login/Login.tsx
src/pages/Register/Register.tsx

// 2. Implementar funções no Supabase
async function signUp(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData // idade, peso, etc
    }
  });
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
}

async function signOut() {
  await supabase.auth.signOut();
}

// 3. Criar Protected Routes
function ProtectedRoute({ children }) {
  const user = useAppStore(state => state.user);
  return user ? children : <Navigate to="/login" />;
}
```

#### Estimativa: **2-3 horas**

---

### 2️⃣ **PERSISTÊNCIA DE DADOS** (Prioridade Alta)

#### O que fazer:
```typescript
// 1. Salvar dados do Onboarding
async function saveUserProfile(userId, profileData) {
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      age: profileData.age,
      weight: profileData.weight,
      height: profileData.height,
      activity_level: profileData.activityLevel,
      goal: profileData.goal
    });
}

// 2. Salvar refeições
async function saveMeal(userId, mealData) {
  const { error } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      meal_type: mealData.mealType,
      food_name: mealData.food,
      quantity: mealData.quantity,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      created_at: new Date()
    });
}

// 3. Buscar dados do usuário
async function getUserData(userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { profile, meals };
}
```

#### Estimativa: **3-4 horas**

---

### 3️⃣ **INTEGRAÇÃO COM GEMINI API** (Prioridade Média)

#### O que fazer:
```typescript
// 1. Calcular metas nutricionais com IA
async function calculateNutritionalGoals(userData) {
  const prompt = `
    Calcule as necessidades nutricionais diárias para:
    - Idade: ${userData.age} anos
    - Peso: ${userData.weight} kg
    - Altura: ${userData.height} cm
    - Sexo: ${userData.sex}
    - Nível de atividade: ${userData.activityLevel}
    - Objetivo: ${userData.goal}
    
    Retorne em JSON: { calories, protein, carbs, fat }
  `;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${VITE_GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}

// 2. Analisar refeição com IA
async function analyzeMeal(foodName, quantity) {
  const prompt = `
    Analise os valores nutricionais de: ${foodName} (${quantity})
    Retorne em JSON: { calories, protein, carbs, fat }
  `;
  
  // Similar ao anterior
}

// 3. Gerar dicas personalizadas
async function generateAITips(userProgress) {
  const prompt = `
    Baseado no progresso do usuário:
    - Calorias consumidas: ${userProgress.caloriesConsumed}
    - Meta de calorias: ${userProgress.caloriesGoal}
    - Proteína: ${userProgress.protein}g
    
    Gere 3 dicas personalizadas de nutrição.
  `;
  
  // Similar ao anterior
}
```

#### Estimativa: **4-5 horas**

---

### 4️⃣ **SPEECH-TO-TEXT PARA ÁUDIO** (Prioridade Baixa)

#### O que fazer:
```typescript
// Usar Web Speech API (nativo do navegador)
function startVoiceRecording() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'pt-BR';
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setFood(transcript); // Preenche o campo de alimento
  };
  
  recognition.start();
}
```

#### Estimativa: **1-2 horas**

---

### 5️⃣ **CÁLCULOS E LÓGICA DE NEGÓCIO** (Prioridade Alta)

#### O que fazer:
```typescript
// 1. Calcular calorias consumidas no dia
function calculateDailyCalories(meals) {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

// 2. Calcular macros consumidos
function calculateDailyMacros(meals) {
  return {
    protein: meals.reduce((total, meal) => total + meal.protein, 0),
    carbs: meals.reduce((total, meal) => total + meal.carbs, 0),
    fat: meals.reduce((total, meal) => total + meal.fat, 0)
  };
}

// 3. Calcular progresso (%)
function calculateProgress(consumed, goal) {
  return Math.min(Math.round((consumed / goal) * 100), 100);
}

// 4. Verificar se ultrapassou meta
function isExceeded(consumed, goal) {
  return consumed > goal;
}
```

#### Estimativa: **2 horas**

---

### 6️⃣ **INTEGRAÇÕES OPCIONAIS** (Prioridade Baixa)

#### InfinityPay (Pagamentos)
```typescript
// Para plano premium
async function createCheckout(userId, planId) {
  const response = await fetch('https://api.infinitypay.io/v2/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_INFINITYPAY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 2990, // R$ 29,90
      description: 'Plano Premium FoodFlow',
      customer: {
        email: user.email
      }
    })
  });
}
```

#### Estimativa: **3-4 horas**

---

## 📊 Resumo de Prioridades

### ⚡ Fase 1 - MVP Funcional (8-12 horas)
1. ✅ Autenticação (Login/Registro)
2. ✅ Persistência de dados (Supabase CRUD)
3. ✅ Cálculos básicos (calorias e macros)

**Resultado:** App funcionando com dados reais!

### 🚀 Fase 2 - IA e Inteligência (4-5 horas)
4. Gemini API para cálculos nutricionais
5. Análise de alimentos com IA
6. Dicas personalizadas

**Resultado:** App inteligente e personalizado!

### 🎯 Fase 3 - Recursos Extras (4-6 horas)
7. Speech-to-text para gravação
8. InfinityPay para premium
9. Notificações push
10. Gráficos de progresso

**Resultado:** App completo e profissional!

---

## 🔧 Começar Agora - Checklist Rápido

### Passo 1: Configurar .env
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_GEMINI_API_KEY=sua-chave-gemini
```

### Passo 2: Executar SQL no Supabase
- Abra Supabase Dashboard
- Vá em "SQL Editor"
- Execute o arquivo `supabase/schema.sql`

### Passo 3: Implementar Auth
1. Criar página de Login
2. Criar página de Registro
3. Adicionar logout no Profile

### Passo 4: Conectar Onboarding ao Supabase
1. Ao finalizar onboarding, salvar no BD
2. Redirecionar para Dashboard

### Passo 5: Conectar AddMeal ao Supabase
1. Ao adicionar refeição, salvar no BD
2. Atualizar Dashboard em tempo real

### Passo 6: Buscar Dados Reais
1. Dashboard buscar metas do usuário
2. Diary buscar refeições do dia
3. Profile buscar dados do perfil

---

## ⏱️ Estimativa Total

**MVP Funcional:** 8-12 horas
**Com IA:** 12-17 horas
**Completo:** 16-23 horas

**Meta realista:** 2-3 dias de trabalho focado para ter o app 100% funcional!

---

## 🎯 Recomendação

**Comece por aqui (ordem sugerida):**

1. ✅ Configure `.env` com credenciais
2. ✅ Execute schema SQL no Supabase
3. ✅ Crie páginas de Login/Registro
4. ✅ Implemente autenticação
5. ✅ Conecte Onboarding → Supabase
6. ✅ Conecte AddMeal → Supabase
7. ✅ Faça Dashboard buscar dados reais
8. ✅ Adicione Gemini API para cálculos
9. 🎉 Deploy e comemorar!

---

**Quer que eu comece implementando alguma dessas partes agora?** 

Posso começar por:
- [ ] Criar páginas de Login/Register
- [ ] Implementar sistema de autenticação
- [ ] Conectar Onboarding ao Supabase
- [ ] Integrar Gemini API

É só me falar qual prefere! 🚀
