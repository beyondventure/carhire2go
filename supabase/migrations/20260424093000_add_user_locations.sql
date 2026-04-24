CREATE TABLE public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('recent', 'saved')),
  label TEXT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  dedupe_key TEXT NOT NULL,
  use_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX user_locations_user_kind_dedupe_idx
  ON public.user_locations (user_id, kind, dedupe_key);

CREATE INDEX user_locations_recent_lookup_idx
  ON public.user_locations (user_id, kind, last_used_at DESC);

CREATE POLICY "Users can view their own user locations"
  ON public.user_locations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own user locations"
  ON public.user_locations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user locations"
  ON public.user_locations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user locations"
  ON public.user_locations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_locations_updated_at
  BEFORE UPDATE ON public.user_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
