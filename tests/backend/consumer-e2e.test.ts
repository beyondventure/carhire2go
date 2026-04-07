import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

const MOCK_CONSUMER_ID = "44444444-4444-4444-4444-444444444444";
const MOCK_BOOKING_ID = "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA";

describe("Consumer E2E: Booking Flow & Timeouts", () => {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_CONSUMER_ID,
        email: "test.consumer.e2e@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
    } catch (e) {}

    await supabaseAdmin.from("bookings").insert({
      id: MOCK_BOOKING_ID,
      consumer_id: MOCK_CONSUMER_ID,
      pickup_lat: 6.5244,
      pickup_lng: 3.3792,
      pickup_address: "Lagos",
      dropoff_lat: 6.5244,
      dropoff_lng: 3.3792,
      dropoff_address: "Abuja",
      booking_type: "full-day",
      scheduled_date: "2030-01-01",
      scheduled_time: "10:00:00",
      status: "pending"
    });
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    await supabaseAdmin.from("bookings").delete().eq("id", MOCK_BOOKING_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_CONSUMER_ID);
  });

  it("should match booking and handle timeout sweep", async () => {
    if (!hasServiceRole) return;

    // Test transition pending -> matching -> matched
    await supabaseAdmin.from("bookings").update({ status: "matching" }).eq("id", MOCK_BOOKING_ID);
    
    // We mock assigning a provider by directly updating since RPC needs live providers
    await supabaseAdmin.from("bookings").update({ status: "matched", provider_id: "00000000-0000-0000-0000-000000000000", matched_at: new Date(Date.now() - 65 * 1000).toISOString() }).eq("id", MOCK_BOOKING_ID);
    
    // Run Sweep
    const { error: sweepErr } = await supabaseAdmin.rpc("sweep_expired_provider_matches");
    expect(sweepErr).toBeNull();

    // Verify booking reverted to matching
    const { data: booking } = await supabaseAdmin.from("bookings").select("status, ignored_providers").eq("id", MOCK_BOOKING_ID).single();
    expect(booking?.status).toBe("matching");
    expect(booking?.ignored_providers).toContain("00000000-0000-0000-0000-000000000000");
  });
});
