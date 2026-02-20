import { motion } from 'framer-motion';
import { CreditCard, Download, Receipt, Wallet, TrendingUp, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { usePayments } from '@/hooks/usePayments';

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  successful: { label: 'Paid', icon: CheckCircle2, className: 'text-success bg-success/10' },
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

  const successfulCount = payments.filter(p => p.status === 'successful').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  return (
    <DashboardLayout title="Payments" subtitle="Your payment history & transactions">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Paid', value: `${CURRENCY}${totalPaid.toLocaleString()}`, icon: Wallet, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending', value: `${CURRENCY}${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'This Month', value: `${CURRENCY}${thisMonthTotal.toLocaleString()}`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-3">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`font-bold text-sm mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Counts */}
      {payments.length > 0 && (
        <div className="flex gap-3 mb-5 p-3 bg-muted/40 rounded-xl">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-success">{successfulCount}</p>
            <p className="text-xs text-muted-foreground">Successful</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-destructive">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Transaction History</h3>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Receipt size={28} className="text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-1 text-sm">No payments yet</h4>
            <p className="text-xs text-muted-foreground">
              Payment history will appear here after your first booking payment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((payment, index) => {
              const cfg = statusConfig[payment.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.className}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          Booking #{payment.booking_id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {payment.payment_method?.replace('_', ' ') || 'Online payment'}
                        </p>
                        {payment.flutterwave_ref && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[180px]">
                            Ref: {payment.flutterwave_ref}
                          </p>
                        )}
                        {payment.flutterwave_tx_id && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Tx: {payment.flutterwave_tx_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${
                        payment.status === 'successful'
                          ? 'text-success'
                          : payment.status === 'failed'
                          ? 'text-destructive'
                          : 'text-foreground'
                      }`}>
                        {CURRENCY}{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(payment.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
