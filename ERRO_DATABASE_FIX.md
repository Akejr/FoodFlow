# ⚠️ ERRO: Database error saving new user

## 🔍 Diagnóstico

**Erro:** `AuthApiError: Database error saving new user`  
**Causa:** As tabelas do banco de dados **NÃO foram criadas** no Supabase ainda!

---

## ✅ SOLUÇÃO: Execute o Script SQL

### Passo 1: Abra o Supabase SQL Editor

**Link direto:**  
https://supabase.com/dashboard/project/lymtmskfptmrpmixfwgv/sql/new

### Passo 2: Cole o script completo

Abra o arquivo: `EXECUTE_NO_SUPABASE.md`

Copie **TODO** o conteúdo do bloco SQL (a partir de `CREATE EXTENSION...` até o final).

### Passo 3: Execute

1. Cole no SQL Editor
2. Clique em **RUN** (ou pressione Ctrl+Enter)
3. Aguarde a confirmação "Success"

### Passo 4: Verifique

Vá em **Table Editor** e confirme que as seguintes tabelas foram criadas:
- ✅ `profiles`
- ✅ `student_profiles`
- ✅ `nutrition_goals`
- ✅ `foods`
- ✅ `meal_logs`
- ✅ `ai_tips`
- ✅ `user_streaks`
- ✅ `subscriptions`

---

## 🔄 Depois de Executar

1. **Recarregue a página** do app (F5)
2. **Tente cadastrar novamente**
3. Deve funcionar! ✅

---

## 📋 Verificação Rápida

Se ainda der erro, verifique no Supabase:

1. **Authentication** → **Users**: usuário foi criado?
   - ✅ SIM: Problema está no trigger/tabelas
   - ❌ NÃO: Problema na autenticação

2. **Table Editor** → `profiles`: tabela existe?
   - ✅ SIM: Trigger funcionou
   - ❌ NÃO: Execute o script SQL novamente

---

## 🆘 Se Continuar com Erro

Me avise qual mensagem aparece depois de executar o script SQL!
