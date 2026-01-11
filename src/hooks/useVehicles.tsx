import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useProviders } from './useProviders';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export function useVehicles() {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { provider, isLoading: providerLoading } = useProviders();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyVehicles = async () => {
    if (!provider) {
      setVehicles([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching all vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addVehicle = async (vehicle: Omit<VehicleInsert, 'provider_id'>) => {
    if (!provider) {
      toast.error('Provider profile required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicle,
          provider_id: provider.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Vehicle added successfully!');
      await fetchMyVehicles();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vehicle');
      return null;
    }
  };

  const updateVehicle = async (id: string, updates: VehicleUpdate) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Vehicle updated successfully');
      await fetchMyVehicles();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vehicle');
      return null;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Vehicle removed');
      await fetchMyVehicles();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove vehicle');
      return false;
    }
  };

  useEffect(() => {
    if (authLoading || providerLoading) return;
    
    if (provider) {
      fetchMyVehicles();
    } else {
      setIsLoading(false);
    }
    fetchAllVehicles();
  }, [provider, authLoading, providerLoading]);

  return {
    vehicles,
    allVehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchMyVehicles
  };
}
