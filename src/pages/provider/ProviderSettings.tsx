import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, CreditCard, Bell, Shield, Globe, ChevronRight, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { mockProvider } from '@/lib/mock-data';
import { SERVICE_CITIES } from '@/lib/constants';

export default function ProviderSettings() {
  const [businessInfo, setBusinessInfo] = useState({
    name: mockProvider.businessName,
    address: mockProvider.businessAddress,
    email: mockProvider.user.email,
    phone: mockProvider.user.phone || '',
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: mockProvider.bankDetails?.bankName || '',
    accountNumber: mockProvider.bankDetails?.accountNumber || '',
    accountName: mockProvider.bankDetails?.accountName || '',
  });

  const [serviceAreas, setServiceAreas] = useState(mockProvider.serviceAreas);
  const [notifications, setNotifications] = useState({
    newBookings: true,
    bookingUpdates: true,
    settlements: true,
    marketing: false,
  });

  const toggleServiceArea = (city: string) => {
    if (serviceAreas.includes(city)) {
      setServiceAreas(serviceAreas.filter(c => c !== city));
    } else {
      setServiceAreas([...serviceAreas, city]);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your business settings and preferences">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building2 size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Business Information</h3>
                <p className="text-sm text-muted-foreground">Update your business details</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Business Name
                  </label>
                  <Input
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Phone Number
                  </label>
                  <Input
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Business Address
                </label>
                <Input
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Email Address
                </label>
                <Input
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                />
              </div>
              <Button className="mt-2">
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Bank Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <CreditCard size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bank Details</h3>
                <p className="text-sm text-muted-foreground">Manage your payout information</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Bank Name
                </label>
                <Input
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Account Number
                  </label>
                  <Input
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Account Name
                  </label>
                  <Input
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  />
                </div>
              </div>
              <Button className="mt-2">
                <Save size={16} className="mr-2" />
                Update Bank Details
              </Button>
            </div>
          </motion.div>

          {/* Service Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MapPin size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Service Areas</h3>
                <p className="text-sm text-muted-foreground">Select cities where you operate</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => toggleServiceArea(city)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      serviceAreas.includes(city)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
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
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <Bell size={20} className="text-foreground" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
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

          {/* Verification Status */}
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
                <h4 className="font-semibold text-foreground">Verified Provider</h4>
                <p className="text-sm text-muted-foreground">All documents verified</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Registration</span>
                <span className="text-success">Verified ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance</span>
                <span className="text-success">Verified ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Compliance</span>
                <span className="text-success">Verified ✓</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-foreground mb-3">Quick Links</h4>
            <div className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Help Center', 'Contact Support'].map((link) => (
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
