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
    
    // In a real scenario, you'd pull the Flutterwave Secret Key to initiate a transfer
    // const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
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

    const authClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    // Initialize admin client to bypass RLS (since we are processing payouts)
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check if the caller is an admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!userRole) {
      return new Response(JSON.stringify({ error: "Forbidden. Admin access required." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const settlementId = body?.settlementId;
    const action = body?.action; // 'process' or 'complete'
    
    if (!settlementId || !action) {
      return new Response(JSON.stringify({ error: "settlementId and action are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    const { data: settlement, error: fetchErr } = await supabase
      .from('settlements')
      .select('*, provider:providers(bank_name, account_number, account_name)')
      .eq('id', settlementId)
      .single();
      
    if (fetchErr || !settlement) {
      return new Response(JSON.stringify({ error: "Settlement not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    let newStatus = settlement.status;
    let reference = settlement.reference;
    
    if (action === 'process' && settlement.status === 'pending') {
      newStatus = 'processing';
      // Simulate initiating a Flutterwave transfer request
      // const payout = await initiateTransfer(settlement.amount, settlement.provider);
      reference = `FW-MOCK-${Date.now()}`; 
    } else if (action === 'complete' && settlement.status === 'processing') {
      newStatus = 'completed';
    } else {
      return new Response(JSON.stringify({ error: `Invalid state transition from ${settlement.status} via action ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    const { data: updated, error: updateErr } = await supabase
      .from('settlements')
      .update({ status: newStatus, reference, processed_at: newStatus === 'completed' ? new Date().toISOString() : null })
      .eq('id', settlementId)
      .select()
      .single();
      
    if (updateErr) {
       return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, result: updated }), {
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
