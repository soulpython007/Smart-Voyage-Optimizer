-- Smart Voyage Optimizer - Initial Schema
-- Run this in Supabase SQL Editor

-- Users are managed by Supabase Auth; we store app-specific metadata
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_ship_type TEXT DEFAULT 'cargo',
  dark_mode BOOLEAN DEFAULT false,
  optimization_mode TEXT DEFAULT 'eco',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  departure_port_id TEXT NOT NULL,
  departure_port_name TEXT NOT NULL,
  destination_port_id TEXT NOT NULL,
  destination_port_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  waypoints JSONB NOT NULL DEFAULT '[]',
  distance_nm NUMERIC,
  eta_hours NUMERIC,
  fuel_estimate_tonnes NUMERIC,
  risk_score NUMERIC,
  route_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voyage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.saved_routes(id) ON DELETE SET NULL,
  departure_port_id TEXT NOT NULL,
  departure_port_name TEXT NOT NULL,
  destination_port_id TEXT NOT NULL,
  destination_port_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  distance_nm NUMERIC,
  eta_hours NUMERIC,
  fuel_estimate_tonnes NUMERIC,
  risk_score NUMERIC,
  optimization_result JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT false,
  preferred_optimization_mode TEXT DEFAULT 'eco',
  map_settings JSONB DEFAULT '{"zoom": 4, "center": [0, 72]}',
  selected_ship_type TEXT DEFAULT 'cargo',
  show_weather BOOLEAN DEFAULT true,
  show_currents BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON public.saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_voyage_history_user_id ON public.voyage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_voyage_history_started_at ON public.voyage_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_routes_created_at ON public.saved_routes(created_at DESC);

-- Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own saved routes"
  ON public.saved_routes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own voyage history"
  ON public.voyage_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voyage history"
  ON public.voyage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
