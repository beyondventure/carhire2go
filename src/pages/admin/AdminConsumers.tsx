import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star, MapPin, Eye, MoreVertical, Ban, TrendingUp, Mail, Phone, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CURRENCY } from '@/lib/constants';
import { openEmail } from '@/lib/platform';
import { toast } from 'sonner';

const initialConsumers = [
  {
    id: 'c1',
    name: 'John Adebayo',
    email: 'john@example.com',
    phone: '+234 801 234 5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    totalBookings: 24,
    totalSpent: 456000,
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    status: 'active',
    recentBookings: [
      { id: 'b1', type: 'Full Day Hire', date: new Date(), amount: 45000 },
      { id: 'b2', type: 'Point to Point', date: new Date(Date.now() - 86400000 * 2), amount: 12000 },
    ]
  },
  {
    id: 'c2',
    name: 'Amaka Obi',
    email: 'amaka@example.com',
    phone: '+234 802 345 6789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amaka',
    totalBookings: 18,
    totalSpent: 324000,
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date(Date.now() - 86400000),
    status: 'active',
    recentBookings: [
      { id: 'b3', type: 'Event Hire', date: new Date(Date.now() - 86400000), amount: 85000 },
    ]
  },
  {
    id: 'c3',
    name: 'Olumide Fashola',
    email: 'olumide@example.com',
    phone: '+234 803 456 7890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olumide',
    totalBookings: 8,
    totalSpent: 128000,
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date(Date.now() - 86400000 * 7),
    status: 'inactive',
    recentBookings: []
  },
  {
    id: 'c4',
    name: 'Fatima Abubakar',
    email: 'fatima@example.com',
    phone: '+234 804 567 8901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    totalBookings: 32,
    totalSpent: 680000,
    joinedAt: new Date('2023-11-05'),
    lastActive: new Date(),
    status: 'active',
    recentBookings: [
      { id: 'b4', type: 'Half Day Hire', date: new Date(), amount: 25000 },
      { id: 'b5', type: 'Full Day Hire', date: new Date(Date.now() - 86400000), amount: 45000 },
      { id: 'b6', type: 'To and Fro', date: new Date(Date.now() - 86400000 * 3), amount: 35000 },
    ]
  },
];

type Consumer = typeof initialConsumers[0];

export default function AdminConsumers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [consumers, setConsumers] = useState(initialConsumers);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');

  const filteredConsumers = consumers.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    }
    return true;
  });

  const totalConsumers = consumers.length;
  const activeConsumers = consumers.filter(c => c.status === 'active').length;
  const totalBookings = consumers.reduce((sum, c) => sum + c.totalBookings, 0);
  const totalGMV = consumers.reduce((sum, c) => sum + c.totalSpent, 0);

  const handleViewConsumer = (consumer: Consumer) => {
    setSelectedConsumer(consumer);
    setShowViewDialog(true);
  };

  const handleBanClick = (consumer: Consumer) => {
    setSelectedConsumer(consumer);
    setShowBanDialog(true);
  };

  const handleBanConfirm = () => {
    if (!selectedConsumer) return;
    
    setConsumers(prev => prev.map(c => 
      c.id === selectedConsumer.id ? { ...c, status: 'banned' } : c
    ));
    toast.error(`${selectedConsumer.name} has been banned`);
    setShowBanDialog(false);
    setSelectedConsumer(null);
    setBanReason('');
  };

  const handleUnban = (consumer: Consumer) => {
    setConsumers(prev => prev.map(c => 
      c.id === consumer.id ? { ...c, status: 'active' } : c
    ));
    toast.success(`${consumer.name} has been unbanned`);
  };

  const handleContactConsumer = (consumer: Consumer) => {
    toast.success(`Opening email to ${consumer.email}...`);
    openEmail(consumer.email);
  };

  return (
    <DashboardLayout title="Consumers" subtitle="Manage registered consumers">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Consumers"
          value={totalConsumers.toString()}
          icon={Users}
        />
        <MetricCard
          title="Active Users"
          value={activeConsumers.toString()}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Total Bookings"
          value={totalBookings.toString()}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Consumer GMV"
          value={`${CURRENCY}${(totalGMV / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search consumers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'banned'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Consumers Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-4 font-medium">Consumer</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Bookings</th>
              <th className="p-4 font-medium">Total Spent</th>
              <th className="p-4 font-medium">Last Active</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredConsumers.map((consumer, index) => (
              <motion.tr
                key={consumer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={consumer.avatar}
                      alt={consumer.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-foreground">{consumer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(consumer.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{consumer.email}</p>
                  <p className="text-xs text-muted-foreground">{consumer.phone}</p>
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {consumer.totalBookings}
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {CURRENCY}{consumer.totalSpent.toLocaleString()}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(consumer.lastActive).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    consumer.status === 'active'
                      ? 'bg-success/10 text-success'
                      : consumer.status === 'banned'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {consumer.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleViewConsumer(consumer)}
                    >
                      <Eye size={16} />
                    </Button>
                    {consumer.status === 'banned' ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-success"
                        onClick={() => handleUnban(consumer)}
                      >
                        <X size={16} />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleBanClick(consumer)}
                      >
                        <Ban size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Consumer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Consumer Details</DialogTitle>
          </DialogHeader>
          {selectedConsumer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={selectedConsumer.avatar}
                  alt={selectedConsumer.name}
                  className="w-16 h-16 rounded-xl"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{selectedConsumer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(selectedConsumer.joinedAt).toLocaleDateString()}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block ${
                    selectedConsumer.status === 'active'
                      ? 'bg-success/10 text-success'
                      : selectedConsumer.status === 'banned'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {selectedConsumer.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="text-lg font-semibold text-foreground">{selectedConsumer.totalBookings}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold text-foreground">
                    {CURRENCY}{selectedConsumer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-foreground mb-2">Contact Information</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedConsumer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-muted-foreground" />
                    <span className="text-foreground">{selectedConsumer.phone}</span>
                  </div>
                </div>
              </div>

              {selectedConsumer.recentBookings.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-2">Recent Bookings</h5>
                  <div className="space-y-2">
                    {selectedConsumer.recentBookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{booking.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {CURRENCY}{booking.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedConsumer && handleContactConsumer(selectedConsumer)}>
              <Mail size={14} className="mr-1" />
              Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Consumer Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Consumer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to ban {selectedConsumer?.name}? They will no longer be able to make bookings.
            </p>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Reason (optional)
              </label>
              <Input
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanConfirm}>
              Ban Consumer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
