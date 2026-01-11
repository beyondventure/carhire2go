import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Star, Car, Camera, Bell, ChevronRight, LogOut, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DriverProfile() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();
  const { driver, isLoading: driverLoading } = useDrivers();
  const { vehicles } = useVehicles();
  
  const assignedVehicle = driver?.assigned_vehicle_id 
    ? vehicles.find(v => v.id === driver.assigned_vehicle_id)
    : null;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [notifications, setNotifications] = useState({
    newTrips: true,
    tripUpdates: true,
    earnings: true,
    promotions: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications({ ...notifications, [key]: checked });
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleAvatarChange = () => {
    toast.info('Photo upload would open here');
  };

  const handleQuickLink = (link: string) => {
    toast.info(`Opening ${link}...`);
  };

  if (driverLoading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your driver account">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your driver account">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-slate-800 p-6">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt={formData.name}
                    className="w-20 h-20 rounded-xl border-4 border-background"
                  />
                  <button 
                    onClick={handleAvatarChange}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-primary-foreground pb-1">
                  <h2 className="text-xl font-bold">{formData.name || 'Driver'}</h2>
                  <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                    <Star size={14} className="fill-warning text-warning" />
                    <span>{driver?.rating || 0} rating</span>
                    <span>•</span>
                    <span>{driver?.total_trips || 0} trips</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Personal Information</h3>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.email}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+234 800 000 0000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Vehicle */}
          {assignedVehicle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">Assigned Vehicle</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <Car size={32} className="text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{assignedVehicle.make} {assignedVehicle.model}</h4>
                  <p className="text-sm text-muted-foreground">{assignedVehicle.plate_number} • {assignedVehicle.year}</p>
                  <p className="text-sm text-muted-foreground capitalize">{assignedVehicle.vehicle_type} • {assignedVehicle.seats} seats</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* License Info */}
          {driver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">License Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License Number</p>
                    <p className="font-medium text-foreground">{driver.license_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(driver.license_expiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                driver?.verification_status === 'approved' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                <Shield size={20} className={
                  driver?.verification_status === 'approved' ? 'text-success' : 'text-warning'
                } />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  {driver?.verification_status === 'approved' ? 'Verified Driver' : 'Verification Pending'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {driver?.verification_status === 'approved' ? 'All documents verified' : 'Documents under review'}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Identity</span>
                <span className={driver?.nin_verified ? 'text-success' : 'text-warning'}>
                  {driver?.nin_verified ? 'Verified ✓' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">License</span>
                <span className={driver?.verification_status === 'approved' ? 'text-success' : 'text-warning'}>
                  {driver?.verification_status === 'approved' ? 'Verified ✓' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Background Check</span>
                <span className={driver?.verification_status === 'approved' ? 'text-success' : 'text-warning'}>
                  {driver?.verification_status === 'approved' ? 'Verified ✓' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-foreground" />
              <h4 className="font-semibold text-foreground">Notifications</h4>
            </div>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-foreground mb-3">Quick Links</h4>
            <div className="space-y-2">
              {['Help Center', 'Terms of Service', 'Privacy Policy'].map((link) => (
                <button
                  key={link}
                  onClick={() => handleQuickLink(link)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <span className="text-foreground">{link}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <Button 
            variant="outline" 
            className="w-full justify-start text-foreground"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
