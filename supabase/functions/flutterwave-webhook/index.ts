import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
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
    const webhookSecret = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET") ?? "";

    if (!supabaseUrl || !serviceRoleKey || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Server is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("verif-hash") ?? "";
    if (!signature || signature !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const data = payload?.data ?? {};
    const txRef = String(data?.tx_ref ?? "");
    const transactionId = data?.id ? String(data.id) : "";
    const eventId = `${transactionId || txRef}:${String(payload?.event ?? "unknown")}`;
    const paymentStatus = String(data?.status ?? "").toLowerCase();

    if (!txRef) {
      return new Response(JSON.stringify({ error: "Missing tx_ref" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingEvent } = await supabase
      .from("payment_webhook_events")
      .select("id,status")
      .eq("provider", "flutterwave")
      .eq("provider_event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      return new Response(JSON.stringify({ ok: true, replay: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: eventRow, error: eventInsertError } = await supabase
      .from("payment_webhook_events")
      .insert({
        provider: "flutterwave",
        provider_event_id: eventId,
        tx_ref: txRef,
        payload,
        status: "received",
      })
      .select("id")
      .single();

    if (eventInsertError || !eventRow) {
      return new Response(JSON.stringify({ error: "Could not create webhook event record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: unknown = null;
    if (paymentStatus === "successful") {
      const amount = Number(data?.amount);
      const { data: confirmResult, error: confirmError } = await supabase.rpc("confirm_booking_payment", {
        p_flutterwave_ref: txRef,
        p_flutterwave_tx_id: transactionId || null,
        p_payment_method: String(data?.payment_type ?? ""),
        p_verified_amount: Number.isFinite(amount) ? amount : null,
        p_metadata: {
          verification_source: "flutterwave_webhook",
          webhook_event: payload?.event ?? null,
          flutterwave_response: data,
        },
      });

      if (confirmError) {
        await supabase
          .from("payment_webhook_events")
          .update({ status: "failed" })
          .eq("id", eventRow.id);

        return new Response(JSON.stringify({ error: "Failed to confirm payment", details: confirmError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      result = confirmResult;
    } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: { webhook_status: paymentStatus, webhook_event: payload?.event ?? null },
        })
        .eq("flutterwave_ref", txRef)
        .eq("status", "pending");
      result = { ok: true, marked_failed: true };
    } else {
      result = { ok: true, ignored_status: paymentStatus };
    }

    await supabase
      .from("payment_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", eventRow.id);

    return new Response(JSON.stringify({ ok: true, result }), {
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
