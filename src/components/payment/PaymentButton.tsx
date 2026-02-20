import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';
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
  size?: 'sm' | 'default' | 'lg';
}

export function PaymentButton({
  bookingId,
  providerId,
  amount,
  onSuccess,
  onClose,
  disabled,
  className,
  size = 'default',
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
          title: 'InstantRyde Payment',
          description: `Payment for booking ${bookingId.substring(0, 8)}`,
          logo: 'https://instantryde.lovable.app/favicon.ico',
        },
        callback: async (response: FlutterwaveResponse) => {
          if (response.status === 'successful') {
            // Update payment to successful with tx details
            await updatePaymentStatus(
              txRef,
              'successful',
              String(response.transaction_id),
              response.payment_type
            );

            // Update booking: confirmed + final_price
            const { error: bookingError } = await supabase
              .from('bookings')
              .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                final_price: amount,
              })
              .eq('id', bookingId);

            if (bookingError) {
              console.error('Booking update error:', bookingError);
            }

            setPaymentStatus('success');
            setIsProcessing(false);
            toast.success('🎉 Payment successful! Booking confirmed.');
            onSuccess?.(txRef);
          } else {
            await updatePaymentStatus(txRef, 'failed');
            setPaymentStatus('failed');
            setIsProcessing(false);
            toast.error('Payment failed. Please try again.');
          }
        },
        onclose: () => {
          if (isProcessing) {
            setIsProcessing(false);
          }
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
        className="flex items-center gap-1.5 text-success font-medium text-sm"
      >
        <CheckCircle2 size={16} />
        Paid
      </motion.div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="flex items-center gap-1.5">
        <XCircle size={14} className="text-destructive" />
        <Button size={size} onClick={handlePay} disabled={disabled || isProcessing} className={className}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      onClick={handlePay}
      disabled={disabled || isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 size={14} className="mr-1.5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={14} className="mr-1.5" />
          Pay {CURRENCY}{amount.toLocaleString()}
        </>
      )}
    </Button>
  );
}
