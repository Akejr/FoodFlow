-- ============================================
-- 🔧 DIAGNÓSTICO E CORREÇÃO COMPLETA
-- ============================================
-- Execute TUDO para verificar e corrigir
-- ============================================

-- PASSO 1: VERIFICAR SE TRIGGER EXISTE
-- (Copie o resultado para me mostrar)
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Se não mostrou nada, o trigger NÃO EXISTE!

-- ============================================
-- PASSO 2: RECRIAR TUDO DO ZERO
-- ============================================

-- 2.1 Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2.2 Criar função CORRIGIDA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Criar profile básico
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        'student'
    );

    -- Criar streak
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 3: ADICIONAR POLÍTICAS RLS PARA PROFILES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;

-- Permitir SELECT (ver próprio perfil)
CREATE POLICY "Users can view own profile" 
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Permitir UPDATE (atualizar próprio perfil)
CREATE POLICY "Users can update own profile" 
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Permitir INSERT via trigger (DEFINER)
CREATE POLICY "Allow authenticated inserts" 
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- PASSO 4: TESTAR O TRIGGER MANUALMENTE
-- ============================================

-- LIMPE usuários de teste antigos primeiro:
-- Vá em Authentication -> Users e DELETE todos

-- Depois tente cadastrar novamente no app!

-- ============================================
-- VERIFICAÇÃO APÓS CADASTRO:
-- ============================================

-- Execute isso para ver se funcionou:
-- SELECT * FROM profiles;
-- SELECT * FROM student_profiles;

-- ============================================
-- ✅ TUDO PRONTO! 
-- ============================================
