import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, CreditCard, Globe, Users, Save, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { COMMISSION_RATE, MATCHING_TIMEOUT } from '@/lib/constants';

export default function AdminSettings() {
  const [platformSettings, setPlatformSettings] = useState({
    commissionRate: COMMISSION_RATE * 100,
    matchingTimeout: MATCHING_TIMEOUT,
    minBookingAmount: 5000,
    maxNegotiationRounds: 5,
  });

  const [notifications, setNotifications] = useState({
    newProviders: true,
    newBookings: true,
    settlements: true,
    alerts: true,
    reports: false,
  });

  const [features, setFeatures] = useState({
    priceNegotiation: true,
    instantBooking: true,
    driverRatings: true,
    promoCodeSystem: true,
    referralProgram: false,
  });

  return (
    <DashboardLayout title="Platform Settings" subtitle="Configure platform-wide settings">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Commission & Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <CreditCard size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Commission & Pricing</h3>
                <p className="text-sm text-muted-foreground">Configure platform fees</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Commission Rate (%)
                  </label>
                  <Input
                    type="number"
                    value={platformSettings.commissionRate}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      commissionRate: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Min Booking Amount (₦)
                  </label>
                  <Input
                    type="number"
                    value={platformSettings.minBookingAmount}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      minBookingAmount: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Matching Timeout (seconds)
                  </label>
                  <Input
                    type="number"
                    value={platformSettings.matchingTimeout}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      matchingTimeout: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Max Negotiation Rounds
                  </label>
                  <Input
                    type="number"
                    value={platformSettings.maxNegotiationRounds}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      maxNegotiationRounds: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
              <Button>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Feature Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Settings size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Feature Toggles</h3>
                <p className="text-sm text-muted-foreground">Enable or disable platform features</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {Object.entries(features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'priceNegotiation' && 'Allow consumers and providers to negotiate prices'}
                      {key === 'instantBooking' && 'Enable instant booking without matching'}
                      {key === 'driverRatings' && 'Allow consumers to rate drivers'}
                      {key === 'promoCodeSystem' && 'Enable promotional codes and discounts'}
                      {key === 'referralProgram' && 'Enable user referral rewards'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setFeatures({ ...features, [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Admin Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Admin Users</h3>
                <p className="text-sm text-muted-foreground">Manage admin access</p>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {[
                  { name: 'Sarah Oke', email: 'sarah@carhire2go.com', role: 'Super Admin' },
                  { name: 'Michael Ade', email: 'michael@carhire2go.com', role: 'Admin' },
                  { name: 'Blessing Nwankwo', email: 'blessing@carhire2go.com', role: 'Support' },
                ].map((admin) => (
                  <div
                    key={admin.email}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                      {admin.role}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Users size={16} className="mr-2" />
                Add Admin User
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <Bell size={18} className="text-foreground" />
              <h3 className="font-semibold text-foreground">Admin Notifications</h3>
            </div>
            <div className="p-5 space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield size={20} className="text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Security</h4>
                <p className="text-sm text-muted-foreground">Platform security settings</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Two-Factor Auth', 'API Keys', 'Audit Logs', 'IP Whitelist'].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <span className="text-foreground">{item}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-foreground mb-3">Resources</h4>
            <div className="space-y-2">
              {['API Documentation', 'Webhook Settings', 'Export Data', 'System Logs'].map((link) => (
                <button
                  key={link}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <span className="text-foreground">{link}</span>
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
