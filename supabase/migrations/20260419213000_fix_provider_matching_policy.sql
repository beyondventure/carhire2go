-- =============================================================================
-- Fix for "Providers can accept matching bookings" RLS Policy
-- =============================================================================

-- The previous 'Providers can accept matching bookings' policy lacked a WITH CHECK clause.
-- In Postgres, FOR UPDATE policies without a WITH CHECK clause apply their USING clause 
-- to both the old row and the new row. Because the USING clause required status = 'matching',
-- it effectively blocked the provider from changing the status to 'matched' (or anything else),
-- resulting in an RLS violation error upon calling updateBooking().

DROP POLICY IF EXISTS "Providers can accept matching bookings" ON public.bookings;

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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = auth.uid()
      AND p.verification_status = 'approved'
  )
);
