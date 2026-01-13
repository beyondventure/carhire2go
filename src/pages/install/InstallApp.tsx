import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Download, 
  Bell, 
  CheckCircle2, 
  Smartphone, 
  Share, 
  Plus,
  Car,
  Users,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { 
  isPushSupported, 
  registerServiceWorker,
  getNotificationPermission,
  subscribeToPush,
  savePushSubscription,
  requestNotificationPermission
} from '@/lib/push-notifications';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AppRole = 'consumer' | 'driver' | 'provider';

interface AppConfig {
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  manifestUrl: string;
  startUrl: string;
  features: string[];
  Icon: React.ComponentType<{ className?: string }>;
}

const appConfigs: Record<AppRole, AppConfig> = {
  consumer: {
    name: 'CarHire2Go Rider',
    shortName: 'CH2G Rider',
    description: 'Book car hires on demand with negotiable pricing',
    icon: '/pwa-icons/consumer-icon-512.png',
    color: '#14b8a6',
    bgColor: '#f4f5f7',
    manifestUrl: '/manifest-consumer.json',
    startUrl: '/consumer',
    features: [
      'Book rides instantly',
      'Negotiate pricing',
      'Real-time tracking',
      'Secure payments',
      'Trip history'
    ],
    Icon: Car
  },
  driver: {
    name: 'CarHire2Go Driver',
    shortName: 'CH2G Driver',
    description: 'Accept trips and earn as a professional driver',
    icon: '/pwa-icons/driver-icon-512.png',
    color: '#14b8a6',
    bgColor: '#1a1f2c',
    manifestUrl: '/manifest-driver.json',
    startUrl: '/driver',
    features: [
      'Accept trip requests',
      'Navigation assistance',
      'Earnings tracking',
      'Trip management',
      'Performance stats'
    ],
    Icon: Users
  },
  provider: {
    name: 'CarHire2Go Provider',
    shortName: 'CH2G Provider',
    description: 'Manage your fleet and drivers efficiently',
    icon: '/pwa-icons/provider-icon-512.png',
    color: '#14b8a6',
    bgColor: '#1a1f2c',
    manifestUrl: '/manifest-provider.json',
    startUrl: '/provider',
    features: [
      'Fleet management',
      'Driver assignments',
      'Booking requests',
      'Revenue analytics',
      'Business settings'
    ],
    Icon: Briefcase
  }
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallApp() {
  const { role = 'consumer' } = useParams<{ role: AppRole }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');

  const config = appConfigs[role as AppRole] || appConfigs.consumer;
  const IconComponent = config.Icon;

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check notification permission
    const permission = getNotificationPermission();
    setNotificationsEnabled(permission === 'granted');

    // Update manifest link dynamically
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.setAttribute('href', config.manifestUrl);
    } else {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = config.manifestUrl;
      document.head.appendChild(manifestLink);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    registerServiceWorker().then(reg => {
      if (reg) setSwRegistration(reg);
    });
    // Fetch VAPID public key
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (!error && data?.vapidPublicKey) {
          setVapidPublicKey(data.vapidPublicKey);
        }
      } catch (err) {
        console.warn('Failed to fetch VAPID key:', err);
      }
    };
    fetchVapidKey();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [config.manifestUrl]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          toast.success('Installing app...');
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
        toast.error('Failed to install app');
      }
    }
  };

  const handleEnableNotifications = async () => {
    if (!isPushSupported()) {
      toast.error('Push notifications are not supported on this device');
      return;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Subscribe to push notifications if we have a service worker and VAPID key
        if (swRegistration && vapidPublicKey) {
          const subscription = await subscribeToPush(swRegistration, vapidPublicKey);
          if (subscription && user?.id) {
            await savePushSubscription(user.id, subscription, role as string);
            toast.success('Push notifications enabled!');
          } else {
            toast.success('Notifications enabled! Sign in to receive push notifications.');
          }
        } else {
          toast.success('Notifications enabled!');
        }
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleLaunchApp = () => {
    navigate(config.startUrl);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${config.bgColor} 0%, ${config.color}20 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl">
          {/* App Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg"
              style={{ background: config.color }}
            >
              <img 
                src={config.icon} 
                alt={config.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* App Name & Description */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{config.name}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          {/* Features List */}
          <div className="space-y-2 mb-6">
            {config.features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-sm text-foreground/80"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Install Button */}
            {!isStandalone && !isInstalled && (
              <>
                {deferredPrompt ? (
                  <Button 
                    onClick={handleInstall} 
                    className="w-full bg-accent hover:bg-accent/90 text-white"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install App
                  </Button>
                ) : isIOS ? (
                  <div className="p-4 bg-muted/50 rounded-lg text-sm text-center">
                    <p className="font-medium mb-2">To install on iOS:</p>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Share className="w-4 h-4" />
                      <span>Tap Share</span>
                      <ArrowRight className="w-4 h-4" />
                      <Plus className="w-4 h-4" />
                      <span>Add to Home Screen</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg text-sm text-center text-muted-foreground">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Open in a supported browser to install</p>
                  </div>
                )}
              </>
            )}

            {/* Installed Badge */}
            {(isStandalone || isInstalled) && (
              <div className="flex items-center justify-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">App Installed</span>
              </div>
            )}

            {/* Notifications Button */}
            {!notificationsEnabled ? (
              <Button
                onClick={handleEnableNotifications}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Bell className="w-5 h-5 mr-2" />
                Enable Notifications
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-accent/10 text-accent rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications Enabled</span>
              </div>
            )}

            {/* Launch App Button */}
            <Button
              onClick={handleLaunchApp}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <IconComponent className="w-5 h-5 mr-2" />
              Open {config.shortName}
            </Button>
          </div>

          {/* Role Switcher */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Install other CarHire2Go apps:
            </p>
            <div className="flex justify-center gap-2">
              {Object.entries(appConfigs).map(([key, app]) => (
                key !== role && (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/install/${key}`)}
                    className="text-xs"
                  >
                    <app.Icon className="w-4 h-4 mr-1" />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Button>
                )
              ))}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          CarHire2Go © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
