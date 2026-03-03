import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const testUsers = [
  { email: 'user@instantryde.ng', password: 'testtest123', name: 'Test User', role: 'consumer' },
  { email: 'admin@instantryde.ng', password: 'testtest123', name: 'Test Admin', role: 'admin' },
  { email: 'provider@instantryde.ng', password: 'testtest123', name: 'Test Provider', role: 'provider' },
  { email: 'driver@instantryde.ng', password: 'testtest123', name: 'Test Driver', role: 'driver' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    for (const user of testUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const exists = existingUsers?.users?.find(u => u.email === user.email)

      if (exists) {
        results.push({ email: user.email, status: 'already exists', id: exists.id })
        continue
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        results.push({ email: user.email, status: 'error', error: authError.message })
        continue
      }

      const userId = authData.user.id

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          name: user.name,
        })

      if (profileError) {
        console.error('Profile error:', profileError)
      }

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: user.role,
        })

      if (roleError) {
        console.error('Role error:', roleError)
      }

      // Create provider/driver records if needed
      if (user.role === 'provider') {
        await supabase.from('providers').insert({
          user_id: userId,
          provider_type: 'individual',
          business_name: 'Test Provider Business',
          business_address: '123 Test Street, Lagos',
          service_areas: ['Lagos', 'Abuja'],
          verification_status: 'approved',
        })
      }

      if (user.role === 'driver') {
        await supabase.from('drivers').insert({
          user_id: userId,
          license_number: 'TEST-DRV-001',
          license_expiry: '2026-12-31',
          verification_status: 'approved',
          available: true,
        })
      }

      results.push({ email: user.email, status: 'created', id: userId })
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
