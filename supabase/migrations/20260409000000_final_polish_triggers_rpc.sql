-- 1. Explicit Decline RPC
CREATE OR REPLACE FUNCTION public.explicit_decline_booking(
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
  SELECT p.id INTO v_provider_id
  FROM public.providers p
  WHERE p.user_id = auth.uid();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Forbidden: Caller is not a registered provider';
  END IF;

  SELECT *
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'booking_not_found');
  END IF;

  IF v_booking.provider_id <> v_provider_id THEN
    RAISE EXCEPTION 'Forbidden: Booking is not assigned to this provider';
  END IF;

  IF v_booking.status <> 'matched' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'invalid_state',
      'status', v_booking.status
    );
  END IF;

  UPDATE public.bookings
  SET 
    status = 'matching',
    provider_id = NULL,
    matched_at = NULL,
    ignored_providers = array_append(COALESCE(ignored_providers, '{}'::uuid[]), v_provider_id)
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('ok', true, 'code', 'booking_declined');
END;
$$;

-- 2. Geo Analytics RPC
CREATE OR REPLACE FUNCTION public.get_admin_geo_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_geo_stats JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'city', pickup_address,
      'total_bookings', count,
      'total_gmv', gmv
    )
  )
  INTO v_geo_stats
  FROM (
    SELECT 
      pickup_address,
      count(*) as count,
      COALESCE(sum(final_price), 0) as gmv
    FROM public.bookings
    WHERE status = 'completed'
    GROUP BY pickup_address
    ORDER BY count DESC
    LIMIT 20
  ) geo_data;

  RETURN COALESCE(v_geo_stats, '[]'::jsonb);
END;
$$;

-- 3. Automatic Notifications Trigger
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE FUNCTION public.auto_generate_booking_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    IF NEW.status = 'matched' AND NEW.provider_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (NEW.consumer_id, 'Driver Found!', 'A driver has been matched to your booking request.', 'booking_update', NEW.id);
      
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      SELECT user_id, 'New Booking Request', 'You have been assigned a new match.', 'booking_update', NEW.id
      FROM public.providers WHERE id = NEW.provider_id;
    END IF;

    IF NEW.status = 'confirmed' THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (NEW.consumer_id, 'Booking Confirmed!', 'Your payment was successful and booking is confirmed.', 'booking_update', NEW.id);
      
      IF NEW.provider_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
        SELECT user_id, 'Booking Confirmed!', 'Payment secured for your upcoming trip.', 'booking_update', NEW.id
        FROM public.providers WHERE id = NEW.provider_id;
      END IF;
    END IF;

    IF NEW.status = 'completed' THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (NEW.consumer_id, 'Trip Completed', 'Your trip has concluded. Thank you for using CarHire2Go.', 'booking_update', NEW.id);
    END IF;

    IF NEW.status = 'cancelled' THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (NEW.consumer_id, 'Booking Cancelled', 'Your booking has been cancelled.', 'booking_update', NEW.id);
      
      IF NEW.provider_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
        SELECT user_id, 'Booking Cancelled', 'A booking assigned to you was cancelled.', 'booking_update', NEW.id
        FROM public.providers WHERE id = NEW.provider_id;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_booking_notifications ON public.bookings;
CREATE TRIGGER trigger_auto_booking_notifications
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_booking_notifications();
