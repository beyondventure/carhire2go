import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, Check, Download, ArrowUpRight, Building2, Loader2, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { SettlementStatusChart, EarningsTrendChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY, COMMISSION_RATE } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface PaymentWithProvider {
  id: string;
  booking_id: string;
  consumer_id: string;
  provider_id: string | null;
  amount: number;
  status: string;
  flutterwave_tx_id: string | null;
  flutterwave_ref: string | null;
  payment_method: string | null;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  providerName?: string;
}

export default function AdminSettlements() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payments, setPayments] = useState<PaymentWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: paymentsData, error } = await supabase
          .from('payments' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const raw = (paymentsData as unknown as PaymentWithProvider[]) || [];

        // Fetch provider names
        const providerIds = [...new Set(raw.filter(p => p.provider_id).map(p => p.provider_id!))];
        let providerMap = new Map<string, string>();
        if (providerIds.length > 0) {
          const { data: providers } = await supabase
            .from('providers')
            .select('id, business_name')
            .in('id', providerIds);
          providers?.forEach(p => providerMap.set(p.id, p.business_name || 'Provider'));
        }

        setPayments(raw.map(p => ({
          ...p,
          providerName: p.provider_id ? providerMap.get(p.provider_id) || 'Unknown Provider' : 'Direct',
        })));
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const successfulPayments = payments.filter(p => p.status === 'successful');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalGross = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = totalGross * COMMISSION_RATE;
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Settlements & Payments" subtitle="Monitor all platform transactions">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total GMV"
          value={`${CURRENCY}${totalGross.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Platform Revenue (10%)"
          value={`${CURRENCY}${totalCommission.toLocaleString()}`}
          icon={Check}
          variant="success"
        />
        <MetricCard
          title="Pending Payments"
          value={`${CURRENCY}${pendingAmount.toLocaleString()}`}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Total Transactions"
          value={String(payments.length)}
          icon={CreditCard}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payments List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">All Transactions</h3>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {['all', 'successful', 'pending', 'failed'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="capitalize text-xs"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard size={40} className="text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">No transactions found</h4>
                <p className="text-sm text-muted-foreground">Flutterwave payments will appear here once consumers start paying.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredPayments.map((payment, index) => {
                  const commission = payment.amount * COMMISSION_RATE;
                  const net = payment.amount - commission;
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              Booking #{payment.booking_id.substring(0, 8).toUpperCase()}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'successful' ? 'bg-success/10 text-success' :
                              payment.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                              'bg-warning/10 text-warning'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.providerName} • {payment.customer_name || 'Consumer'} • {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {CURRENCY}{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Gross amount</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Gross</p>
                          <p className="font-medium text-foreground">{CURRENCY}{payment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Commission (10%)</p>
                          <p className="font-medium text-success">{CURRENCY}{commission.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Net to Provider</p>
                          <p className="font-medium text-foreground">{CURRENCY}{net.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Method</p>
                          <p className="font-medium text-foreground capitalize">
                            {payment.payment_method?.replace('_', ' ') || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {payment.flutterwave_ref && (
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5">
                          Flutterwave Ref: <span className="font-mono">{payment.flutterwave_ref}</span>
                          {payment.flutterwave_tx_id && (
                            <> • TX ID: <span className="font-mono">{payment.flutterwave_tx_id}</span></>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SettlementStatusChart />

          {/* Revenue Summary */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4">Revenue Summary</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Gross</span>
                <span className="font-medium text-foreground">{CURRENCY}{totalGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Revenue</span>
                <span className="font-medium text-success">{CURRENCY}{totalCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To Providers</span>
                <span className="font-medium text-foreground">{CURRENCY}{(totalGross - totalCommission).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Successful Txns</span>
                <span className="font-medium text-foreground">{successfulPayments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Txns</span>
                <span className="font-medium text-warning">{pendingPayments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
