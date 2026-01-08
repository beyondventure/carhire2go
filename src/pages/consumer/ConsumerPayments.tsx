import { motion } from 'framer-motion';
import { CreditCard, Download, Receipt, Plus, ChevronRight, Wallet, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';

const paymentHistory = [
  {
    id: 'p1',
    type: 'booking',
    description: 'Full Day Hire - Toyota Camry',
    amount: 42000,
    status: 'completed',
    date: new Date(),
    provider: 'FleetMaster Nigeria',
  },
  {
    id: 'p2',
    type: 'booking',
    description: 'Point-to-Point - Toyota Land Cruiser',
    amount: 28000,
    status: 'completed',
    date: new Date(Date.now() - 86400000 * 3),
    provider: 'Lagos Elite Cars',
  },
  {
    id: 'p3',
    type: 'refund',
    description: 'Cancelled Booking Refund',
    amount: 15000,
    status: 'completed',
    date: new Date(Date.now() - 86400000 * 7),
    provider: 'FleetMaster Nigeria',
  },
  {
    id: 'p4',
    type: 'booking',
    description: 'Half Day Hire - Mercedes S-Class',
    amount: 75000,
    status: 'pending',
    date: new Date(Date.now() - 86400000 * 10),
    provider: 'Premium Rides NG',
  },
];

const paymentMethods = [
  { id: 'card1', type: 'card', name: 'Visa ending in 4532', expiry: '12/26', isDefault: true },
  { id: 'card2', type: 'card', name: 'Mastercard ending in 8721', expiry: '08/25', isDefault: false },
];

export default function ConsumerPayments() {
  const totalSpent = paymentHistory
    .filter(p => p.type === 'booking' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = paymentHistory
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Payments" subtitle="Manage your payment methods and view transaction history">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Spent"
          value={`${CURRENCY}${totalSpent.toLocaleString()}`}
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
          value={`${CURRENCY}70,000`}
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
            <div className="divide-y divide-border">
              {paymentHistory.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment.type === 'refund' 
                          ? 'bg-success/10' 
                          : 'bg-accent/10'
                      }`}>
                        <Receipt size={20} className={
                          payment.type === 'refund' ? 'text-success' : 'text-accent'
                        } />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{payment.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        payment.type === 'refund' ? 'text-success' : 'text-foreground'
                      }`}>
                        {payment.type === 'refund' ? '+' : '-'}{CURRENCY}{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
