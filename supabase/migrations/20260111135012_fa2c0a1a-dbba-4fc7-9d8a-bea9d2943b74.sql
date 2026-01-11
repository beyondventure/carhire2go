-- Add allows_negotiation field to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS allows_negotiation BOOLEAN NOT NULL DEFAULT true;

-- Add index for faster queries (if not exists, drop and recreate)
DROP INDEX IF EXISTS idx_providers_allows_negotiation;
CREATE INDEX idx_providers_allows_negotiation ON public.providers(allows_negotiation);