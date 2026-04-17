-- =============================================================================
-- Matching flow fixes
-- 1. notify_providers_new_booking: fire on status = 'matching' as well as 'pending'
-- 2. bookings: add CHECK constraint so scheduled_date is never in the past
-- 3. RLS: allow approved providers to SELECT and UPDATE 'matching' bookings
--    they have not yet been assigned to (required to accept / claim them)
-- =============================================================================


-- ── 1. Update notification trigger function ───────────────────────────────────
-- The mobile app creates bookings with status = 'matching' directly.
-- The previous implementation only fired for status = 'pending', so mobile
-- bookings never notified providers. This replaces the function body only;
-- the existing trigger (trigger_notify_providers_new_booking) is untouched.

CREATE OR REPLACE FUNCTION public.notify_providers_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  provider_record RECORD;
BEGIN
  -- Notify all approved providers on INSERT for both 'pending' and 'matching'
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
        'A new ' || REPLACE(NEW.booking_type, '-', ' ') || ' booking request is available',
        'booking',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ── 2. Date validation constraint ─────────────────────────────────────────────
-- Prevents bookings being created (or updated) with a past scheduled_date.
-- CURRENT_DATE is evaluated at the time the row is written, not at migration
-- time, so this is safe to apply to an existing table.

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_scheduled_date_not_past
  CHECK (scheduled_date >= CURRENT_DATE);


-- ── 3. RLS — providers can view available (pending / matching) bookings ───────
-- The existing "Providers can view assigned bookings" policy only covers rows
-- where provider_id = their provider id. Unassigned 'matching' bookings have
-- provider_id = NULL, so providers could not see them at all.
-- This policy lets any approved provider see bookings still open for matching.

CREATE POLICY "Providers can view pending and matching bookings"
ON public.bookings
FOR SELECT
USING (
  status IN ('pending', 'matching')
  AND EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = auth.uid()
      AND p.verification_status = 'approved'
  )
);


-- ── 4. RLS — providers can accept (UPDATE) unassigned 'matching' bookings ─────
-- Without this, a provider has no UPDATE access to a booking until they're
-- already set as provider_id — a chicken-and-egg problem in the accept flow.
-- This policy unlocks UPDATE on any 'matching' booking for approved providers
-- so the accept action (setting provider_id + changing status) can succeed.

CREATE POLICY "Providers can accept matching bookings"
ON public.bookings
FOR UPDATE
USING (
  status = 'matching'
  AND EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = auth.uid()
      AND p.verification_status = 'approved'
  )
);
