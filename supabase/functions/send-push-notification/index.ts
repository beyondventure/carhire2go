import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  userId?: string;
  role?: string;
  title: string;
  body: string;
  url?: string;
  bookingId?: string;
  type?: string;
  requireInteraction?: boolean;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    related_booking_id?: string;
  };
  schema: "public";
  old_record: null | Record<string, unknown>;
}

// VAPID keys for web push authentication
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:support@carhire2go.com";

// Simple base64url encoding
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Create JWT for VAPID
async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const headerB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const privateKeyData = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    "raw",
    privateKeyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64urlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification to a subscription
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // For now, we'll use a simpler approach without full encryption
    // In production, you'd use the web-push library or implement full encryption
    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/pwa-icons/icon-512.png",
      badge: "/pwa-icons/icon-512.png",
      url: payload.url || "/",
      bookingId: payload.bookingId,
      type: payload.type,
      requireInteraction: payload.requireInteraction || false,
      tag: `carhire2go-${payload.type || "notification"}`,
    });

    // Create authorization header
    let authHeader = "";
    if (VAPID_PRIVATE_KEY && VAPID_PUBLIC_KEY) {
      try {
        const jwt = await createVapidJwt(audience);
        authHeader = `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
      } catch (e) {
        console.error("Failed to create VAPID JWT:", e);
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: new TextEncoder().encode(body),
    });

    if (!response.ok) {
      console.error(`Push failed: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log("Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const contentType = req.headers.get("content-type") || "";
    let payload: PushPayload;
    let targetUserIds: string[] = [];

    // Check if this is a webhook from database trigger
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Database webhook payload
      if (body.type && body.table === "notifications" && body.record) {
        const webhook = body as WebhookPayload;
        payload = {
          userId: webhook.record.user_id,
          title: webhook.record.title,
          body: webhook.record.message,
          type: webhook.record.type,
          bookingId: webhook.record.related_booking_id,
          url: getUrlForNotificationType(webhook.record.type),
        };
        targetUserIds = [webhook.record.user_id];
      } else {
        // Direct API call
        payload = body as PushPayload;
        if (payload.userId) {
          targetUserIds = [payload.userId];
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If targeting by role instead of userId
    if (payload.role && targetUserIds.length === 0) {
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("user_id")
        .eq("role", payload.role);

      if (subscriptions) {
        targetUserIds = [...new Set(subscriptions.map((s) => s.user_id))];
      }
    }

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No target users specified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for target users");
      return new Response(
        JSON.stringify({ message: "No subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send push notifications
    let successCount = 0;
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const success = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload
        );
        if (success) successCount++;
        return success;
      })
    );

    console.log(`Sent ${successCount}/${subscriptions.length} push notifications`);

    return new Response(
      JSON.stringify({
        message: "Push notifications processed",
        sent: successCount,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getUrlForNotificationType(type: string): string {
  switch (type) {
    case "booking":
    case "new_booking":
      return "/provider/requests";
    case "booking_matched":
    case "trip_started":
    case "trip_completed":
      return "/consumer/bookings";
    case "price_proposal":
    case "negotiation":
      return "/consumer/bookings";
    case "driver_assigned":
      return "/driver/trips";
    default:
      return "/";
  }
}
