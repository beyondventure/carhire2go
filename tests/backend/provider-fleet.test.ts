import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../utils/supabaseAdmin";

const MOCK_PROVIDER_ID = "88888888-8888-8888-8888-888888888888";
const MOCK_VEHICLE_ID = "99999999-9999-9999-9999-999999999999";
const MOCK_DRIVER_ID = "77777777-7777-7777-7777-777777777777";

describe("Provider Fleet Management", () => {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeAll(async () => {
    if (!hasServiceRole) return;
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_PROVIDER_ID,
        email: "test.provider.fleet@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
      await supabaseAdmin.auth.admin.createUser({
        id: MOCK_DRIVER_ID,
        email: "test.driver.fleet@carhire2go.test.local",
        password: "testpassword123",
        email_confirm: true,
      });
    } catch (e) {}
  });

  afterAll(async () => {
    if (!hasServiceRole) return;
    await supabaseAdmin.from("vehicles").delete().eq("provider_id", MOCK_PROVIDER_ID);
    await supabaseAdmin.from("drivers").delete().eq("provider_id", MOCK_PROVIDER_ID);
    await supabaseAdmin.from("providers").delete().eq("id", MOCK_PROVIDER_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_PROVIDER_ID);
    await supabaseAdmin.auth.admin.deleteUser(MOCK_DRIVER_ID);
  });

  it("should create provider profile and vehicles", async () => {
    if (!hasServiceRole) return;

    // 1. Create provider
    const { error: pErr } = await supabaseAdmin.from("providers").insert({
      id: MOCK_PROVIDER_ID,
      user_id: MOCK_PROVIDER_ID,
      provider_type: "individual",
      business_name: "Mock Fleet Ltd"
    });
    expect(pErr).toBeNull();

    // 2. Add Driver
    const { error: dErr } = await supabaseAdmin.from("drivers").insert({
      id: MOCK_DRIVER_ID,
      user_id: MOCK_DRIVER_ID,
      provider_id: MOCK_PROVIDER_ID,
      license_number: "LIC123",
      license_expiry: "2030-01-01"
    });
    expect(dErr).toBeNull();

    // 3. Add Vehicle
    const { error: vErr } = await supabaseAdmin.from("vehicles").insert({
      id: MOCK_VEHICLE_ID,
      provider_id: MOCK_PROVIDER_ID,
      vehicle_type: "sedan",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      plate_number: "ABC-123",
      color: "Black",
      daily_rate: 20000,
      assigned_driver_id: MOCK_DRIVER_ID,
      verified: true
    });
    expect(vErr).toBeNull();
  });
});
