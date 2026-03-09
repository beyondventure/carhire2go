import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Edit, Trash2, Eye, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { FleetUtilizationChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicles } from '@/hooks/useVehicles';
import { useProviders } from '@/hooks/useProviders';
import { CURRENCY, VEHICLE_TYPES } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type VehicleType = Database['public']['Enums']['vehicle_type'];
type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

export default function ProviderFleet() {
  const { provider } = useProviders();
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plate_number: '',
    color: '',
    vehicle_type: 'sedan' as VehicleType,
    seats: 4,
    daily_rate: 0,
  });

  const availableVehicles = vehicles.filter(v => v.available).length;
  const totalRevenue = vehicles.reduce((sum, v) => sum + v.daily_rate * 20, 0);
  const avgUtilization = vehicles.length > 0 ? Math.round((availableVehicles / vehicles.length) * 100) : 0;

  const filteredVehicles = vehicles.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'available') return v.available;
    if (filter === 'unavailable') return !v.available;
    return v.vehicle_type === filter;
  });

  const toggleAvailability = async (vehicle: VehicleRow) => {
    await updateVehicle(vehicle.id, { available: !vehicle.available });
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.plate_number) return;
    
    await addVehicle(newVehicle);
    
    setIsAddDialogOpen(false);
    setNewVehicle({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plate_number: '',
      color: '',
      vehicle_type: 'sedan',
      seats: 4,
      daily_rate: 0,
    });
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Fleet Management" subtitle="Manage your vehicles and track utilization">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fleet Management" subtitle="Manage your vehicles and track utilization">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MetricCard
          title="Total Vehicles"
          value={vehicles.length.toString()}
          icon={Car}
        />
        <MetricCard
          title="Available"
          value={availableVehicles.toString()}
          icon={Eye}
          variant="success"
        />
        <MetricCard
          title="Fleet Utilization"
          value={`${avgUtilization}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Est. Monthly Revenue"
          value={`${CURRENCY}${(totalRevenue / 1000).toFixed(0)}K`}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vehicles List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border-b border-border gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-foreground">Vehicles</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'available', 'unavailable'].map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="capitalize text-xs"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-1" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Make</Label>
                        <Input
                          placeholder="Toyota"
                          value={newVehicle.make}
                          onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Model</Label>
                        <Input
                          placeholder="Camry"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Year</Label>
                        <Input
                          type="number"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Plate Number</Label>
                        <Input
                          placeholder="LAG-123-ABC"
                          value={newVehicle.plate_number}
                          onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Color</Label>
                        <Input
                          placeholder="Black"
                          value={newVehicle.color}
                          onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Vehicle Type</Label>
                        <Select
                          value={newVehicle.vehicle_type}
                          onValueChange={(value: VehicleType) => setNewVehicle({ ...newVehicle, vehicle_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Seats</Label>
                        <Input
                          type="number"
                          value={newVehicle.seats}
                          onChange={(e) => setNewVehicle({ ...newVehicle, seats: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Daily Rate ({CURRENCY})</Label>
                        <Input
                          type="number"
                          placeholder="45000"
                          value={newVehicle.daily_rate || ''}
                          onChange={(e) => setNewVehicle({ ...newVehicle, daily_rate: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddVehicle} className="w-full">
                      Add Vehicle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="divide-y divide-border">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No vehicles found</h3>
                  <p className="text-muted-foreground">Add your first vehicle to get started</p>
                </div>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedVehicle?.id === vehicle.id ? 'bg-accent/5' : ''
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-20 md:h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Car size={20} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground text-sm md:text-base truncate">
                            {vehicle.make} {vehicle.model}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground capitalize">
                            {vehicle.vehicle_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
                          <span>{vehicle.plate_number}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{vehicle.year}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{vehicle.seats} seats</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-foreground text-sm md:text-base">
                          {CURRENCY}{vehicle.daily_rate.toLocaleString()}
                          <span className="text-xs text-muted-foreground font-normal">/day</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {vehicle.available ? 'Available' : 'Unavailable'}
                          </span>
                          <Switch
                            checked={vehicle.available || false}
                            onCheckedChange={() => toggleAvailability(vehicle)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Vehicle Details */}
          {selectedVehicle ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="w-full h-40 bg-muted flex items-center justify-center">
                <Car size={48} className="text-muted-foreground" />
              </div>
              <div className="p-5">
                <h4 className="font-semibold text-foreground text-lg">
                  {selectedVehicle.make} {selectedVehicle.model}
                </h4>
                <p className="text-muted-foreground text-sm mb-4">{selectedVehicle.year}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground capitalize">{selectedVehicle.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate Number</span>
                    <span className="text-foreground">{selectedVehicle.plate_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color</span>
                    <span className="text-foreground">{selectedVehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="text-foreground font-semibold">
                      {CURRENCY}{selectedVehicle.daily_rate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={selectedVehicle.available ? 'confirmed' : 'cancelled'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified</span>
                    <StatusBadge status={selectedVehicle.verified ? 'confirmed' : 'pending'} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      toast.info('Edit vehicle feature coming soon');
                    }}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/30"
                    onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Car size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a vehicle to view details</p>
            </div>
          )}

          {/* Fleet Utilization Chart */}
          <FleetUtilizationChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
