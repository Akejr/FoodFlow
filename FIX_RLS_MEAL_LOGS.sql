-- ============================================
-- FIX: Políticas RLS para meal_logs
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own meal logs" ON meal_logs;
DROP POLICY IF EXISTS "Users can insert own meal logs" ON meal_logs;
DROP POLICY IF EXISTS "Users can delete own meal logs" ON meal_logs;
DROP POLICY IF EXISTS "Users can update own meal logs" ON meal_logs;

-- 2. Criar novas políticas mais permissivas

-- Permitir SELECT (visualizar próprias refeições)
CREATE POLICY "Enable read access for users" ON meal_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Permitir INSERT (adicionar refeições)
CREATE POLICY "Enable insert for authenticated users" ON meal_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE (excluir próprias refeições)
CREATE POLICY "Enable delete for users" ON meal_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Permitir UPDATE (atualizar próprias refeições)
CREATE POLICY "Enable update for users" ON meal_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Verificar se RLS está habilitado
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TESTE: Execute este SELECT para verificar
-- ============================================
-- SELECT * FROM meal_logs WHERE user_id = auth.uid();
-- 
-- Se retornar dados, as políticas estão funcionando!
-- ============================================
