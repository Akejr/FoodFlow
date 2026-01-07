-- ============================================
-- 🔧 CORREÇÃO FINAL - Políticas RLS student_profiles
-- ============================================
-- Erro 400: Falta permissão para INSERT
-- ============================================

-- 1. REMOVER políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can insert own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can view own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update own student profile" ON student_profiles;

-- 2. CRIAR políticas corretas

-- Permitir INSERT (durante cadastro)
CREATE POLICY "Users can insert own student profile" 
ON student_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT (visualizar próprio perfil)
CREATE POLICY "Users can view own student profile" 
ON student_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Permitir UPDATE (atualizar próprio perfil)
CREATE POLICY "Users can update own student profile" 
ON student_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- ✅ PRONTO! Tente cadastrar novamente
-- ============================================
