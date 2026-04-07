import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

// Mock data
const MOCK_CONSUMER_ID = "00000000-0000-0000-0000-000000000001"; // We assume we can fake this for service role operations or create a real user
const MOCK_BOOKING_ID = "11111111-1111-1111-1111-111111111111";
const MOCK_PAYMENT_ID = "22222222-2222-2222-2222-222222222222";
const FLUTTERWAVE_REF = "tx_ref_mock_12345";
const PAYMENT_AMOUNT = 5000;

describe("Payment Verification Backend logic", () => {
  // Check if we have service_role, otherwise tests will likely fail due to RLS
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    
    // We attempt to set up a mock booking and a pending mock payment.
    // 1. Create a fake user if needed (often bookings require a valid consumer_id FK)
    // We will try inserting a booking directly. If there is a strict FK constraint on auth.users, 
    // we would need to create a test user first. For simplicity, we create a user.
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_CONSUMER_ID,
        email: "test.payment@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
    } catch (e) {
      // User might already exist, ignore
    }

    // 2. Insert Booking
    await supabaseAdmin.from("bookings").insert({
      id: MOCK_BOOKING_ID,
      consumer_id: MOCK_CONSUMER_ID,
      status: "pending",
      // Other minimal necessary fields... assuming nullable for the rest
    });

    // 3. Insert Payment
    await supabaseAdmin.from("payments").insert({
      id: MOCK_PAYMENT_ID,
      booking_id: MOCK_BOOKING_ID,
      consumer_id: MOCK_CONSUMER_ID,
      amount: PAYMENT_AMOUNT,
      status: "pending",
      flutterwave_ref: FLUTTERWAVE_REF,
      idempotency_key: "idem_mock_123",
    });
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    
    // Cleanup
    await supabaseAdmin.from("payments").delete().eq("id", MOCK_PAYMENT_ID);
    await supabaseAdmin.from("bookings").delete().eq("id", MOCK_BOOKING_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_CONSUMER_ID);
  });

  it("should fail payment if amount mismatches", async () => {
    if (!hasServiceRole) return;

    const { data: result, error } = await supabaseAdmin.rpc("confirm_booking_payment", {
      p_flutterwave_ref: FLUTTERWAVE_REF,
      p_verified_amount: PAYMENT_AMOUNT + 100, // Invalid amount
    });

    expect(error).toBeNull();
    // RPC returns JSON
    expect(result.ok).toBe(false);
    expect(result.code).toBe("amount_mismatch");

    // Verify DB payment status is failed
    const { data: payment } = await supabaseAdmin.from("payments").select("status").eq("id", MOCK_PAYMENT_ID).single();
    expect(payment?.status).toBe("failed");
  });

  it("should reject terminal payment states (failed/cancelled)", async () => {
    if (!hasServiceRole) return;

    // Payment is currently 'failed' from previous test.
    const { data: result, error } = await supabaseAdmin.rpc("confirm_booking_payment", {
      p_flutterwave_ref: FLUTTERWAVE_REF,
      p_verified_amount: PAYMENT_AMOUNT, // Correct amount, but it shouldn't matter
    });

    expect(error).toBeNull();
    expect(result.ok).toBe(false);
    expect(result.code).toBe("payment_terminal_state");
  });

  it("should successfully process a valid payment amount", async () => {
    if (!hasServiceRole) return;

    // Reset payment back to pending for this test
    await supabaseAdmin.from("payments").update({ status: "pending" }).eq("id", MOCK_PAYMENT_ID);
    // Reset booking back to matched so we can transition to confirmed
    await supabaseAdmin.from("bookings").update({ status: "matched" }).eq("id", MOCK_BOOKING_ID);

    const { data: result, error } = await supabaseAdmin.rpc("confirm_booking_payment", {
       p_flutterwave_ref: FLUTTERWAVE_REF,
       p_verified_amount: PAYMENT_AMOUNT,
       p_flutterwave_tx_id: "FLW_TX_123",
    });

    expect(error).toBeNull();
    expect(result.ok).toBe(true);
    expect(result.already_processed).toBe(false);

    // Verify booking updated
    const { data: booking } = await supabaseAdmin.from("bookings").select("status, final_price").eq("id", MOCK_BOOKING_ID).single();
    expect(booking?.status).toBe("confirmed");
    expect(Number(booking?.final_price)).toBe(PAYMENT_AMOUNT);

    // Verify payment updated
    const { data: payment } = await supabaseAdmin.from("payments").select("status, flutterwave_tx_id, verified_at").eq("id", MOCK_PAYMENT_ID).single();
    expect(payment?.status).toBe("successful");
    expect(payment?.flutterwave_tx_id).toBe("FLW_TX_123");
    expect(payment?.verified_at).not.toBeNull();
  });

  it("should act idempotently when already processed", async () => {
    if (!hasServiceRole) return;

    // Call it a second time
    const { data: result, error } = await supabaseAdmin.rpc("confirm_booking_payment", {
       p_flutterwave_ref: FLUTTERWAVE_REF,
       p_verified_amount: PAYMENT_AMOUNT,
    });

    expect(error).toBeNull();
    expect(result.ok).toBe(true);
    expect(result.already_processed).toBe(true);
  });
});
