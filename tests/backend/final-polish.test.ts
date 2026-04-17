import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

const MOCK_CONSUMER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const MOCK_PROVIDER_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const MOCK_BOOKING_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";

describe("Final Polish: Declines, Notifications, Geo KPIs", () => {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    try {
      await supabaseAdmin.auth.admin.createUser({ id: MOCK_CONSUMER_ID, email: "c.polish@test.local", password: "pwd", email_confirm: true });
      await supabaseAdmin.auth.admin.createUser({ id: MOCK_PROVIDER_ID, email: "p.polish@test.local", password: "pwd", email_confirm: true });
    } catch (e) {}

    await supabaseAdmin.from("providers").insert({
      id: MOCK_PROVIDER_ID, user_id: MOCK_PROVIDER_ID, business_name: "Decline Tester"
    });

    await supabaseAdmin.from("bookings").insert({
      id: MOCK_BOOKING_ID, consumer_id: MOCK_CONSUMER_ID, pickup_lat: 0, pickup_lng: 0, pickup_address: "Abuja", dropoff_lat: 0, dropoff_lng: 0, dropoff_address: "Lagos", booking_type: "full-day", scheduled_date: "2030-01-01", scheduled_time: "10:00:00", status: "matching"
    });
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    await supabaseAdmin.from("bookings").delete().eq("id", MOCK_BOOKING_ID);
    await supabaseAdmin.from("providers").delete().eq("id", MOCK_PROVIDER_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_CONSUMER_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_PROVIDER_ID);
  });

  it("should generate a notification when matched", async () => {
    if (!hasServiceRole) return;

    // Simulate match
    await supabaseAdmin.from("bookings").update({ status: "matched", provider_id: MOCK_PROVIDER_ID }).eq("id", MOCK_BOOKING_ID);

    // Give trigger time to run (it's synchronous in postgres)
    const { data: notifications } = await supabaseAdmin.from("notifications").select("*").eq("related_booking_id", MOCK_BOOKING_ID);
    expect(notifications?.length).toBeGreaterThan(0);
    const consumerNotif = notifications?.find(n => n.user_id === MOCK_CONSUMER_ID);
    expect(consumerNotif?.title).toBe("Driver Found!");
  });

  it("should aggregate geo KPIs correctly", async () => {
    if (!hasServiceRole) return;
    
    // Set booking to completed to show up in Geo KPI
    await supabaseAdmin.from("bookings").update({ status: "completed", final_price: 1000 }).eq("id", MOCK_BOOKING_ID);

    const { data: kpis } = await supabaseAdmin.rpc("get_admin_geo_kpis");
    expect(kpis).toBeInstanceOf(Array);
    
    const abuja = kpis.find((k: any) => k.city === "Abuja");
    expect(abuja).toBeDefined();
    expect(abuja.total_bookings).toBeGreaterThanOrEqual(1);
    expect(Number(abuja.total_gmv)).toBeGreaterThanOrEqual(1000);
  });
});
