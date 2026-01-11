import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, Clock, ArrowUpRight, Download, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { EarningsTrendChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

const driverTransactions = [
  { id: 't1', description: 'Full Day Hire Completed', amount: 29400, date: new Date(), tripId: 'T-1234' },
  { id: 't2', description: 'Point-to-Point Trip', amount: 8400, date: new Date(Date.now() - 86400000), tripId: 'T-1233' },
  { id: 't3', description: 'Half Day Hire', amount: 21000, date: new Date(Date.now() - 86400000 * 2), tripId: 'T-1232' },
  { id: 't4', description: 'Event Hire', amount: 52500, date: new Date(Date.now() - 86400000 * 3), tripId: 'T-1231' },
  { id: 't5', description: 'Full Day Hire Completed', amount: 31500, date: new Date(Date.now() - 86400000 * 4), tripId: 'T-1230' },
];

const weeklyStats = [
  { day: 'Mon', trips: 3, earnings: 45000 },
  { day: 'Tue', trips: 4, earnings: 62000 },
  { day: 'Wed', trips: 2, earnings: 28000 },
  { day: 'Thu', trips: 5, earnings: 75000 },
  { day: 'Fri', trips: 4, earnings: 58000 },
  { day: 'Sat', trips: 6, earnings: 92000 },
  { day: 'Sun', trips: 2, earnings: 32000 },
];

export default function DriverEarnings() {
  const todayEarnings = driverTransactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);
  
  const weeklyEarnings = weeklyStats.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = weeklyStats.reduce((sum, d) => sum + d.trips, 0);

  const handleExport = () => {
    // Generate CSV data
    const headers = ['Date', 'Description', 'Trip ID', 'Amount'];
    const rows = driverTransactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.tripId,
      tx.amount.toString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Earnings exported successfully!');
  };

  const handleTransactionClick = (tx: typeof driverTransactions[0]) => {
    toast.info(`Viewing details for ${tx.tripId}`, {
      description: `${tx.description} - ${CURRENCY}${tx.amount.toLocaleString()}`,
    });
  };

  return (
    <DashboardLayout title="My Earnings" subtitle="Track your earnings and payouts">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Earnings"
          value={`${CURRENCY}${todayEarnings.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 18, isPositive: true }}
        />
        <MetricCard
          title="This Week"
          value={`${CURRENCY}${weeklyEarnings.toLocaleString()}`}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Weekly Trips"
          value={totalTrips.toString()}
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Per Trip"
          value={`${CURRENCY}${Math.round(weeklyEarnings / totalTrips).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2">
          <EarningsTrendChart />
        </div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h3 className="font-semibold text-foreground mb-4">This Week</h3>
          <div className="space-y-3">
            {weeklyStats.map((day) => (
              <div 
                key={day.day} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toast.info(`${day.day}: ${day.trips} trips completed`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-8">{day.day}</span>
                  <span className="text-xs text-muted-foreground">{day.trips} trips</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {CURRENCY}{day.earnings.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between">
            <span className="font-medium text-foreground">Total</span>
            <span className="font-bold text-foreground">
              {CURRENCY}{weeklyEarnings.toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-card rounded-xl border border-border"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>
        <div className="divide-y divide-border">
          {driverTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleTransactionClick(tx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <ArrowUpRight size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.tripId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">
                    +{CURRENCY}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View All Link */}
        <div className="p-4 border-t border-border text-center">
          <Button 
            variant="ghost" 
            className="text-accent"
            onClick={() => toast.info('Full transaction history coming soon')}
          >
            <FileText size={14} className="mr-1" />
            View All Transactions
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
