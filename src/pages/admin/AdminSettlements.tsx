import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, Check, X, Download, Filter, ArrowUpRight, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { SettlementStatusChart, EarningsTrendChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import type { Settlement } from '@/types';

const settlements: (Settlement & { providerName: string })[] = [
  {
    id: 's1',
    providerId: 'p1',
    providerName: 'FleetMaster Nigeria',
    bookingIds: ['b1', 'b2', 'b3'],
    grossAmount: 450000,
    commission: 45000,
    gatewayFees: 2250,
    netAmount: 402750,
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: 's2',
    providerId: 'p2',
    providerName: 'Lagos Elite Cars',
    bookingIds: ['b4', 'b5'],
    grossAmount: 280000,
    commission: 28000,
    gatewayFees: 1400,
    netAmount: 250600,
    status: 'processing',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 's3',
    providerId: 'p1',
    providerName: 'FleetMaster Nigeria',
    bookingIds: ['b6', 'b7', 'b8', 'b9'],
    grossAmount: 680000,
    commission: 68000,
    gatewayFees: 3400,
    netAmount: 608600,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 3),
    processedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 's4',
    providerId: 'p3',
    providerName: 'Abuja Premium Rides',
    bookingIds: ['b10'],
    grossAmount: 150000,
    commission: 15000,
    gatewayFees: 750,
    netAmount: 134250,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 5),
    processedAt: new Date(Date.now() - 86400000 * 4),
  },
];

export default function AdminSettlements() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSettlements = settlements.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const pendingAmount = settlements
    .filter(s => s.status === 'pending' || s.status === 'processing')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const completedAmount = settlements
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const totalCommission = settlements.reduce((sum, s) => sum + s.commission, 0);

  return (
    <DashboardLayout title="Settlements" subtitle="Manage provider payouts">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Pending Payouts"
          value={`${CURRENCY}${pendingAmount.toLocaleString()}`}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Completed (This Week)"
          value={`${CURRENCY}${completedAmount.toLocaleString()}`}
          icon={Check}
          variant="success"
        />
        <MetricCard
          title="Total Commission"
          value={`${CURRENCY}${totalCommission.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Providers to Pay"
          value={settlements.filter(s => s.status === 'pending').length.toString()}
          icon={Building2}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settlements List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Settlement Batches</h3>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {['all', 'pending', 'processing', 'completed'].map((status) => (
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

            <div className="divide-y divide-border">
              {filteredSettlements.map((settlement, index) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{settlement.providerName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          settlement.status === 'completed' ? 'bg-success/10 text-success' :
                          settlement.status === 'processing' ? 'bg-accent/10 text-accent' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {settlement.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {settlement.bookingIds.length} bookings • Created {new Date(settlement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        {CURRENCY}{settlement.netAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Net payout</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Gross</p>
                      <p className="font-medium text-foreground">{CURRENCY}{settlement.grossAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commission (10%)</p>
                      <p className="font-medium text-destructive">-{CURRENCY}{settlement.commission.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gateway Fees</p>
                      <p className="font-medium text-destructive">-{CURRENCY}{settlement.gatewayFees.toLocaleString()}</p>
                    </div>
                  </div>

                  {settlement.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        <Check size={14} className="mr-1" />
                        Approve & Process
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SettlementStatusChart />

          {/* Quick Stats */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-semibold text-foreground mb-4">This Month</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Processed</span>
                <span className="font-medium text-foreground">{CURRENCY}4.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Revenue</span>
                <span className="font-medium text-success">{CURRENCY}420K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Settlements</span>
                <span className="font-medium text-foreground">48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Processing Time</span>
                <span className="font-medium text-foreground">1.2 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
