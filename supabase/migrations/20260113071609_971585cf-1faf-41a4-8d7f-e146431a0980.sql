-- Create a function to trigger push notifications via pg_net
-- First, enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger function to send push notifications
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get Supabase URL from environment (set via vault)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Make HTTP request to the edge function
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-push-notification',
    body := json_build_object(
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
    )::text,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )::jsonb
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Note: The trigger will be created once pg_net is confirmed working
-- For now, push notifications will be sent when users poll or via direct API calls