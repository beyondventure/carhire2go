import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  booking_id: string;
  consumer_id: string;
  provider_id: string | null;
  amount: number;
  currency: string;
  status: string;
  flutterwave_tx_id: string | null;
  flutterwave_ref: string | null;
  payment_method: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function usePayments(bookingId?: string) {
  const { user } = useSupabaseAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      let query = supabase
        .from('payments' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments((data as unknown as Payment[]) || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (payment: {
    booking_id: string;
    provider_id?: string;
    amount: number;
    flutterwave_ref: string;
    flutterwave_tx_id?: string;
    payment_method?: string;
    customer_email?: string;
    customer_name?: string;
    customer_phone?: string;
    status?: string;
  }) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('payments' as any)
        .insert({
          ...payment,
          consumer_id: user.id,
          currency: 'NGN',
          status: payment.status || 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPayments();
      return data as unknown as Payment;
    } catch (err: any) {
      console.error('Error creating payment:', err);
      return null;
    }
  };

  const updatePaymentStatus = async (
    flutterwaveRef: string,
    status: string,
    txId?: string,
    paymentMethod?: string
  ) => {
    try {
      const updates: any = { status };
      if (txId) updates.flutterwave_tx_id = txId;
      if (paymentMethod) updates.payment_method = paymentMethod;

      const { error } = await supabase
        .from('payments' as any)
        .update(updates)
        .eq('flutterwave_ref', flutterwaveRef);

      if (error) throw error;
      await fetchPayments();
      return true;
    } catch (err: any) {
      console.error('Error updating payment:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user, bookingId]);

  const totalPaid = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    isLoading,
    totalPaid,
    pendingAmount,
    createPayment,
    updatePaymentStatus,
    refetch: fetchPayments,
  };
}
