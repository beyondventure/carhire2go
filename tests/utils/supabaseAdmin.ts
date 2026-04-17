import { createClient } from "@supabase/supabase-js";

// Make sure to load the env before requiring this file
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL for backend tests. Please set VITE_SUPABASE_URL or SUPABASE_URL.");
}

// We default to throwing if no service role key is found, 
// unless we are in a non-authenticated environment test. 
// For comprehensive backend DB testing, service role is required.
if (!serviceRoleKey) {
  console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Database administrative actions will fail or be subject to RLS.");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
