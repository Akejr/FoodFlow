# FoodFlow 🥗✨

**App de Acompanhamento Alimentar com Inteligência Artificial**

Uma PWA moderna para acompanhamento nutricional inteligente, com metas calculadas por IA, feedback automático e integração com personal trainers.

![FoodFlow](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?style=for-the-badge&logo=vite)

---

## 🚀 Features

### Para Alunos
- ✅ **Metas Nutricionais por IA** - Cálculo automático baseado em perfil
- 📊 **Dashboard Visual** - Barras de progresso de calorias e macros
- 🍽️ **Registro Rápido** - Histórico, favoritos e sugestões inteligentes
- 🤖 **Dicas Automáticas** - Feedback diário da IA
- 🔥 **Streaks** - Gamificação para manter consistência

### Para Personal Trainers
- 👥 **Painel de Alunos** - Visão geral de aderência
- 💰 **Comissão Recorrente** - R$ 20/aluno ativo
- 📈 **Acompanhamento Passivo** - Sem trabalho adicional

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite 7 |
| **PWA** | vite-plugin-pwa (Workbox) |
| **Routing** | React Router DOM |
| **State** | Zustand + Persist |
| **Backend** | Supabase |
| **IA** | Google Gemini API |
| **Pagamentos** | InfinityPay |
| **Estilo** | CSS Modules + CSS Variables |

---

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone <repo-url>
cd foodflow
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure variáveis de ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Preencha com suas credenciais:
- **Supabase**: URL e ANON_KEY do projeto
- **Gemini**: API Key do Google AI Studio
- **InfinityPay**: Chaves de API

### 4. Execute o Supabase Schema
No painel do Supabase, execute o script `supabase/schema.sql`

### 5. Rode o projeto
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📱 Build para Produção

### Build Web
```bash
npm run build
```

### Preview Local
```bash
npm run preview
```

### Deploy
O projeto foi otimizado para deploy em:
- **Vercel** (recomendado)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

---

## 🎨 Design System

O FoodFlow usa um design system customizado com:

### Cores
- **Primary**: `#0df26c` (Verde Neon)
- **Background**: `#102217` (Verde Escuro)
- **Surface**: `#1A2E23`
- **Text Secondary**: `#9cbaa8`

### Tipografia
- **Font**: Manrope (Google Fonts)
- **Icons**: Material Symbols Outlined

### Dark Mode
O app é **dark mode** por padrão, com suporte nativo para iOS e Android.

---

## 📂 Estrutura de Pastas

```
foodflow/
├── public/              # Assets estáticos + PWA icons
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── ui/          # Button, Input, ProgressBar, RadioCard
│   ├── pages/           # Páginas da aplicação
│   │   ├── Welcome/     # Onboarding inicial
│   │   ├── Onboarding/  # Cadastro multi-step
│   │   ├── Goals/       # Seleção de metas
│   │   ├── Dashboard/   # Dashboard principal
│   │   ├── AddMeal/     # Registro de refeições
│   │   └── Tips/        # Dicas da IA
│   ├── stores/          # Zustand store (estado global)
│   ├── services/        # APIs (Supabase, Gemini)
│   ├── types/           # TypeScript types
│   ├── styles/          # CSS global + design system
│   └── App.tsx          # Router principal
├── supabase/
│   └── schema.sql       # Schema do banco de dados
└── vite.config.ts       # Configuração PWA
```

---

## 🔐 Segurança e Legal

> ⚠️ **IMPORTANTE**: Este app **NÃO substitui** um nutricionista certificado.

O FoodFlow:
- NÃO prescreve dietas
- NÃO sugere alimentos específicos
- NÃO monta cardápios

Utiliza termos como **"meta"**, **"faixa"** e **"estimativa"** para evitar responsabilidade médica.

---

## 🚧 Roadmap

### Fase 1 (Atual)
- [x] Setup base do projeto
- [x] Design system completo
- [x] Páginas principais
- [x] PWA configurado
- [ ] Integração Supabase
- [ ] Integração Gemini API
- [ ] Integração InfinityPay

### Fase 2 (Futuro)
- [ ] Registro por foto (IA)
- [ ] Ajuste automático de metas
- [ ] Relatórios PDF mensais
- [ ] Gamificação avançada
- [ ] Integração com wearables

---

## 📄 Licença

Este projeto é **privado e proprietário**.

---

**Feito com ❤️ e IA**
