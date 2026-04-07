-- Consumer backend MVP hardening:
-- - payment verification + webhook idempotency
-- - atomic payment->booking confirmation
-- - provider matching RPC
-- - push trigger + failure logging
-- - persisted consumer preferences

-- -----------------------------
-- Payments hardening
-- -----------------------------
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS checkout_reference TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key_unique
  ON public.payments (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_flutterwave_ref_unique
  ON public.payments (flutterwave_ref)
  WHERE flutterwave_ref IS NOT NULL;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'successful', 'failed', 'cancelled'));

-- Webhook event ledger for replay protection and auditability
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'flutterwave',
  provider_event_id TEXT NOT NULL,
  tx_ref TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_event_id)
);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view webhook events" ON public.payment_webhook_events;
CREATE POLICY "Admins can view webhook events"
  ON public.payment_webhook_events
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- -----------------------------
-- Atomic payment confirmation RPC
-- -----------------------------
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_flutterwave_ref TEXT,
  p_flutterwave_tx_id TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_verified_amount NUMERIC DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_request_role TEXT;
  v_is_service_role BOOLEAN := false;
BEGIN
  v_request_role := current_setting('request.jwt.claim.role', true);
  v_is_service_role := COALESCE(v_request_role = 'service_role', false);

  SELECT *
  INTO v_payment
  FROM public.payments
  WHERE flutterwave_ref = p_flutterwave_ref
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'payment_not_found'
    );
  END IF;

  IF v_payment.status = 'successful' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'already_processed', true,
      'booking_id', v_payment.booking_id,
      'payment_id', v_payment.id
    );
  END IF;

  IF v_payment.status IN ('failed', 'cancelled') THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'payment_terminal_state',
      'status', v_payment.status
    );
  END IF;

  IF NOT v_is_service_role THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF v_payment.consumer_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Forbidden';
    END IF;
  END IF;

  IF p_verified_amount IS NOT NULL AND v_payment.amount <> p_verified_amount THEN
    UPDATE public.payments
    SET
      status = 'failed',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'failure_reason', 'amount_mismatch',
        'verified_amount', p_verified_amount
      ),
      verified_at = now()
    WHERE id = v_payment.id;

    RETURN jsonb_build_object(
      'ok', false,
      'code', 'amount_mismatch',
      'expected_amount', v_payment.amount,
      'verified_amount', p_verified_amount
    );
  END IF;

  UPDATE public.payments
  SET
    status = 'successful',
    flutterwave_tx_id = COALESCE(p_flutterwave_tx_id, flutterwave_tx_id),
    payment_method = COALESCE(p_payment_method, payment_method),
    metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb),
    verified_at = now()
  WHERE id = v_payment.id;

  UPDATE public.bookings
  SET
    status = CASE
      WHEN status IN ('completed', 'cancelled') THEN status
      ELSE 'confirmed'
    END,
    confirmed_at = CASE
      WHEN status IN ('completed', 'cancelled') THEN confirmed_at
      ELSE COALESCE(confirmed_at, now())
    END,
    final_price = COALESCE(final_price, v_payment.amount)
  WHERE id = v_payment.booking_id;

  RETURN jsonb_build_object(
    'ok', true,
    'already_processed', false,
    'booking_id', v_payment.booking_id,
    'payment_id', v_payment.id
  );
END;
$$;

-- -----------------------------
-- Booking status transition guard
-- -----------------------------
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
    WHEN p_old_status = 'matched' THEN p_new_status IN ('negotiating', 'confirmed', 'cancelled')
    WHEN p_old_status = 'negotiating' THEN p_new_status IN ('matched', 'confirmed', 'cancelled')
    WHEN p_old_status = 'confirmed' THEN p_new_status IN ('in-progress', 'cancelled')
    WHEN p_old_status = 'in-progress' THEN p_new_status IN ('completed', 'cancelled')
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_booking_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.is_valid_booking_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid booking status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_booking_status_transition ON public.bookings;
CREATE TRIGGER trigger_enforce_booking_status_transition
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_booking_status_transition();

-- -----------------------------
-- Provider matching RPC
-- -----------------------------
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

-- -----------------------------
-- Push pipeline completion
-- -----------------------------
CREATE TABLE IF NOT EXISTS public.push_delivery_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_delivery_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view push failures" ON public.push_delivery_failures;
CREATE POLICY "Admins can view push failures"
  ON public.push_delivery_failures
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  payload JSONB;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  payload := json_build_object(
    'type', 'INSERT',
    'table', 'notifications',
    'record', json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'type', NEW.type,
      'related_booking_id', NEW.related_booking_id
    )
  )::jsonb;

  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-push-notification',
    body := payload::text,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )::jsonb
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.push_delivery_failures(notification_id, error_message, payload)
  VALUES (NEW.id, SQLERRM, payload);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_push_notification_on_insert ON public.notifications;
CREATE TRIGGER trigger_push_notification_on_insert
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.trigger_push_notification();

-- -----------------------------
-- Consumer preferences persistence
-- -----------------------------
CREATE TABLE IF NOT EXISTS public.consumer_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_settings JSONB NOT NULL DEFAULT '{
    "bookingUpdates": true,
    "promotions": false,
    "priceAlerts": true,
    "driverArrival": true
  }'::jsonb,
  saved_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consumer_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consumers can view own preferences" ON public.consumer_preferences;
CREATE POLICY "Consumers can view own preferences"
  ON public.consumer_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Consumers can insert own preferences" ON public.consumer_preferences;
CREATE POLICY "Consumers can insert own preferences"
  ON public.consumer_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Consumers can update own preferences" ON public.consumer_preferences;
CREATE POLICY "Consumers can update own preferences"
  ON public.consumer_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_consumer_preferences_updated_at ON public.consumer_preferences;
CREATE TRIGGER update_consumer_preferences_updated_at
BEFORE UPDATE ON public.consumer_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
