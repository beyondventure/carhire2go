import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Briefcase, Shield, ChevronRight, MapPin, Clock, CreditCard, Zap, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/lib/constants';
import type { UserRole } from '@/types';

const roleCards: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
}> = [
  {
    role: 'consumer',
    title: 'Book a Ride',
    description: 'Find and book premium car hire services across Nigeria',
    icon: <Car size={28} />,
    features: ['Real-time matching', 'Price negotiation', 'Secure payments'],
    gradient: 'from-accent to-secondary',
  },
  {
    role: 'provider',
    title: 'Provider Portal',
    description: 'Manage your fleet, drivers, and grow your business',
    icon: <Briefcase size={28} />,
    features: ['Fleet management', 'Driver onboarding', 'Earnings dashboard'],
    gradient: 'from-warning to-orange-500',
  },
  {
    role: 'driver',
    title: 'Driver App',
    description: 'Accept trips and navigate with ease',
    icon: <Users size={28} />,
    features: ['Trip alerts', 'Navigation', 'Earnings tracking'],
    gradient: 'from-success to-emerald-500',
  },
  {
    role: 'admin',
    title: 'Admin Console',
    description: 'Platform management and analytics',
    icon: <Shield size={28} />,
    features: ['User management', 'Settlements', 'Analytics'],
    gradient: 'from-primary to-slate-700',
  },
];

const features = [
  { icon: <MapPin size={20} />, title: 'Nationwide Coverage', description: 'Service across all major Nigerian cities' },
  { icon: <Clock size={20} />, title: '60s Matching', description: 'Fast provider matching in seconds' },
  { icon: <CreditCard size={20} />, title: 'Secure Payments', description: 'Escrow-protected transactions' },
  { icon: <Zap size={20} />, title: 'Real-time Tracking', description: 'Live trip monitoring' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    const routes: Record<UserRole, string> = {
      consumer: '/consumer',
      provider: '/provider',
      driver: '/driver',
      admin: '/admin',
    };
    navigate(routes[role]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center"
              >
                <Car size={22} className="text-white" />
              </motion.div>
              <span className="text-xl font-semibold">{PLATFORM_NAME}</span>
            </div>
          </header>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center pb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              {PLATFORM_TAGLINE}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
            >
              Nigeria's premier car hire aggregation platform. Connect with verified providers, negotiate prices, and travel with confidence.
            </motion.p>
            
            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3 text-accent">
                    {feature.icon}
                  </div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-primary-foreground/60 mt-1">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Get Started</h2>
            <p className="text-muted-foreground">Select your role to continue</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {roleCards.map((card, index) => (
              <motion.button
                key={card.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(card.role)}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-accent/30 text-left transition-all shadow-sm hover:shadow-lg"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-between">
                  {card.title}
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {card.description}
                </p>

                <div className="space-y-2">
                  {card.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="text-accent" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 {PLATFORM_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
