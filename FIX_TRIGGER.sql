-- ============================================
-- 🔧 SCRIPT DE CORREÇÃO - Trigger handle_new_user
-- ============================================
-- Execute este script para corrigir o erro de cadastro
-- ============================================

-- 1. REMOVER trigger e função antigos (se existirem)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. RECRIAR função corrigida
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar profile básico
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );

    -- Criar registro de streak
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECRIAR trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 4. ADICIONAR política RLS para INSERT em profiles (se não existir)
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
CREATE POLICY "Allow service role to insert profiles" ON profiles
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- ✅ PRONTO! Tente cadastrar novamente
-- ============================================
