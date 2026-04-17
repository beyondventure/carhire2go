import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type VerifyBody = {
  txRef?: string;
  transactionId?: string | number;
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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!supabaseUrl || !anonKey || !flutterwaveSecret) {
      return new Response(JSON.stringify({ error: "Server is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as VerifyBody;
    const txRef = body.txRef?.trim();
    const transactionId = body.transactionId ? String(body.transactionId) : undefined;

    if (!txRef) {
      return new Response(JSON.stringify({ error: "txRef is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let verifyUrl = "";
    if (transactionId) {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
    } else {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`;
    }

    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${flutterwaveSecret}`,
        "Content-Type": "application/json",
      },
    });

    const verifyPayload = await verifyResponse.json();
    const paymentData = verifyPayload?.data;

    if (!verifyResponse.ok || verifyPayload?.status !== "success" || !paymentData) {
      return new Response(
        JSON.stringify({ error: "Flutterwave verification failed", details: verifyPayload }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const flutterStatus = String(paymentData.status ?? "").toLowerCase();
    if (flutterStatus !== "successful") {
      return new Response(
        JSON.stringify({ error: "Payment not successful", paymentStatus: flutterStatus }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const amount = Number(paymentData.amount);
    const { data: confirmation, error: confirmError } = await supabase.rpc("confirm_booking_payment", {
      p_flutterwave_ref: txRef,
      p_flutterwave_tx_id: String(paymentData.id ?? transactionId ?? ""),
      p_payment_method: String(paymentData.payment_type ?? ""),
      p_verified_amount: Number.isFinite(amount) ? amount : null,
      p_metadata: {
        verification_source: "edge_verify_payment",
        flutterwave_status: flutterStatus,
        verified_by_user: user.id,
        flutterwave_response: paymentData,
      },
    });

    if (confirmError) {
      return new Response(JSON.stringify({ error: "Failed to confirm payment", details: confirmError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, result: confirmation }), {
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
