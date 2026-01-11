import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Star, Car, Phone, Mail, Shield, Calendar, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DriverPerformanceChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useProviders } from '@/hooks/useProviders';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DriverRow = Database['public']['Tables']['drivers']['Row'];

export default function ProviderDrivers() {
  const { provider, isLoading: providerLoading } = useProviders();
  const { drivers, isLoading: driversLoading, updateDriver } = useDrivers();
  const { vehicles } = useVehicles();
  
  const [selectedDriver, setSelectedDriver] = useState<DriverRow | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
  });

  const isLoading = providerLoading || driversLoading;

  const activeDrivers = drivers.filter(d => d.available).length;
  const avgRating = drivers.length > 0 
    ? (drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length).toFixed(1)
    : '0';
  const totalTrips = drivers.reduce((sum, d) => sum + (d.total_trips || 0), 0);

  const toggleAvailability = async (driver: DriverRow) => {
    await updateDriver(driver.id, { available: !driver.available });
    toast.success(`Driver ${driver.available ? 'set offline' : 'set online'}`);
  };

  const getAssignedVehicle = (vehicleId?: string | null) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.email || !newDriver.license_number) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Driver invitation sent to ' + newDriver.email);
    setShowAddDialog(false);
    setNewDriver({ name: '', email: '', phone: '', license_number: '' });
  };

  const handleViewProfile = (driver: DriverRow) => {
    setSelectedDriver(driver);
    setShowProfileDialog(true);
  };

  const handleContactDriver = (driver: DriverRow) => {
    toast.info('Calling driver...');
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Driver Management" subtitle="Manage your drivers and track performance">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Driver Management" subtitle="Manage your drivers and track performance">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Drivers"
          value={drivers.length.toString()}
          icon={Users}
        />
        <MetricCard
          title="Active Now"
          value={activeDrivers.toString()}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Avg Rating"
          value={avgRating}
          icon={Star}
          trend={{ value: 0.2, isPositive: true }}
        />
        <MetricCard
          title="Total Trips"
          value={totalTrips.toLocaleString()}
          icon={Car}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Drivers List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Drivers</h3>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus size={16} className="mr-1" />
                Add Driver
              </Button>
            </div>

            <div className="divide-y divide-border">
              {drivers.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No drivers yet</h3>
                  <p className="text-muted-foreground">Add your first driver to get started</p>
                </div>
              ) : (
                drivers.map((driver, index) => {
                  const vehicle = getAssignedVehicle(driver.assigned_vehicle_id);
                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedDriver?.id === driver.id ? 'bg-accent/5' : ''
                      }`}
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Users size={24} className="text-accent" />
                          </div>
                          {driver.verification_status === 'approved' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                              <Shield size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">Driver #{driver.id.slice(0, 8)}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-warning fill-warning" />
                              {driver.rating || 0}
                            </span>
                            <span>•</span>
                            <span>{driver.total_trips || 0} trips</span>
                          </div>
                          {vehicle && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm">
                              <Car size={12} className="text-accent" />
                              <span className="text-foreground">{vehicle.make} {vehicle.model}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              driver.available
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {driver.available ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <Switch
                            checked={driver.available || false}
                            onCheckedChange={() => toggleAvailability(driver)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Driver Details */}
          {selectedDriver ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border"
            >
              <div className="p-5 text-center border-b border-border">
                <div className="w-20 h-20 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Users size={32} className="text-accent" />
                </div>
                <h4 className="font-semibold text-foreground text-lg">
                  Driver #{selectedDriver.id.slice(0, 8)}
                </h4>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="text-foreground">{selectedDriver.rating || 0}</span>
                  <span className="text-muted-foreground">({selectedDriver.total_trips || 0} trips)</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License</p>
                    <p className="text-sm text-foreground">{selectedDriver.license_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License Expiry</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedDriver.license_expiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={selectedDriver.verification_status === 'approved' ? 'confirmed' : 'pending'} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewProfile(selectedDriver)}
                  >
                    View Full Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleContactDriver(selectedDriver)}
                  >
                    <Phone size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Users size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a driver to view details</p>
            </div>
          )}

          {/* Driver Performance Chart */}
          <DriverPerformanceChart />
        </div>
      </div>

      {/* Add Driver Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                placeholder="Enter driver name"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="driver@email.com"
                value={newDriver.email}
                onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+234 800 000 0000"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>License Number *</Label>
              <Input
                placeholder="ABC123456"
                value={newDriver.license_number}
                onChange={(e) => setNewDriver({ ...newDriver, license_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDriver}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Driver Profile</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users size={28} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Driver #{selectedDriver.id.slice(0, 8)}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={14} className="text-warning fill-warning" />
                    <span className="text-sm text-foreground">{selectedDriver.rating || 0} rating</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{selectedDriver.total_trips || 0} trips</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium text-foreground">{selectedDriver.license_number}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">License Expiry</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedDriver.license_expiry).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="font-medium text-foreground capitalize">{selectedDriver.verification_status}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">NIN Verified</p>
                  <p className="font-medium text-foreground">{selectedDriver.nin_verified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {getAssignedVehicle(selectedDriver.assigned_vehicle_id) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Assigned Vehicle</p>
                  <div className="flex items-center gap-3">
                    <Car size={20} className="text-accent" />
                    <div>
                      {(() => {
                        const v = getAssignedVehicle(selectedDriver.assigned_vehicle_id);
                        return v ? (
                          <>
                            <p className="font-medium text-foreground">{v.make} {v.model}</p>
                            <p className="text-xs text-muted-foreground">{v.plate_number}</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Edit functionality coming soon');
            }}>
              Edit Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
