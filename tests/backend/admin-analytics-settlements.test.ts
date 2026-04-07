import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

const MOCK_PROVIDER_ID = "66666666-6666-6666-6666-666666666666";
const MOCK_SETTLEMENT_ID = "55555555-5555-5555-5555-555555555555";

describe("Admin Analytics & Settlements", () => {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_PROVIDER_ID,
        email: "test.provider.stats@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
    } catch (e) {}

    await supabaseAdmin.from("providers").insert({
      id: MOCK_PROVIDER_ID,
      user_id: MOCK_PROVIDER_ID,
      provider_type: "individual",
      business_name: "Mock Analytics Provider",
      verification_status: "approved"
    });

    await supabaseAdmin.from("settlements").insert({
      id: MOCK_SETTLEMENT_ID,
      provider_id: MOCK_PROVIDER_ID,
      amount: 1500,
      status: "pending"
    });
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    await supabaseAdmin.from("settlements").delete().eq("id", MOCK_SETTLEMENT_ID);
    await supabaseAdmin.from("providers").delete().eq("id", MOCK_PROVIDER_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_PROVIDER_ID);
  });

  it("should calculate provider earnings via view", async () => {
    if (!hasServiceRole) return;

    const { data: earnings, error } = await supabaseAdmin
      .from("provider_earnings_view")
      .select("*")
      .eq("provider_id", MOCK_PROVIDER_ID)
      .single();

    expect(error).toBeNull();
    expect(Number(earnings.total_earned)).toBe(0);
    expect(Number(earnings.total_settled)).toBe(0);
    
    // Process settlement
    await supabaseAdmin.from("settlements").update({ status: "completed" }).eq("id", MOCK_SETTLEMENT_ID);
    
    const { data: earningsUpdated } = await supabaseAdmin
      .from("provider_earnings_view")
      .select("*")
      .eq("provider_id", MOCK_PROVIDER_ID)
      .single();
      
    expect(Number(earningsUpdated.total_settled)).toBe(1500);
    expect(Number(earningsUpdated.pending_balance)).toBe(-1500);
  });

  it("should return admin KPIs", async () => {
    if (!hasServiceRole) return;

    const { data: kpis, error } = await supabaseAdmin.rpc("get_admin_kpis");
    expect(error).toBeNull();
    expect(kpis).toHaveProperty("total_bookings");
    expect(kpis).toHaveProperty("total_gmv");
  });
});
