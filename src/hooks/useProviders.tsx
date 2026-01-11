import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProviderUpdate = Database['public']['Tables']['providers']['Update'];

export function useProviders() {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyProvider = async () => {
    if (!user) {
      setProvider(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProvider(data);
    } catch (error: any) {
      console.error('Error fetching provider:', error);
    }
  };

  const fetchAllProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllProviders(data || []);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProvider = async (id: string, updates: ProviderUpdate) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Provider updated successfully');
      await fetchMyProvider();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update provider');
      return null;
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      fetchMyProvider();
    }
    fetchAllProviders();
  }, [user, authLoading]);

  return {
    provider,
    allProviders,
    isLoading,
    updateProvider,
    refetch: () => {
      fetchMyProvider();
      fetchAllProviders();
    }
  };
}
