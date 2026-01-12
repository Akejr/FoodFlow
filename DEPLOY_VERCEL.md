# 🚀 Guia de Deploy na Vercel - FoodFlow

## ❌ Problema: "API Key Inválida" em Produção

Quando você faz deploy na Vercel, as variáveis de ambiente do arquivo `.env` local **NÃO são enviadas automaticamente**. Você precisa configurá-las manualmente no dashboard da Vercel.

---

## ✅ Solução: Configurar Variáveis de Ambiente na Vercel

### Passo 1: Acessar Configurações
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto **FoodFlow**
3. Vá em **Settings** (ícone de engrenagem)
4. Clique em **Environment Variables** no menu lateral

### Passo 2: Adicionar as 3 Variáveis Obrigatórias

#### 1️⃣ Supabase URL
```
Name: VITE_SUPABASE_URL
Value: https://lymtmskfptmrpmixfwgv.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 2️⃣ Supabase Anon Key
```
Name: VITE_SUPABASE_ANON_KEY
Value: [copie do Supabase Dashboard → Settings → API → anon public]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 3️⃣ OpenAI API Key
```
Name: VITE_OPENAI_API_KEY
Value: sk-proj-[SUA-CHAVE-AQUI]
Environments: ✅ Production ✅ Preview ✅ Development
```

### Passo 3: Fazer Redeploy
Após adicionar as variáveis:
1. Vá em **Deployments** (no topo)
2. Clique nos **3 pontinhos (...)** do último deploy
3. Clique em **Redeploy**
4. ✅ Marque **"Use existing Build Cache"** (mais rápido)
5. Clique em **Redeploy**

⏱️ Aguarde 1-2 minutos para o deploy completar.

---

## 🔑 Onde Encontrar as Chaves?

### Supabase (URL + Anon Key)
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (chave pública) → `VITE_SUPABASE_ANON_KEY`

### OpenAI API Key
1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em **+ Create new secret key**
3. Dê um nome (ex: "FoodFlow Production")
4. Copie a chave → `VITE_OPENAI_API_KEY`
5. ⚠️ **Guarde em local seguro** - ela só aparece uma vez!

---

## 🧪 Como Testar se Funcionou?

Após o redeploy:
1. Acesse seu site em produção
2. Abra o **DevTools** (F12)
3. Vá em **Console**
4. Tente adicionar uma refeição e calcular macros
5. Se funcionar = ✅ Sucesso!
6. Se der erro = verifique se as variáveis foram salvas corretamente

---

## ⚠️ Segurança - IMPORTANTE

### ✅ O que PODE ser público:
- `VITE_SUPABASE_URL` - URL do projeto
- `VITE_SUPABASE_ANON_KEY` - Chave pública (protegida por RLS)

### ❌ O que NUNCA deve ser exposto:
- `SUPABASE_SERVICE_ROLE_KEY` - Chave privada (bypass RLS)
- Senhas de banco de dados
- Chaves privadas de APIs

### 🔒 Proteção Adicional:
- O arquivo `.env` está no `.gitignore` (não vai para o GitHub)
- As variáveis na Vercel são criptografadas
- A OpenAI API Key tem rate limiting por padrão

---

## 🐛 Troubleshooting

### Erro: "API Key Inválida" ainda aparece
- ✅ Verifique se fez o **Redeploy** após adicionar as variáveis
- ✅ Confirme que marcou **Production** ao adicionar a variável
- ✅ Teste a chave da OpenAI em [platform.openai.com/playground](https://platform.openai.com/playground)

### Erro: "Failed to fetch" ou "Network Error"
- ✅ Verifique se o Supabase URL está correto
- ✅ Confirme que a Anon Key está correta
- ✅ Teste no Supabase Dashboard se o projeto está ativo

### Erro: "Insufficient credits" (OpenAI)
- ✅ Acesse [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
- ✅ Adicione créditos ou configure um método de pagamento
- ✅ Verifique se não atingiu o limite de uso

---

## 📚 Recursos Úteis

- [Documentação Vercel - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Documentação Supabase - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Documentação OpenAI - API Keys](https://platform.openai.com/docs/api-reference/authentication)

---

## ✅ Checklist Final

Antes de fazer deploy:
- [ ] Variáveis adicionadas na Vercel
- [ ] Redeploy realizado
- [ ] Site testado em produção
- [ ] Cálculo de macros funcionando
- [ ] Salvamento de refeições funcionando
- [ ] `.env` está no `.gitignore`
- [ ] Nenhuma chave secreta no código

---

**Última atualização:** 07/01/2026
