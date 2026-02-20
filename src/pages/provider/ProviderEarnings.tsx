import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Download, Filter, Calendar, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { EarningsTrendChart, BookingTypeChart, SettlementStatusChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY, COMMISSION_RATE } from '@/lib/constants';
import { useProviders } from '@/hooks/useProviders';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  flutterwave_tx_id: string | null;
  flutterwave_ref: string | null;
  created_at: string;
  consumer_id: string;
}

export default function ProviderEarnings() {
  const { provider } = useProviders();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!provider) { setIsLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('payments' as any)
          .select('*')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false });

        if (!error && data) setPayments(data as unknown as Payment[]);
      } catch (err) {
        console.error('Error fetching provider payments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [provider]);

  const successfulPayments = payments.filter(p => p.status === 'successful');
  const totalGross = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = totalGross * COMMISSION_RATE;
  const totalNet = totalGross - totalCommission;

  const today = new Date().toDateString();
  const todayEarnings = successfulPayments
    .filter(p => new Date(p.created_at).toDateString() === today)
    .reduce((sum, p) => sum + (p.amount * (1 - COMMISSION_RATE)), 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();
  const thisMonthNet = successfulPayments
    .filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount * (1 - COMMISSION_RATE)), 0);

  return (
    <DashboardLayout title="Earnings" subtitle="Track your revenue and settlements">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Earnings"
          value={`${CURRENCY}${todayEarnings.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Pending Payments"
          value={`${CURRENCY}${pendingAmount.toLocaleString()}`}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="This Month (Net)"
          value={`${CURRENCY}${thisMonthNet.toLocaleString()}`}
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Total Net Earnings"
          value={totalNet > 1000000 ? `${CURRENCY}${(totalNet / 1000000).toFixed(1)}M` : `${CURRENCY}${totalNet.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EarningsTrendChart />
        <BookingTypeChart />
      </div>

      {/* Transactions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Payment History</h3>
              <div className="flex gap-2">
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
            ) : payments.length === 0 ? (
              <div className="text-center py-16">
                <Wallet size={40} className="text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">No payments yet</h4>
                <p className="text-sm text-muted-foreground">Payments from your confirmed bookings will appear here.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {payments.map((payment, index) => {
                    const net = payment.amount * (1 - COMMISSION_RATE);
                    const commission = payment.amount * COMMISSION_RATE;
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              payment.status === 'successful' ? 'bg-success/10' :
                              payment.status === 'failed' ? 'bg-destructive/10' :
                              'bg-warning/10'
                            }`}>
                              {payment.status === 'successful'
                                ? <ArrowUpRight size={20} className="text-success" />
                                : <ArrowDownRight size={20} className={payment.status === 'failed' ? 'text-destructive' : 'text-warning'} />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                Booking #{payment.booking_id.substring(0, 8).toUpperCase()}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {payment.payment_method?.replace('_', ' ') || 'Online payment'} • {new Date(payment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${payment.status === 'successful' ? 'text-success' : payment.status === 'failed' ? 'text-destructive' : 'text-warning'}`}>
                              +{CURRENCY}{payment.status === 'successful' ? net.toLocaleString() : payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{payment.status}</p>
                          </div>
                        </div>

                        {payment.status === 'successful' && (
                          <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 rounded-lg p-2 mt-2">
                            <div>
                              <p className="text-muted-foreground">Gross</p>
                              <p className="font-medium text-foreground">{CURRENCY}{payment.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Commission (10%)</p>
                              <p className="font-medium text-destructive">-{CURRENCY}{commission.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Net to you</p>
                              <p className="font-medium text-success">{CURRENCY}{net.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SettlementStatusChart />

          {/* Earnings Summary */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4">Earnings Breakdown</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Earnings</span>
                <span className="font-medium text-foreground">{CURRENCY}{totalGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="font-medium text-destructive">-{CURRENCY}{totalCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground font-medium">Net Earnings</span>
                <span className="font-bold text-success">{CURRENCY}{totalNet.toLocaleString()}</span>
              </div>
            </div>

            {provider?.bank_name && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="text-foreground">{provider.bank_name}</span>
                </div>
                {provider.account_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="text-foreground">****{provider.account_number.slice(-4)}</span>
                  </div>
                )}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              Request Payout
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
