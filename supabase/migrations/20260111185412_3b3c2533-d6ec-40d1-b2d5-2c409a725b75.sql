-- Update RLS policy to allow providers to view both pending and matching bookings
DROP POLICY IF EXISTS "Providers can view pending bookings for matching" ON public.bookings;

CREATE POLICY "Providers can view pending bookings for matching" 
ON public.bookings 
FOR SELECT 
USING (
  (status IN ('pending'::booking_status, 'matching'::booking_status)) 
  AND (EXISTS ( 
    SELECT 1 FROM providers p 
    WHERE (p.user_id = auth.uid()) AND (p.verification_status = 'approved'::verification_status)
  ))
);

-- Update RLS policy to allow providers to claim matching bookings too
DROP POLICY IF EXISTS "Providers can claim pending bookings" ON public.bookings;

CREATE POLICY "Providers can claim pending bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  (status IN ('pending'::booking_status, 'matching'::booking_status)) 
  AND (provider_id IS NULL) 
  AND (EXISTS ( 
    SELECT 1 FROM providers p 
    WHERE (p.user_id = auth.uid()) AND (p.verification_status = 'approved'::verification_status)
  ))
)
WITH CHECK (
  EXISTS ( 
    SELECT 1 FROM providers p 
    WHERE (p.user_id = auth.uid()) AND (p.id = bookings.provider_id)
  )
);