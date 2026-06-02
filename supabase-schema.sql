-- ============================================
-- 人生时间轴 Hub - Supabase 建表 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 用户资料表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'sponsor', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自动创建 profile（用户注册时触发）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. 时间轴条目表
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.timeline_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_year ON public.timeline_entries(year);
CREATE INDEX IF NOT EXISTS idx_entries_public ON public.timeline_entries(is_public) WHERE is_public = true;

-- 3. AI 使用次数表
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage(user_id, date);

-- ============================================
-- RLS 行级安全策略
-- ============================================

-- profiles 表
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看公开的个人资料
CREATE POLICY "公开资料可查看" ON public.profiles
  FOR SELECT USING (true);

-- 用户只能修改自己的资料
CREATE POLICY "用户可编辑自己的资料" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- timeline_entries 表
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;

-- 任何人都可查看公开条目
CREATE POLICY "公开条目可查看" ON public.timeline_entries
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- 用户只能增删改自己的条目
CREATE POLICY "用户可创建自己的条目" ON public.timeline_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可修改自己的条目" ON public.timeline_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的条目" ON public.timeline_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ai_usage 表
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的用量
CREATE POLICY "用户可查看自己的AI用量" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可插入自己的AI用量" ON public.ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的AI用量" ON public.ai_usage
  FOR UPDATE USING (auth.uid() = user_id);