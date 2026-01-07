# ⚠️ ERRO: Anonymous sign-ins are disabled

## 🔍 Diagnóstico
O Supabase está bloqueando o cadastro porque a autenticação por email não está habilitada.

---

## ✅ SOLUÇÃO: Habilitar Email Authentication

### Passo 1: Abra Authentication Settings

**Link direto:**  
https://supabase.com/dashboard/project/lymtmskfptmrpmixfwgv/auth/providers

### Passo 2: Habilite Email Provider

1. Procure por **"Email"** na lista de providers
2. Clique para abrir as configurações
3. **Habilite** o toggle "Enable Email provider"
4. Clique em **Save**

### Passo 3: Desabilite confirmação de email (Para teste)

**Link direto:**  
https://supabase.com/dashboard/project/lymtmskfptmrpmixfwgv/auth/url-configuration

1. Procure por **"Enable email confirmations"**
2. **DESABILITE** este toggle (para facilitar testes)
3. Clique em **Save**

> Você pode reabilitar depois quando for para produção!

---

## 🧪 Depois de Configurar

1. Recarregue a página do app (F5)
2. Tente cadastrar novamente
3. Deve funcionar! ✅

---

## 📋 Checklist de Configuração

- [ ] Email provider habilitado
- [ ] Email confirmations desabilitado (para teste)
- [ ] Página recarregada
- [ ] Teste de cadastro
