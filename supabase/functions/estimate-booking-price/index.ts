import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BookingType = "full-day" | "half-day" | "to-and-fro" | "point-to-point" | "event";
type VehicleType = "sedan" | "suv" | "luxury" | "van" | "bus";

interface EstimateRequest {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  booking_type: BookingType;
  vehicle_type: VehicleType;
  scheduled_date: string;
  scheduled_time: string;
}

const VEHICLE_PRICING: Record<VehicleType, { base: number; perKm: number }> = {
  sedan: { base: 15000, perKm: 1600 },
  suv: { base: 22000, perKm: 2200 },
  luxury: { base: 45000, perKm: 4200 },
  van: { base: 32000, perKm: 3000 },
  bus: { base: 60000, perKm: 5000 },
};

const BOOKING_TYPE_RULES: Record<
  BookingType,
  { minimumKm: number; multiplier: number; spread: number; label: string }
> = {
  "point-to-point": { minimumKm: 5, multiplier: 1, spread: 0.1, label: "Point-to-point" },
  "to-and-fro": { minimumKm: 10, multiplier: 1.8, spread: 0.12, label: "Return trip" },
  "half-day": { minimumKm: 20, multiplier: 1.6, spread: 0.12, label: "Half-day hire" },
  "full-day": { minimumKm: 40, multiplier: 2.5, spread: 0.14, label: "Full-day hire" },
  event: { minimumKm: 25, multiplier: 2.1, spread: 0.13, label: "Event booking" },
};

function roundToNearest500(value: number) {
  return Math.round(value / 500) * 500;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateEstimate(payload: EstimateRequest) {
  const vehiclePricing = VEHICLE_PRICING[payload.vehicle_type];
  const bookingRule = BOOKING_TYPE_RULES[payload.booking_type];
  const distanceKm = haversineDistanceKm(
    payload.pickup_lat,
    payload.pickup_lng,
    payload.dropoff_lat,
    payload.dropoff_lng,
  );

  const effectiveDistanceKm = Math.max(distanceKm * bookingRule.multiplier, bookingRule.minimumKm);
  const scheduledAt = new Date(`${payload.scheduled_date}T${payload.scheduled_time}`);

  let scheduleMultiplier = 1;
  const hour = scheduledAt.getHours();
  const now = new Date();
  const hoursUntilRide = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hour < 6 || hour >= 21) {
    scheduleMultiplier += 0.08;
  }

  if (hoursUntilRide > 0 && hoursUntilRide < 6) {
    scheduleMultiplier += 0.05;
  }

  const baseEstimate =
    (vehiclePricing.base + effectiveDistanceKm * vehiclePricing.perKm) * scheduleMultiplier;

  const minEstimate = roundToNearest500(baseEstimate * (1 - bookingRule.spread));
  const maxEstimate = roundToNearest500(baseEstimate * (1 + bookingRule.spread));

  return {
    estimated_min_price: minEstimate,
    estimated_max_price: maxEstimate,
    distance_km: Number(distanceKm.toFixed(1)),
    pricing_basis: `${bookingRule.label} · ${payload.vehicle_type}`,
    surge_multiplier: Number(scheduleMultiplier.toFixed(2)),
    note: "Final price will still be negotiated with the provider.",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Partial<EstimateRequest>;
    const requiredFields: Array<keyof EstimateRequest> = [
      "pickup_lat",
      "pickup_lng",
      "dropoff_lat",
      "dropoff_lng",
      "booking_type",
      "vehicle_type",
      "scheduled_date",
      "scheduled_time",
    ];

    const missingField = requiredFields.find((field) => payload[field] === undefined || payload[field] === null);
    if (missingField) {
      return new Response(JSON.stringify({ error: `Missing required field: ${missingField}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const estimate = calculateEstimate(payload as EstimateRequest);

    return new Response(JSON.stringify(estimate), {
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
