import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export function useBookings() {
  const { user, roles, isLoading: authLoading } = useSupabaseAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) {
      setIsLoading(false);
      setBookings([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (booking: Omit<BookingInsert, 'consumer_id'>) => {
    if (!user) {
      toast.error('Please sign in to create a booking');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          consumer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Booking created successfully!');
      await fetchBookings();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
      return null;
    }
  };

  const updateBooking = async (id: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchBookings();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking');
      return null;
    }
  };

  const acceptBooking = async (bookingId: string, providerId: string) => {
    return updateBooking(bookingId, {
      provider_id: providerId,
      status: 'matched',
      matched_at: new Date().toISOString()
    });
  };

  const confirmBooking = async (bookingId: string, finalPrice: number) => {
    return updateBooking(bookingId, {
      status: 'confirmed',
      final_price: finalPrice,
      confirmed_at: new Date().toISOString()
    });
  };

  const startTrip = async (bookingId: string) => {
    return updateBooking(bookingId, {
      status: 'in-progress',
      started_at: new Date().toISOString()
    });
  };

  const completeTrip = async (bookingId: string) => {
    return updateBooking(bookingId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBooking(bookingId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    });
  };

  // Subscribe to realtime updates
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!user) {
      setIsLoading(false);
      setBookings([]);
      return;
    }

    fetchBookings();

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  return {
    bookings,
    isLoading,
    createBooking,
    updateBooking,
    acceptBooking,
    confirmBooking,
    startTrip,
    completeTrip,
    cancelBooking,
    refetch: fetchBookings
  };
}
