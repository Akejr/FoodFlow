-- ============================================
-- FOODFLOW - SUPABASE DATABASE SCHEMA
-- ============================================
-- App de Acompanhamento Alimentar com IA
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES & USER DATA
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'trainer')) NOT NULL DEFAULT 'student',
    trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student physical profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    age INTEGER NOT NULL CHECK (age between 10 AND 120),
    sex TEXT CHECK (sex IN ('male', 'female', 'other')) NOT NULL,
    height_cm INTEGER NOT NULL CHECK (height_cm BETWEEN 100 AND 250),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg BETWEEN 20 AND 300),
    goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')) NOT NULL,
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. NUTRITION GOALS
-- ============================================

CREATE TABLE nutrition_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    calories INTEGER NOT NULL CHECK (calories BETWEEN 1000 AND 6000),
    protein_g INTEGER NOT NULL CHECK (protein_g BETWEEN 50 AND 500),
    carbs_min_g INTEGER NOT NULL CHECK (carbs_min_g BETWEEN 50 AND 1000),
    carbs_max_g INTEGER NOT NULL CHECK (carbs_max_g BETWEEN 50 AND 1000),
    fat_min_g INTEGER NOT NULL CHECK (fat_min_g BETWEEN 20 AND 300),
    fat_max_g INTEGER NOT NULL CHECK (fat_max_g BETWEEN 20 AND 300),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FOODS DATABASE
-- ============================================

CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    calories_per_100g INTEGER NOT NULL CHECK (calories_per_100g BETWEEN 0 AND 900),
    protein_per_100g DECIMAL(5,2) NOT NULL CHECK (protein_per_100g >= 0),
    carbs_per_100g DECIMAL(5,2) NOT NULL CHECK (carbs_per_100g >= 0),
    fat_per_100g DECIMAL(5,2) NOT NULL CHECK (fat_per_100g >= 0),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for food search
CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_foods_custom_user ON foods(created_by) WHERE is_custom = TRUE;

-- ============================================
-- 4. MEAL LOGS
-- ============================================

CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity_g INTEGER NOT NULL CHECK (quantity_g BETWEEN 1 AND 10000),
    calories INTEGER NOT NULL,
    protein DECIMAL(6,2) NOT NULL,
    carbs DECIMAL(6,2) NOT NULL,
    fat DECIMAL(6,2) NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, logged_at DESC);
CREATE INDEX idx_meal_logs_date ON meal_logs(logged_at DESC);

-- ============================================
-- 5. FAVORITE FOODS
-- ============================================

CREATE TABLE favorite_foods (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, food_id)
);

-- ============================================
-- 6. AI TIPS
-- ============================================

CREATE TABLE ai_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tip_text TEXT NOT NULL,
    tip_type TEXT CHECK (tip_type IN ('daily', 'weekly', 'achievement', 'warning', 'info')) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_tips_user_unread ON ai_tips(user_id, created_at DESC) WHERE is_read = FALSE;

-- ============================================
-- 7. USER STREAKS & ENGAGEMENT
-- ============================================

CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date DATE,
    weekly_adherence INTEGER DEFAULT 0 CHECK (weekly_adherence BETWEEN 0 AND 100),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'pending')) NOT NULL DEFAULT 'pending',
    infinitypay_subscription_id TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_trainer ON subscriptions(trainer_id) WHERE status = 'active';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own profile and their trainer
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Trainers can view their students" ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'trainer'
            AND profiles.trainer_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Student Profiles: User can manage own profile
CREATE POLICY "Users can view own student profile" ON student_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own student profile" ON student_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own student profile" ON student_profiles FOR UPDATE
    USING (user_id = auth.uid());

-- Nutrition Goals: User can manage own goals
CREATE POLICY "Users can view own goals" ON nutrition_goals FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own goals" ON nutrition_goals FOR ALL
    USING (user_id = auth.uid());

-- Foods: Public foods are viewable, custom foods only by creator
CREATE POLICY "Anyone can view public foods" ON foods FOR SELECT
    USING (is_custom = FALSE OR created_by = auth.uid());

CREATE POLICY "Users can create custom foods" ON foods FOR INSERT
    WITH CHECK (created_by = auth.uid() AND is_custom = TRUE);

-- Meal Logs: User can manage own logs
CREATE POLICY "Users can view own meal logs" ON meal_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal logs" ON meal_logs FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meal logs" ON meal_logs FOR DELETE
    USING (user_id = auth.uid());

-- Favorite Foods: User can manage own favorites
CREATE POLICY "Users can manage own favorites" ON favorite_foods FOR ALL
    USING (user_id = auth.uid());

-- AI Tips: User can view own tips
CREATE POLICY "Users can view own tips" ON ai_tips FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can mark tips as read" ON ai_tips FOR UPDATE
    USING (user_id = auth.uid());

-- User Streaks: User can view and update own streaks
CREATE POLICY "Users can manage own streaks" ON user_streaks FOR ALL
    USING (user_id = auth.uid());

-- Subscriptions: User can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT
    USING (user_id = auth.uid() OR trainer_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );

    -- Create streak record
    INSERT INTO user_streaks (user_id) VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA - Common Foods
-- ============================================

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_custom) VALUES
('Peito de Frango Grelhado', 165, 31, 0, 3.6, FALSE),
('Arroz Branco Cozido', 130, 2.7, 28, 0.3, FALSE),
('Feijão Preto Cozido', 132, 8.9, 23.7, 0.5, FALSE),
('Batata Doce Cozida', 86, 1.6, 20, 0.1, FALSE),
('Ovo Cozido', 155, 13, 1.1, 11, FALSE),
('Banana', 89, 1.1, 23, 0.3, FALSE),
('Maçã', 52, 0.3, 14, 0.2, FALSE),
('Aveia', 389, 17, 66, 7, FALSE),
('Iogurte Grego Natural', 59, 10, 3.6, 0.4, FALSE),
('Whey Protein (1 scoop)', 120, 24, 3, 1.5, FALSE),
('Café Gelado (sem açúcar)', 2, 0, 0, 0, FALSE),
('Salmão Grelhado', 206, 22, 0, 13, FALSE),
('Brócolis Cozido', 35, 2.4, 7, 0.4, FALSE),
('Azeite de Oliva (1 colher)', 119, 0, 0, 13.5, FALSE),
('Pão Integral (1 fatia)', 69, 3.6, 11.6, 1.1, FALSE);

-- ============================================
-- ANALYTICS VIEWS (Optional)
-- ============================================

-- Daily nutrition summary view
CREATE VIEW daily_nutrition_summary AS
SELECT
    user_id,
    DATE(logged_at) as log_date,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbs) as total_carbs,
    SUM(fat) as total_fat,
    COUNT(*) as meal_count
FROM meal_logs
GROUP BY user_id, DATE(logged_at);

-- ============================================
-- DONE! 🎉
-- ============================================
-- Next steps:
-- 1. Create Supabase Edge Functions for IA calculations
-- 2. Configure Gemini API credentials
-- 3. Setup InfinityPay webhooks
-- ============================================
