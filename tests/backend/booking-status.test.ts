import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

// Mock data
const MOCK_CONSUMER_ID = "00000000-0000-0000-0000-000000000002"; // Another mock UUID
const MOCK_BOOKING_ID = "33333333-3333-3333-3333-333333333333";

describe("Booking Status Transition validation", () => {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_CONSUMER_ID,
        email: "test.booking@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
    } catch (e) {
      // Ignore existing user
    }

    // Insert an initial Booking in 'pending' status
    await supabaseAdmin.from("bookings").insert({
      id: MOCK_BOOKING_ID,
      consumer_id: MOCK_CONSUMER_ID,
      status: "pending",
    });
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    
    await supabaseAdmin.from("bookings").delete().eq("id", MOCK_BOOKING_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_CONSUMER_ID);
  });

  it("should block invalid status transitions (e.g. pending -> completed)", async () => {
    if (!hasServiceRole) return;

    // pending -> completed is NOT valid
    const { error } = await supabaseAdmin.from("bookings").update({ status: "completed" }).eq("id", MOCK_BOOKING_ID);
    
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/Invalid booking status transition/);

    // Verify status remained 'pending'
    const { data: booking } = await supabaseAdmin.from("bookings").select("status").eq("id", MOCK_BOOKING_ID).single();
    expect(booking?.status).toBe("pending");
  });

  it("should allow valid status transitions (e.g. pending -> matching -> matched)", async () => {
    if (!hasServiceRole) return;

    // pending -> matching IS valid
    let { error } = await supabaseAdmin.from("bookings").update({ status: "matching" }).eq("id", MOCK_BOOKING_ID);
    expect(error).toBeNull();

    // matching -> matched IS valid
    ({ error } = await supabaseAdmin.from("bookings").update({ status: "matched" }).eq("id", MOCK_BOOKING_ID));
    expect(error).toBeNull();
    
    // Verify status updated successfully
    const { data: booking } = await supabaseAdmin.from("bookings").select("status").eq("id", MOCK_BOOKING_ID).single();
    expect(booking?.status).toBe("matched");
  });

  it("should block invalid rollback transitions (e.g. matched -> matching)", async () => {
     if (!hasServiceRole) return;

     // matched -> matching is NOT valid, rollback is restricted. Wait, matching -> pending is valid, matched -> pending is not valid. Wait let's check transition.
     // In migrations: WHEN p_old_status = 'matched' THEN p_new_status IN ('negotiating', 'confirmed', 'cancelled')
     // matched -> matching is FALSE
     const { error } = await supabaseAdmin.from("bookings").update({ status: "matching" }).eq("id", MOCK_BOOKING_ID);
     
     expect(error).not.toBeNull();
     expect(error?.message).toMatch(/Invalid booking status transition/);
  });

  it("should allow transition to cancelled from any state", async () => {
    if (!hasServiceRole) return;

    const { error } = await supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", MOCK_BOOKING_ID);
    
    expect(error).toBeNull();
    
    // Verify status updated
    const { data: booking } = await supabaseAdmin.from("bookings").select("status").eq("id", MOCK_BOOKING_ID).single();
    expect(booking?.status).toBe("cancelled");
  });
});
