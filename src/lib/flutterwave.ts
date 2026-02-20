// Flutterwave payment integration
export const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-bf58a4e2814eb89b56d6181624da5aea-X';

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

export interface FlutterwaveResponse {
  status: string;
  transaction_id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
  payment_type: string;
}

// Generate unique transaction reference
export const generateTxRef = (bookingId: string): string => {
  return `CHG-${bookingId.substring(0, 8)}-${Date.now()}`;
};

// Load Flutterwave inline script dynamically
export const loadFlutterwaveScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('flutterwave-inline')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'flutterwave-inline';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Flutterwave'));
    document.head.appendChild(script);
  });
};

// Open Flutterwave payment modal
export const openFlutterwavePayment = async (config: FlutterwaveConfig): Promise<void> => {
  await loadFlutterwaveScript();
  const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
  if (!FlutterwaveCheckout) {
    throw new Error('Flutterwave not loaded');
  }
  FlutterwaveCheckout(config);
};
