-- 1. Modifications to Bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS ignored_providers UUID[] DEFAULT '{}'::uuid[];

-- 2. Update status transitions to allow matched -> matching (timeout fallback)
CREATE OR REPLACE FUNCTION public.is_valid_booking_transition(
  p_old_status public.booking_status,
  p_new_status public.booking_status
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_old_status = p_new_status THEN true
    WHEN p_old_status = 'pending' THEN p_new_status IN ('matching', 'cancelled')
    WHEN p_old_status = 'matching' THEN p_new_status IN ('matched', 'pending', 'cancelled')
    WHEN p_old_status = 'matched' THEN p_new_status IN ('negotiating', 'confirmed', 'cancelled', 'matching')
    WHEN p_old_status = 'negotiating' THEN p_new_status IN ('matched', 'confirmed', 'cancelled')
    WHEN p_old_status = 'confirmed' THEN p_new_status IN ('in-progress', 'cancelled')
    WHEN p_old_status = 'in-progress' THEN p_new_status IN ('completed', 'cancelled')
    ELSE false
  END;
$$;

-- 3. Update assignment RPC
CREATE OR REPLACE FUNCTION public.assign_provider_to_booking(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_provider_id UUID;
BEGIN
  SELECT *
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'booking_not_found');
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> v_booking.consumer_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF v_booking.status NOT IN ('pending', 'matching') THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'booking_not_matchable',
      'status', v_booking.status
    );
  END IF;

  SELECT p.id
  INTO v_provider_id
  FROM public.providers p
  JOIN public.vehicles v ON v.provider_id = p.id
  WHERE p.verification_status = 'approved'
    AND v.available = true
    AND v.verified = true
    AND NOT (p.id = ANY(COALESCE(v_booking.ignored_providers, '{}'::uuid[])))
    AND (
      v_booking.vehicle_preference IS NULL
      OR v.vehicle_type = v_booking.vehicle_preference
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.bookings b2
      WHERE b2.provider_id = p.id
        AND b2.status IN ('matched', 'negotiating', 'confirmed', 'in-progress')
    )
  GROUP BY p.id, p.rating
  ORDER BY p.rating DESC NULLS LAST, random()
  LIMIT 1;

  IF v_provider_id IS NULL THEN
    UPDATE public.bookings
    SET status = 'matching'
    WHERE id = v_booking.id;

    RETURN jsonb_build_object('ok', true, 'matched', false);
  END IF;

  UPDATE public.bookings
  SET
    provider_id = v_provider_id,
    status = 'matched',
    matched_at = now()
  WHERE id = v_booking.id;

  RETURN jsonb_build_object(
    'ok', true,
    'matched', true,
    'provider_id', v_provider_id
  );
END;
$$;

-- 4. Sweep function
CREATE OR REPLACE FUNCTION public.sweep_expired_provider_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
  SET 
    ignored_providers = array_append(COALESCE(ignored_providers, '{}'::uuid[]), provider_id),
    status = 'matching',
    provider_id = NULL,
    matched_at = NULL
  WHERE status = 'matched' 
    AND matched_at < (now() - interval '60 seconds');
END;
$$;

-- Schedule the sweep function using pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

SELECT cron.schedule(
  'sweep-expired-provider-matches', 
  '* * * * *', 
  $$SELECT public.sweep_expired_provider_matches()$$
);

-- 5. Settlements and Earnings
CREATE TYPE public.settlement_status AS ENUM ('pending', 'processing', 'completed');

CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status settlement_status NOT NULL DEFAULT 'pending',
  reference TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers view own settlements" ON public.settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all settlements" ON public.settlements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Provider earnings view
CREATE OR REPLACE VIEW public.provider_earnings_view AS
SELECT 
  p.id as provider_id,
  COALESCE(sum(b.final_price), 0) * 0.85 as total_earned,
  COALESCE((
    SELECT sum(amount) FROM public.settlements s WHERE s.provider_id = p.id AND s.status = 'completed'
  ), 0) as total_settled,
  (COALESCE(sum(b.final_price), 0) * 0.85) - COALESCE((
    SELECT sum(amount) FROM public.settlements s WHERE s.provider_id = p.id AND s.status = 'completed'
  ), 0) as pending_balance
FROM public.providers p
LEFT JOIN public.bookings b ON b.provider_id = p.id AND b.status = 'completed'
GROUP BY p.id;

-- 6. Admin Analytics RPC
CREATE OR REPLACE FUNCTION public.get_admin_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_bookings INT;
  v_total_gmv NUMERIC;
  v_total_providers INT;
  v_total_consumers INT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT count(*) INTO v_total_bookings FROM public.bookings;
  SELECT sum(final_price) INTO v_total_gmv FROM public.bookings WHERE status = 'completed';
  SELECT count(*) INTO v_total_providers FROM public.providers WHERE verification_status = 'approved';
  SELECT count(*) INTO v_total_consumers FROM public.user_roles WHERE role = 'consumer';

  RETURN jsonb_build_object(
    'total_bookings', v_total_bookings,
    'total_gmv', COALESCE(v_total_gmv, 0),
    'active_providers', v_total_providers,
    'active_consumers', v_total_consumers
  );
END;
$$;
