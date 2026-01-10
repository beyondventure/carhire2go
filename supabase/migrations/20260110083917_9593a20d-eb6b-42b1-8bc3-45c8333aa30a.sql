-- Allow providers to view pending bookings for matching
CREATE POLICY "Providers can view pending bookings for matching"
ON public.bookings
FOR SELECT
USING (
  status = 'pending' AND
  EXISTS (
    SELECT 1 FROM providers p
    WHERE p.user_id = auth.uid()
    AND p.verification_status = 'approved'
  )
);

-- Allow providers to claim pending bookings
CREATE POLICY "Providers can claim pending bookings"
ON public.bookings
FOR UPDATE
USING (
  status = 'pending' AND
  provider_id IS NULL AND
  EXISTS (
    SELECT 1 FROM providers p
    WHERE p.user_id = auth.uid()
    AND p.verification_status = 'approved'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM providers p
    WHERE p.user_id = auth.uid()
    AND p.id = bookings.provider_id
  )
);

-- Allow drivers to view pending bookings assigned to their provider
CREATE POLICY "Drivers can view provider pending bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM drivers d
    JOIN providers p ON p.id = d.provider_id
    WHERE d.user_id = auth.uid()
    AND p.id = bookings.provider_id
  )
);

-- Allow admins to view all profiles for management
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow providers to view consumer profiles for bookings
CREATE POLICY "Providers can view consumer profiles for their bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN providers p ON p.id = b.provider_id
    WHERE b.consumer_id = profiles.id
    AND p.user_id = auth.uid()
  )
);

-- Allow users to insert their own role on registration
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow providers to manage their drivers
CREATE POLICY "Providers can manage their drivers"
ON public.drivers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM providers p
    WHERE p.id = drivers.provider_id
    AND p.user_id = auth.uid()
  )
);