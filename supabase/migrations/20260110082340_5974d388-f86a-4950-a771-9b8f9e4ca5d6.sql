
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('consumer', 'provider', 'driver', 'admin');

-- Create provider type enum
CREATE TYPE public.provider_type AS ENUM ('individual', 'company');

-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create booking type enum
CREATE TYPE public.booking_type AS ENUM ('full-day', 'half-day', 'to-and-fro', 'point-to-point', 'event');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress', 'completed', 'cancelled');

-- Create vehicle type enum
CREATE TYPE public.vehicle_type AS ENUM ('sedan', 'suv', 'luxury', 'van', 'bus');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (secure, separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Providers table (Individual or Company)
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider_type provider_type NOT NULL DEFAULT 'individual',
  business_name TEXT,
  business_address TEXT,
  service_areas TEXT[] DEFAULT '{}',
  
  -- Individual verification (NIN)
  nin_number TEXT,
  nin_verified BOOLEAN DEFAULT false,
  
  -- Company verification (CAC)
  cac_number TEXT,
  cac_document_url TEXT,
  cac_verified BOOLEAN DEFAULT false,
  
  verification_status verification_status DEFAULT 'pending',
  rating NUMERIC(3,2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  acceptance_rate NUMERIC(5,2) DEFAULT 0,
  response_time INTEGER DEFAULT 0,
  
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  
  license_number TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  
  -- NIN verification
  nin_number TEXT,
  nin_verified BOOLEAN DEFAULT false,
  
  verification_status verification_status DEFAULT 'pending',
  available BOOLEAN DEFAULT true,
  assigned_vehicle_id UUID,
  rating NUMERIC(3,2) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate_number TEXT NOT NULL,
  color TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4,
  images TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  daily_rate NUMERIC(10,2) NOT NULL,
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key for assigned_vehicle_id in drivers
ALTER TABLE public.drivers 
ADD CONSTRAINT fk_assigned_vehicle 
FOREIGN KEY (assigned_vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  
  pickup_lat NUMERIC(10,7) NOT NULL,
  pickup_lng NUMERIC(10,7) NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_name TEXT,
  
  dropoff_lat NUMERIC(10,7) NOT NULL,
  dropoff_lng NUMERIC(10,7) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_name TEXT,
  
  booking_type booking_type NOT NULL,
  vehicle_preference vehicle_type,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  
  status booking_status NOT NULL DEFAULT 'pending',
  
  estimated_min_price NUMERIC(10,2),
  estimated_max_price NUMERIC(10,2),
  negotiated_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  
  matching_started_at TIMESTAMPTZ,
  matched_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role app_role NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  proposed_price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies (users can view their own roles)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Providers policies
CREATE POLICY "Providers can view their own data" ON public.providers
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Providers can update their own data" ON public.providers
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create provider profile" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Consumers can view verified providers" ON public.providers
  FOR SELECT USING (verification_status = 'approved');

CREATE POLICY "Admins can manage all providers" ON public.providers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Drivers policies
CREATE POLICY "Drivers can view their own data" ON public.drivers
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Drivers can update their own data" ON public.drivers
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create driver profile" ON public.drivers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view their drivers" ON public.drivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all drivers" ON public.drivers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles policies
CREATE POLICY "Providers can manage their vehicles" ON public.vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view available vehicles" ON public.vehicles
  FOR SELECT USING (available = true AND verified = true);

CREATE POLICY "Admins can manage all vehicles" ON public.vehicles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Consumers can view their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = consumer_id);

CREATE POLICY "Consumers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Consumers can update their pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = consumer_id);

CREATE POLICY "Providers can view assigned bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update assigned bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view their assigned trips" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers d 
      WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their trips" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.drivers d 
      WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Chat messages policies
CREATE POLICY "Booking participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND (
        b.consumer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.providers p WHERE p.id = b.provider_id AND p.user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = b.driver_id AND d.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Booking participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND (
        b.consumer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.providers p WHERE p.id = b.provider_id AND p.user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = b.driver_id AND d.user_id = auth.uid())
      )
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings and chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to handle new user signup (create profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
