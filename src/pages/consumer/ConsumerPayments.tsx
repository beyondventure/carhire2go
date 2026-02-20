import { motion } from 'framer-motion';
import { CreditCard, Download, Receipt, Plus, ChevronRight, Wallet, TrendingUp, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { usePayments } from '@/hooks/usePayments';

const paymentMethods = [
  { id: 'card1', type: 'card', name: 'Visa ending in 4532', expiry: '12/26', isDefault: true },
  { id: 'card2', type: 'card', name: 'Mastercard ending in 8721', expiry: '08/25', isDefault: false },
];

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  successful: { label: 'Successful', icon: CheckCircle2, className: 'text-success bg-success/10' },
  pending: { label: 'Pending', icon: Clock, className: 'text-warning bg-warning/10' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-destructive bg-destructive/10' },
};

export default function ConsumerPayments() {
  const { payments, isLoading, totalPaid, pendingAmount } = usePayments();

  const thisMonthTotal = payments
    .filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return (
        p.status === 'successful' &&
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Payments" subtitle="Manage your payment methods and view transaction history">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Paid"
          value={`${CURRENCY}${totalPaid.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Pending Payments"
          value={`${CURRENCY}${pendingAmount.toLocaleString()}`}
          icon={Receipt}
          variant="warning"
        />
        <MetricCard
          title="This Month"
          value={`${CURRENCY}${thisMonthTotal.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Payment History</h3>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-1" />
                Export
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16">
                <Receipt size={40} className="text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">No payments yet</h4>
                <p className="text-sm text-muted-foreground">Your payment history will appear here after your first booking payment.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((payment, index) => {
                  const cfg = statusConfig[payment.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.className}`}>
                            <StatusIcon size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Booking #{payment.booking_id.substring(0, 8).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground capitalize">
                                {payment.payment_method?.replace('_', ' ') || 'Card payment'}
                              </p>
                              {payment.flutterwave_ref && (
                                <span className="text-xs text-muted-foreground">
                                  • Ref: {payment.flutterwave_ref.substring(0, 16)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${payment.status === 'successful' ? 'text-success' : payment.status === 'failed' ? 'text-destructive' : 'text-foreground'}`}>
                            {CURRENCY}{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Detailed info */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                        <div>
                          <span className="font-medium text-foreground/70">Status</span>
                          <p className={`font-medium capitalize ${cfg.className.split(' ')[0]}`}>{cfg.label}</p>
                        </div>
                        {payment.flutterwave_tx_id && (
                          <div>
                            <span className="font-medium text-foreground/70">Tx ID</span>
                            <p>{payment.flutterwave_tx_id}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-foreground/70">Currency</span>
                          <p>{payment.currency}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Payment Methods</h3>
              <Button variant="ghost" size="sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                      Default
                    </span>
                  )}
                </motion.div>
              ))}
              <Button variant="outline" className="w-full mt-2">
                <Plus size={16} className="mr-2" />
                Add New Card
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {['Download Invoices', 'Request Receipt', 'Billing Settings'].map((action) => (
                <button
                  key={action}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <span className="text-foreground">{action}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4">
            <h4 className="font-medium text-foreground mb-3">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Successful</span>
                <span className="text-success font-medium">{payments.filter(p => p.status === 'successful').length} payments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="text-warning font-medium">{payments.filter(p => p.status === 'pending').length} payments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failed</span>
                <span className="text-destructive font-medium">{payments.filter(p => p.status === 'failed').length} payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
