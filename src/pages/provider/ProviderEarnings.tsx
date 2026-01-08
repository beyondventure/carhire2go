import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Download, Filter, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { EarningsTrendChart, BookingTypeChart, SettlementStatusChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { mockProviderMetrics } from '@/lib/mock-data';

const transactions = [
  { id: 't1', type: 'earning', description: 'Full Day Hire - Toyota Camry', amount: 42000, date: new Date(), status: 'completed' },
  { id: 't2', type: 'earning', description: 'Point-to-Point - Land Cruiser', amount: 28000, date: new Date(Date.now() - 86400000), status: 'completed' },
  { id: 't3', type: 'commission', description: 'Platform Commission (10%)', amount: -4200, date: new Date(), status: 'deducted' },
  { id: 't4', type: 'settlement', description: 'Weekly Settlement - GTBank', amount: 285000, date: new Date(Date.now() - 86400000 * 3), status: 'completed' },
  { id: 't5', type: 'earning', description: 'Event Hire - Mercedes S-Class', amount: 150000, date: new Date(Date.now() - 86400000 * 4), status: 'pending' },
];

export default function ProviderEarnings() {
  const { todayEarnings, pendingSettlement, totalEarnings } = mockProviderMetrics;

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
          title="Pending Settlement"
          value={`${CURRENCY}${pendingSettlement.toLocaleString()}`}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="This Month"
          value={`${CURRENCY}${(totalEarnings / 12).toLocaleString()}`}
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Total Earnings"
          value={`${CURRENCY}${(totalEarnings / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EarningsTrendChart />
        <div className="grid gap-6">
          <BookingTypeChart />
        </div>
      </div>

      {/* Transactions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Transaction History</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter size={14} className="mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'earning' ? 'bg-success/10' :
                        tx.type === 'commission' ? 'bg-destructive/10' :
                        'bg-accent/10'
                      }`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight size={20} className={
                            tx.type === 'earning' ? 'text-success' : 'text-accent'
                          } />
                        ) : (
                          <ArrowDownRight size={20} className="text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground capitalize">{tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.amount > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{CURRENCY}{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <Button variant="ghost" className="w-full">
                View All Transactions
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SettlementStatusChart />

          {/* Payout Schedule */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4">Next Payout</h4>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-foreground mb-1">
                {CURRENCY}{pendingSettlement.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled for Friday</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="text-foreground">GTBank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="text-foreground">****6789</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Request Early Payout
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
