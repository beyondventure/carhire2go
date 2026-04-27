-- Consumer booking -> provider intake: persistent provider declines.
-- A declined open request stays available to other approved providers while
-- disappearing from the declining provider's native intake surfaces.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS ignored_providers UUID[] DEFAULT '{}'::uuid[];

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
    WHEN p_old_status = 'pending' THEN p_new_status IN ('matching', 'matched', 'cancelled')
    WHEN p_old_status = 'matching' THEN p_new_status IN ('matched', 'pending', 'cancelled')
    WHEN p_old_status = 'matched' THEN p_new_status IN ('negotiating', 'confirmed', 'cancelled', 'matching')
    WHEN p_old_status = 'negotiating' THEN p_new_status IN ('matched', 'confirmed', 'cancelled')
    WHEN p_old_status = 'confirmed' THEN p_new_status IN ('in-progress', 'cancelled')
    WHEN p_old_status = 'in-progress' THEN p_new_status IN ('completed', 'cancelled')
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.notify_providers_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_record RECORD;
BEGIN
  IF NEW.status IN ('pending', 'matching') THEN
    FOR provider_record IN
      SELECT p.user_id
      FROM public.providers p
      WHERE p.verification_status = 'approved'
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (
        provider_record.user_id,
        'New Booking Request',
        'A new ' || replace(NEW.booking_type::text, '-', ' ') || ' booking request is available',
        'booking',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_open_booking_request(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_provider_id UUID;
BEGIN
  SELECT p.id
  INTO v_provider_id
  FROM public.providers p
  WHERE p.user_id = auth.uid()
    AND p.verification_status = 'approved';

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Forbidden: caller is not an approved provider';
  END IF;

  SELECT *
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'booking_not_found');
  END IF;

  IF v_booking.status NOT IN ('pending', 'matching') OR v_booking.provider_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'booking_not_open',
      'status', v_booking.status
    );
  END IF;

  IF v_provider_id = ANY(COALESCE(v_booking.ignored_providers, '{}'::uuid[])) THEN
    RETURN jsonb_build_object('ok', true, 'code', 'already_declined');
  END IF;

  UPDATE public.bookings
  SET ignored_providers = array_append(
      COALESCE(ignored_providers, '{}'::uuid[]),
      v_provider_id
    )
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('ok', true, 'code', 'booking_declined');
END;
$$;

REVOKE ALL ON FUNCTION public.decline_open_booking_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decline_open_booking_request(UUID) TO authenticated;
