
-- Create payments table to log all Flutterwave transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL,
  provider_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, successful, failed
  flutterwave_tx_id TEXT,
  flutterwave_ref TEXT UNIQUE,
  payment_method TEXT, -- card, bank_transfer, ussd, etc.
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Consumers can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = consumer_id);

CREATE POLICY "Consumers can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Consumers can update their own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = consumer_id);

CREATE POLICY "Providers can view payments for their bookings"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = payments.provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_consumer_id ON public.payments(consumer_id);
CREATE INDEX idx_payments_provider_id ON public.payments(provider_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_flw_ref ON public.payments(flutterwave_ref);
