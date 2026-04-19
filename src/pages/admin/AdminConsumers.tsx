import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye, Ban, TrendingUp, Mail, Phone, X, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CURRENCY } from '@/lib/constants';
import { openEmail } from '@/lib/platform';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Consumer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string;
  totalBookings: number;
  totalSpent: number;
  joinedAt: string;
  lastActive: string;
}

export default function AdminConsumers() {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const fetchConsumers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all consumer user_ids
      const { data: roles, error: rolesErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'consumer');

      if (rolesErr) throw rolesErr;
      const consumerIds = (roles || []).map(r => r.user_id);
      if (consumerIds.length === 0) { setConsumers([]); return; }

      // Fetch profiles for those users
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, name, email, phone, avatar_url, created_at, updated_at')
        .in('id', consumerIds)
        .order('created_at', { ascending: false });

      if (profilesErr) throw profilesErr;

      // Fetch booking stats per consumer
      const { data: bookings, error: bookingsErr } = await supabase
        .from('bookings')
        .select('consumer_id, final_price, negotiated_price')
        .in('consumer_id', consumerIds)
        .eq('status', 'completed');

      if (bookingsErr) throw bookingsErr;

      // Build per-consumer aggregates
      const bookingMap: Record<string, { count: number; spent: number }> = {};
      for (const b of bookings || []) {
        if (!bookingMap[b.consumer_id]) bookingMap[b.consumer_id] = { count: 0, spent: 0 };
        bookingMap[b.consumer_id].count += 1;
        bookingMap[b.consumer_id].spent += Number(b.final_price ?? b.negotiated_price ?? 0);
      }

      const mapped: Consumer[] = (profiles || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        totalBookings: bookingMap[p.id]?.count ?? 0,
        totalSpent: bookingMap[p.id]?.spent ?? 0,
        joinedAt: p.created_at,
        lastActive: p.updated_at,
      }));

      setConsumers(mapped);
    } catch (err: any) {
      console.error('Error fetching consumers:', err);
      toast.error('Failed to load consumers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConsumers(); }, [fetchConsumers]);

  const filteredConsumers = consumers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const totalBookings = consumers.reduce((sum, c) => sum + c.totalBookings, 0);
  const totalGMV = consumers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <DashboardLayout title="Consumers" subtitle="Manage registered consumers">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Consumers" value={consumers.length.toString()} icon={Users} />
        <MetricCard title="Completed Bookings" value={totalBookings.toString()} icon={TrendingUp} trend={{ value: 12, isPositive: true }} />
        <MetricCard
          title="Consumer GMV"
          value={totalGMV > 1000000 ? `${CURRENCY}${(totalGMV / 1000000).toFixed(1)}M` : `${CURRENCY}${totalGMV.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard title="Avg Spend" value={consumers.length > 0 ? `${CURRENCY}${Math.round(totalGMV / consumers.length).toLocaleString()}` : `${CURRENCY}0`} icon={Users} />
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search consumers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredConsumers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No consumers found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search' : 'No consumers have registered yet'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Consumer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Bookings</th>
                <th className="p-4 font-medium">Total Spent</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredConsumers.map((consumer, index) => (
                <motion.tr
                  key={consumer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={consumer.avatar} alt={consumer.name} className="w-10 h-10 rounded-lg" />
                      <div>
                        <p className="font-medium text-foreground">{consumer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(consumer.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-foreground">{consumer.email}</p>
                    {consumer.phone && <p className="text-xs text-muted-foreground">{consumer.phone}</p>}
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">{consumer.totalBookings}</td>
                  <td className="p-4 text-sm font-medium text-foreground">
                    {CURRENCY}{consumer.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(consumer.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedConsumer(consumer); setShowViewDialog(true); }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { openEmail(consumer.email); toast.success(`Opening email to ${consumer.email}`); }}
                      >
                        <Mail size={16} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Consumer Details</DialogTitle></DialogHeader>
          {selectedConsumer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img src={selectedConsumer.avatar} alt={selectedConsumer.name} className="w-16 h-16 rounded-xl" />
                <div>
                  <h4 className="font-semibold text-foreground">{selectedConsumer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(selectedConsumer.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Completed Bookings</p>
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
                  {selectedConsumer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{selectedConsumer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => selectedConsumer && (openEmail(selectedConsumer.email), toast.success(`Opening email to ${selectedConsumer.email}`))}>
              <Mail size={14} className="mr-1" /> Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
