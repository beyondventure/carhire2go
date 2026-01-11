-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via service role or triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify providers of new bookings
CREATE OR REPLACE FUNCTION public.notify_providers_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  provider_record RECORD;
BEGIN
  -- When a new pending booking is created, notify all verified providers
  IF NEW.status = 'pending' THEN
    FOR provider_record IN 
      SELECT p.user_id FROM providers p 
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

-- Create trigger for new bookings
CREATE TRIGGER trigger_notify_providers_new_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_providers_new_booking();

-- Create function to notify on booking status changes
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify consumer when booking is matched
  IF NEW.status = 'matched' AND OLD.status != 'matched' THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
    VALUES (
      NEW.consumer_id,
      'Booking Matched!',
      'A provider has accepted your booking request',
      'booking',
      NEW.id
    );
  END IF;
  
  -- Notify consumer when booking is confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
    VALUES (
      NEW.consumer_id,
      'Booking Confirmed',
      'Your booking has been confirmed at ₦' || COALESCE(NEW.final_price, NEW.negotiated_price)::TEXT,
      'booking',
      NEW.id
    );
  END IF;
  
  -- Notify provider when price is negotiated (negotiated_price changes)
  IF NEW.negotiated_price IS DISTINCT FROM OLD.negotiated_price AND NEW.provider_id IS NOT NULL THEN
    -- Get provider user_id
    INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
    SELECT p.user_id, 'Price Negotiation', 'Customer proposed a new price: ₦' || NEW.negotiated_price::TEXT, 'negotiation', NEW.id
    FROM providers p WHERE p.id = NEW.provider_id;
  END IF;
  
  -- Notify consumer when trip starts
  IF NEW.status = 'in-progress' AND OLD.status != 'in-progress' THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
    VALUES (
      NEW.consumer_id,
      'Trip Started',
      'Your driver has started the trip',
      'trip',
      NEW.id
    );
  END IF;
  
  -- Notify consumer when trip completes
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
    VALUES (
      NEW.consumer_id,
      'Trip Completed',
      'Your trip has been completed. Thank you for riding with us!',
      'trip',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for booking status changes
CREATE TRIGGER trigger_notify_booking_status_change
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_status_change();

-- Create function to notify on new chat messages (price proposals)
CREATE OR REPLACE FUNCTION public.notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  booking_record RECORD;
  recipient_id UUID;
BEGIN
  -- Only notify for price proposals
  IF NEW.message_type = 'price-proposal' THEN
    SELECT b.consumer_id, b.provider_id INTO booking_record
    FROM bookings b WHERE b.id = NEW.booking_id;
    
    -- Determine recipient based on sender role
    IF NEW.sender_role = 'consumer' THEN
      -- Notify provider
      SELECT p.user_id INTO recipient_id FROM providers p WHERE p.id = booking_record.provider_id;
    ELSE
      -- Notify consumer
      recipient_id := booking_record.consumer_id;
    END IF;
    
    IF recipient_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
      VALUES (
        recipient_id,
        'New Price Proposal',
        'A new price of ₦' || NEW.proposed_price::TEXT || ' has been proposed',
        'negotiation',
        NEW.booking_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for chat messages
CREATE TRIGGER trigger_notify_chat_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_chat_message();