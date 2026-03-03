import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Get provider user
    const { data: providerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'provider@instantryde.ng')
      .single()

    // Get consumer user
    const { data: consumerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'user@instantryde.ng')
      .single()

    // Get driver user
    const { data: driverProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'driver@instantryde.ng')
      .single()

    if (!providerProfile || !consumerProfile || !driverProfile) {
      return new Response(JSON.stringify({ error: 'Test users not found. Run create-test-users first.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get or create provider record
    let { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', providerProfile.id)
      .single()

    if (!provider) {
      const { data: newProvider, error: providerError } = await supabase
        .from('providers')
        .insert({
          user_id: providerProfile.id,
          provider_type: 'company',
          business_name: 'FleetMaster Nigeria',
          business_address: '45 Victoria Island, Lagos',
          service_areas: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'],
          verification_status: 'approved',
          rating: 4.7,
          total_bookings: 1250,
          acceptance_rate: 92,
          response_time: 35,
          bank_name: 'GTBank',
          account_number: '0123456789',
          account_name: 'FleetMaster Nigeria Ltd',
          nin_number: 'NIN123456789',
          nin_verified: true,
          cac_number: 'RC123456',
          cac_verified: true,
          allows_negotiation: true,
        })
        .select()
        .single()

      if (providerError) throw providerError
      provider = newProvider
    }

    if (!provider) {
      throw new Error('Failed to create or find provider')
    }

    const providerId = provider.id

    // Create additional providers for testing
    const additionalProviders = [
      {
        user_id: providerProfile.id, // Will be created with test users
        provider_type: 'company' as const,
        business_name: 'Lagos Executive Cars',
        business_address: '12 Admiralty Way, Lekki Phase 1, Lagos',
        service_areas: ['Lagos', 'Ibadan'],
        verification_status: 'approved' as const,
        rating: 4.9,
        total_bookings: 850,
        acceptance_rate: 95,
        response_time: 20,
        allows_negotiation: true,
        nin_verified: true,
        cac_verified: true,
      },
      {
        user_id: providerProfile.id,
        provider_type: 'individual' as const,
        business_name: 'Abuja Premium Transport',
        business_address: '78 Wuse 2, Abuja',
        service_areas: ['Abuja', 'Kaduna'],
        verification_status: 'approved' as const,
        rating: 4.5,
        total_bookings: 320,
        acceptance_rate: 88,
        response_time: 45,
        allows_negotiation: false, // Fixed pricing
        nin_verified: true,
        cac_verified: false,
      },
      {
        user_id: providerProfile.id,
        provider_type: 'company' as const,
        business_name: 'Port Harcourt Rides',
        business_address: '5 GRA Phase 2, Port Harcourt',
        service_areas: ['Port Harcourt', 'Warri', 'Calabar'],
        verification_status: 'approved' as const,
        rating: 4.6,
        total_bookings: 560,
        acceptance_rate: 91,
        response_time: 30,
        allows_negotiation: true,
        nin_verified: true,
        cac_verified: true,
      },
    ]

    // Get or create driver record
    let { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', driverProfile.id)
      .single()

    if (!driver) {
      const { data: newDriver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: driverProfile.id,
          provider_id: providerId,
          license_number: 'LAG-DL-12345',
          license_expiry: '2026-12-31',
          verification_status: 'approved',
          available: true,
          rating: 4.8,
          total_trips: 234,
          nin_number: 'NIN987654321',
          nin_verified: true,
        })
        .select()
        .single()

      if (driverError) throw driverError
      driver = newDriver
    } else {
      // Update driver to be assigned to provider
      await supabase
        .from('drivers')
        .update({ provider_id: providerId })
        .eq('id', driver.id)
    }

    if (!driver) {
      throw new Error('Failed to create or find driver')
    }

    const driverId = driver.id

    // Create vehicles
    const vehicleData = [
      {
        provider_id: providerId,
        vehicle_type: 'sedan' as const,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        plate_number: 'LAG-234-ABC',
        color: 'Black',
        seats: 4,
        daily_rate: 45000,
        available: true,
        verified: true,
        images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'],
      },
      {
        provider_id: providerId,
        vehicle_type: 'suv' as const,
        make: 'Toyota',
        model: 'Land Cruiser Prado',
        year: 2023,
        plate_number: 'LAG-567-XYZ',
        color: 'White',
        seats: 7,
        daily_rate: 85000,
        available: true,
        verified: true,
        images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400'],
      },
      {
        provider_id: providerId,
        vehicle_type: 'luxury' as const,
        make: 'Mercedes-Benz',
        model: 'S-Class',
        year: 2024,
        plate_number: 'ABJ-890-LUX',
        color: 'Silver',
        seats: 4,
        daily_rate: 150000,
        available: true,
        verified: true,
        images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'],
      },
      {
        provider_id: providerId,
        vehicle_type: 'van' as const,
        make: 'Toyota',
        model: 'Hiace',
        year: 2021,
        plate_number: 'LAG-VAN-001',
        color: 'White',
        seats: 12,
        daily_rate: 65000,
        available: true,
        verified: true,
        images: ['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'],
      },
      {
        provider_id: providerId,
        vehicle_type: 'bus' as const,
        make: 'Toyota',
        model: 'Coaster',
        year: 2020,
        plate_number: 'LAG-BUS-001',
        color: 'Blue',
        seats: 25,
        daily_rate: 120000,
        available: false,
        verified: true,
        images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'],
      },
    ]

    // Check existing vehicles
    const { data: existingVehicles } = await supabase
      .from('vehicles')
      .select('plate_number')
      .eq('provider_id', providerId)

    const existingPlates = existingVehicles?.map(v => v.plate_number) || []
    const newVehicles = vehicleData.filter(v => !existingPlates.includes(v.plate_number))

    if (newVehicles.length > 0) {
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert(newVehicles)

      if (vehicleError) console.error('Vehicle insert error:', vehicleError)
    }

    // Get a vehicle for bookings
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('provider_id', providerId)
      .limit(1)

    const vehicleId = vehicles?.[0]?.id || null

    // Assign driver to first vehicle
    if (vehicleId) {
      await supabase
        .from('drivers')
        .update({ assigned_vehicle_id: vehicleId })
        .eq('id', driverId)
    }

    // Create bookings with various statuses
    const bookingData = [
      {
        consumer_id: consumerProfile.id,
        provider_id: providerId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        pickup_lat: 6.4541,
        pickup_lng: 3.3947,
        pickup_address: 'Lekki Phase 1, Lagos',
        pickup_name: 'Lekki Toll Gate',
        dropoff_lat: 6.5244,
        dropoff_lng: 3.3792,
        dropoff_address: 'Ikeja GRA, Lagos',
        dropoff_name: 'Ikeja City Mall',
        booking_type: 'full-day' as const,
        vehicle_preference: 'sedan' as const,
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        status: 'confirmed' as const,
        estimated_min_price: 40000,
        estimated_max_price: 55000,
        negotiated_price: 48000,
        final_price: 48000,
        confirmed_at: new Date().toISOString(),
      },
      {
        consumer_id: consumerProfile.id,
        provider_id: providerId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        pickup_lat: 6.4281,
        pickup_lng: 3.4219,
        pickup_address: 'Victoria Island, Lagos',
        pickup_name: 'Eko Hotels',
        dropoff_lat: 6.5833,
        dropoff_lng: 3.3500,
        dropoff_address: 'Murtala Muhammed Airport',
        dropoff_name: 'Lagos Airport',
        booking_type: 'point-to-point' as const,
        vehicle_preference: 'suv' as const,
        scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        scheduled_time: '06:30',
        status: 'in-progress' as const,
        estimated_min_price: 25000,
        estimated_max_price: 35000,
        negotiated_price: 30000,
        started_at: new Date().toISOString(),
      },
      {
        consumer_id: consumerProfile.id,
        provider_id: null,
        driver_id: null,
        vehicle_id: null,
        pickup_lat: 6.4541,
        pickup_lng: 3.3947,
        pickup_address: 'Ikoyi, Lagos',
        pickup_name: 'Banana Island',
        dropoff_lat: 6.4380,
        dropoff_lng: 3.4310,
        dropoff_address: 'Lekki Phase 2, Lagos',
        dropoff_name: 'Lekki Conservation Centre',
        booking_type: 'to-and-fro' as const,
        vehicle_preference: 'luxury' as const,
        scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        scheduled_time: '10:00',
        status: 'pending' as const,
        estimated_min_price: 100000,
        estimated_max_price: 180000,
      },
      {
        consumer_id: consumerProfile.id,
        provider_id: providerId,
        driver_id: null,
        vehicle_id: null,
        pickup_lat: 9.0579,
        pickup_lng: 7.4951,
        pickup_address: 'Wuse 2, Abuja',
        pickup_name: 'Transcorp Hilton',
        dropoff_lat: 9.0765,
        dropoff_lng: 7.3986,
        dropoff_address: 'Nnamdi Azikiwe Airport',
        dropoff_name: 'Abuja Airport',
        booking_type: 'half-day' as const,
        vehicle_preference: 'sedan' as const,
        scheduled_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        scheduled_time: '14:00',
        status: 'matched' as const,
        estimated_min_price: 35000,
        estimated_max_price: 50000,
        matched_at: new Date().toISOString(),
      },
      {
        consumer_id: consumerProfile.id,
        provider_id: providerId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        pickup_lat: 6.4541,
        pickup_lng: 3.3947,
        pickup_address: 'Yaba, Lagos',
        pickup_name: 'University of Lagos',
        dropoff_lat: 6.5244,
        dropoff_lng: 3.3792,
        dropoff_address: 'Surulere, Lagos',
        dropoff_name: 'National Stadium',
        booking_type: 'event' as const,
        vehicle_preference: 'bus' as const,
        scheduled_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        scheduled_time: '08:00',
        status: 'completed' as const,
        estimated_min_price: 80000,
        estimated_max_price: 120000,
        negotiated_price: 95000,
        final_price: 95000,
        confirmed_at: new Date(Date.now() - 172800000).toISOString(),
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        consumer_id: consumerProfile.id,
        provider_id: null,
        driver_id: null,
        vehicle_id: null,
        pickup_lat: 4.8156,
        pickup_lng: 7.0498,
        pickup_address: 'GRA Phase 3, Port Harcourt',
        pickup_name: 'Hotel Presidential',
        dropoff_lat: 4.7774,
        dropoff_lng: 7.0134,
        dropoff_address: 'Port Harcourt Airport',
        dropoff_name: 'PH Airport',
        booking_type: 'point-to-point' as const,
        vehicle_preference: 'sedan' as const,
        scheduled_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        scheduled_time: '05:00',
        status: 'cancelled' as const,
        estimated_min_price: 20000,
        estimated_max_price: 30000,
        cancelled_at: new Date(Date.now() - 86400000).toISOString(),
      },
      // Add a negotiating booking for testing chat
      {
        consumer_id: consumerProfile.id,
        provider_id: providerId,
        driver_id: null,
        vehicle_id: null,
        pickup_lat: 6.4541,
        pickup_lng: 3.3947,
        pickup_address: 'Victoria Island, Lagos',
        pickup_name: 'The Palms Shopping Mall',
        dropoff_lat: 6.4380,
        dropoff_lng: 3.4310,
        dropoff_address: 'Lekki Phase 1, Lagos',
        dropoff_name: 'Lekki Leisure Lake',
        booking_type: 'half-day' as const,
        vehicle_preference: 'suv' as const,
        scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        scheduled_time: '11:00',
        status: 'negotiating' as const,
        estimated_min_price: 45000,
        estimated_max_price: 65000,
        matched_at: new Date().toISOString(),
      },
    ]

    // Check existing bookings count
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('consumer_id', consumerProfile.id)

    // Only add bookings if less than expected
    if ((bookingCount || 0) < 7) {
      for (const booking of bookingData) {
        const { error } = await supabase.from('bookings').insert(booking)
        if (error) console.error('Booking insert error:', error)
      }
    }

    // Create chat messages for the negotiating booking
    const { data: negotiatingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('consumer_id', consumerProfile.id)
      .eq('status', 'negotiating')
      .limit(1)
      .single()

    if (negotiatingBooking) {
      const negotiationMessages = [
        {
          booking_id: negotiatingBooking.id,
          sender_id: providerProfile.id,
          sender_role: 'provider' as const,
          content: 'Thank you for choosing FleetMaster! Here is my quote for your half-day trip:',
          message_type: 'text',
        },
        {
          booking_id: negotiatingBooking.id,
          sender_id: providerProfile.id,
          sender_role: 'provider' as const,
          content: 'Price proposal for your trip',
          message_type: 'price-proposal',
          proposed_price: 60000,
        },
        {
          booking_id: negotiatingBooking.id,
          sender_id: consumerProfile.id,
          sender_role: 'consumer' as const,
          content: 'That seems a bit high. Can you do ₦50,000?',
          message_type: 'text',
        },
        {
          booking_id: negotiatingBooking.id,
          sender_id: consumerProfile.id,
          sender_role: 'consumer' as const,
          content: 'Counter offer',
          message_type: 'price-proposal',
          proposed_price: 50000,
        },
      ]

      // Check existing messages
      const { count: msgCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', negotiatingBooking.id)

      if ((msgCount || 0) < 4) {
        for (const msg of negotiationMessages) {
          await supabase.from('chat_messages').insert(msg)
        }
      }
    }

    // Create some chat messages for the first confirmed booking
    const { data: confirmedBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('consumer_id', consumerProfile.id)
      .eq('status', 'confirmed')
      .limit(1)
      .single()

    if (confirmedBooking) {
      const messages = [
        {
          booking_id: confirmedBooking.id,
          sender_id: consumerProfile.id,
          sender_role: 'consumer' as const,
          content: 'Hello, I need the car at 9 AM sharp please.',
          message_type: 'text',
        },
        {
          booking_id: confirmedBooking.id,
          sender_id: providerProfile.id,
          sender_role: 'provider' as const,
          content: 'Good morning! Your driver Ahmed will be there by 8:45 AM.',
          message_type: 'text',
        },
        {
          booking_id: confirmedBooking.id,
          sender_id: consumerProfile.id,
          sender_role: 'consumer' as const,
          content: 'Can we negotiate the price? I was thinking ₦45,000',
          message_type: 'price-proposal',
          proposed_price: 45000,
        },
        {
          booking_id: confirmedBooking.id,
          sender_id: providerProfile.id,
          sender_role: 'provider' as const,
          content: 'I can do ₦48,000 as my final offer.',
          message_type: 'price-proposal',
          proposed_price: 48000,
        },
        {
          booking_id: confirmedBooking.id,
          sender_id: consumerProfile.id,
          sender_role: 'consumer' as const,
          content: 'Deal! ₦48,000 works for me.',
          message_type: 'price-accepted',
          proposed_price: 48000,
        },
      ]

      // Check existing messages
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', confirmedBooking.id)

      if ((messageCount || 0) < 5) {
        for (const msg of messages) {
          await supabase.from('chat_messages').insert(msg)
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Seed data created successfully',
      data: {
        provider_id: providerId,
        driver_id: driverId,
        consumer_id: consumerProfile.id,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Seed error:', error)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
