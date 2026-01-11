import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Driver = Database['public']['Tables']['drivers']['Row'];
type DriverUpdate = Database['public']['Tables']['drivers']['Update'];

export function useDrivers() {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyDriver = async () => {
    if (!user) {
      setDriver(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setDriver(data);
    } catch (error: any) {
      console.error('Error fetching driver:', error);
    }
  };

  const fetchAllDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllDrivers(data || []);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDriver = async (id: string, updates: DriverUpdate) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Driver updated successfully');
      await fetchMyDriver();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update driver');
      return null;
    }
  };

  const toggleAvailability = async (driverId: string, available: boolean) => {
    return updateDriver(driverId, { available });
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      fetchMyDriver();
    }
    fetchAllDrivers();
  }, [user, authLoading]);

  return {
    driver,
    allDrivers,
    isLoading,
    updateDriver,
    toggleAvailability,
    refetch: () => {
      fetchMyDriver();
      fetchAllDrivers();
    }
  };
}
