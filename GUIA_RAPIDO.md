# FoodFlow - Guia Rápido 🚀

## 🏃 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev
```
- Inicia servidor de desenvolvimento
- Hot reload automático
- Acesse: http://localhost:5173

### Build de Produção
```bash
npm run build
```
- Compila TypeScript + Vite
- Gera PWA com service worker
- Output: pasta `dist/`

### Preview
```bash
npm run preview
```
- Visualiza build de produção localmente
- Acesse: http://localhost:4173

---

## 🗺️ Navegação do App

### Rotas Principais
- `/` - Welcome (tela inicial)
- `/onboarding` - Cadastro em 3 etapas
- `/goals` - Seleção de plano nutricional
- `/dashboard` - Dashboard principal
- `/add-meal` - Registrar refeição
- `/tips` - Dicas da IA

### Fluxo Esperado
1. Welcome → Clique "Iniciar Cadastro"
2. Onboarding → Preencha 3 etapas
3. Goals → Selecione um plano
4. Dashboard → Visualize progresso
5. AddMeal (via FAB +) → Registre refeições
6. Tips → Veja dicas personalizadas

---

## 🎨 Design System

### Cores Principais
```css
--color-primary: #0df26c (Verde Neon)
--color-bg-dark: #102217 (Verde Escuro)
--color-surface-dark: #1A2E23
--color-text-primary: #ffffff
--color-text-secondary: #9cbaa8
```

### Componentes Disponíveis
```tsx
import { Button, Input, Select, ProgressBar, RadioCardGroup } from '@/components/ui';

// Exemplo de uso
<Button variant="primary" size="lg" icon="check">
  Confirmar
</Button>

<Input 
  label="Nome"
  iconLeft="person"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<Select
  label="Opção"
  value={value}
  onChange={setValue}
  options={[...]}
/>
```

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# Gemini API
VITE_GEMINI_API_KEY=sua-chave-gemini

# InfinityPay (Opcional)
VITE_INFINITYPAY_API_KEY=sua-chave
VITE_INFINITYPAY_SECRET=seu-secret
```

### Supabase Setup
1. Crie projeto em supabase.com
2. Execute `supabase/schema.sql` no SQL Editor
3. Copie URL e ANON_KEY para `.env`

---

## 📱 Testes PWA

### Android (Chrome)
1. Acesse o app em https://seu-dominio.com
2. Chrome → Menu → "Instalar app"
3. Ícone adicionado à tela inicial
4. Teste offline: modo avião + navegue

### iOS (Safari)
1. Acesse o app em Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. Ícone adicionado
4. Teste notch e safe areas

---

## 🐛 Debug

### Dev Tools
```javascript
// Acessar store no console
import { useAppStore } from '@/stores/appStore';
const store = useAppStore.getState();
console.log(store);
```

### Limpar Cache PWA
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

### Rebuild Completo
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 📦 Deploy

### Vercel (Recomendado)
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

### Variáveis no Deploy
Adicione no painel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

---

## 🎯 Próximas Implementações

### Prioridade Alta
1. **Login/Cadastro Real**
   - Integrar `supabase.auth.signUp()`
   - Páginas de login e registro
   
2. **Persistência de Dados**
   - Salvar refeições no Supabase
   - Fetch de metas do usuário

3. **Cálculo de IA**
   - Integrar Gemini API
   - Endpoint para calcular metas

### Prioridade Média
4. **Página de Diário**
   - Lista de refeições do dia/semana
   - Filtros e busca

5. **Página de Perfil**
   - Editar dados pessoais
   - Alterar metas manualmente

6. **Notificações**
   - Push notifications
   - Lembretes de refeições

### Recursos Futuros
7. **Foto de Alimentos**
   - Upload de imagem
   - IA para identificar alimento

8. **Gráficos de Progresso**
   - Charts.js ou Recharts
   - Evolução semanal/mensal

9. **Área do Personal**
   - Dashboard de alunos
   - Status de aderência

---

## 📚 Recursos Úteis

- **Vite**: https://vitejs.dev
- **React Router**: https://reactrouter.com
- **Supabase**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev
- **Material Icons**: https://fonts.google.com/icons

---

## 🆘 Troubleshooting

### Build Falha
```bash
# Verificar erros TypeScript
npx tsc --noEmit

# Limpar cache
rm -rf node_modules/.vite
npm run dev
```

### PWA Não Atualiza
```bash
# No navegador
Application → Service Workers → Unregister
Hard Reload (Ctrl+Shift+R)
```

### Estilos Não Aplicam
```bash
# Verificar import do index.css no main.tsx
# Limpar build
rm -rf dist
npm run build
```

---

**FoodFlow está pronto para desenvolvimento!** 🎉

Para dúvidas: revise a documentação em `walkthrough.md` e `implementation_plan.md`
