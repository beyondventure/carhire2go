import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { FLUTTERWAVE_PUBLIC_KEY, openFlutterwavePayment, generateTxRef, type FlutterwaveResponse } from '@/lib/flutterwave';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentButtonProps {
  bookingId: string;
  providerId?: string | null;
  amount: number;
  onSuccess?: (txRef: string) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PaymentButton({
  bookingId,
  providerId,
  amount,
  onSuccess,
  onClose,
  disabled,
  className,
}: PaymentButtonProps) {
  const { user, profile } = useSupabaseAuth();
  const { createPayment, updatePaymentStatus } = usePayments();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handlePay = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to make a payment');
      return;
    }
    if (amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    setIsProcessing(true);
    const txRef = generateTxRef(bookingId);

    // Create pending payment record first
    await createPayment({
      booking_id: bookingId,
      provider_id: providerId || undefined,
      amount,
      flutterwave_ref: txRef,
      customer_email: profile.email,
      customer_name: profile.name,
      customer_phone: profile.phone || undefined,
      status: 'pending',
    });

    try {
      await openFlutterwavePayment({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd,mobilemoney',
        customer: {
          email: profile.email,
          phone_number: profile.phone || '',
          name: profile.name,
        },
        customizations: {
          title: 'CarHire2Go Payment',
          description: `Payment for booking ${bookingId.substring(0, 8)}`,
          logo: 'https://carhire2go.lovable.app/favicon.ico',
        },
        callback: async (response: FlutterwaveResponse) => {
          console.log('Flutterwave response:', response);
          if (response.status === 'successful') {
            // Update payment record
            await updatePaymentStatus(
              txRef,
              'successful',
              String(response.transaction_id),
              response.payment_type
            );
            // Update booking status to confirmed if not already
            await supabase
              .from('bookings')
              .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
              .eq('id', bookingId)
              .in('status', ['matched', 'negotiating']);

            setPaymentStatus('success');
            toast.success('Payment successful! Your booking is confirmed.');
            setIsProcessing(false);
            onSuccess?.(txRef);
          } else {
            await updatePaymentStatus(txRef, 'failed');
            setPaymentStatus('failed');
            toast.error('Payment failed. Please try again.');
            setIsProcessing(false);
          }
        },
        onclose: () => {
          setIsProcessing(false);
          onClose?.();
        },
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('Could not open payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 text-success font-medium"
      >
        <CheckCircle2 size={18} />
        Payment Confirmed
      </motion.div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-destructive text-sm">
          <XCircle size={16} />
          Payment failed
        </div>
        <Button size="sm" onClick={handlePay} disabled={disabled || isProcessing}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePay}
      disabled={disabled || isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={16} className="mr-2" />
          Pay {CURRENCY}{amount.toLocaleString()}
        </>
      )}
    </Button>
  );
}
