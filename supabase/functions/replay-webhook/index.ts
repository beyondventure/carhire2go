import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server is not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const authClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!userRole) {
      return new Response(JSON.stringify({ error: "Forbidden. Admin access required." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const body = await req.json();
    const eventId = body?.eventId;
    
    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }
    
    const { data: eventRow, error: fetchErr } = await supabase
      .from('payment_webhook_events')
      .select('*')
      .eq('id', eventId)
      .single();
      
    if (fetchErr || !eventRow) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }
    
    const payload = eventRow.payload;
    const data = payload?.data ?? {};
    const txRef = String(data?.tx_ref ?? "");
    const transactionId = data?.id ? String(data.id) : "";
    const paymentStatus = String(data?.status ?? "").toLowerCase();

    let rData: unknown = null;

    if (paymentStatus === "successful") {
      const amount = Number(data?.amount);
      const { data: confirmResult, error: confirmError } = await supabase.rpc("confirm_booking_payment", {
        p_flutterwave_ref: txRef,
        p_flutterwave_tx_id: transactionId || null,
        p_payment_method: String(data?.payment_type ?? ""),
        p_verified_amount: Number.isFinite(amount) ? amount : null,
        p_metadata: {
          verification_source: "admin_replay",
          replayed_event_id: eventId,
          flutterwave_response: data,
        },
      });

      if (confirmError) throw new Error(confirmError.message);
      rData = confirmResult;
    } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: { webhook_status: paymentStatus, verification_source: "admin_replay" },
        })
        .eq("flutterwave_ref", txRef)
        .eq("status", "pending");
      rData = { marked_failed: true };
    }

    await supabase
      .from("payment_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", eventId);

    return new Response(JSON.stringify({ ok: true, replayed: true, result: rData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
