import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Briefcase, Users, ArrowRight, Check } from 'lucide-react';
import riderImage from '@/assets/rider-hero.jpg';
import fleetOwnerImage from '@/assets/fleet-owner.jpg';
import driverImage from '@/assets/driver-hero.jpg';

const userTypes = [
  {
    id: 'consumer',
    icon: Car,
    title: 'Riders',
    subtitle: 'Book your next trip',
    description: 'Find verified drivers, compare prices, and travel safely across Nigeria.',
    features: ['Real-time price quotes', 'In-app negotiation', 'Live trip tracking', 'Secure payments'],
    cta: 'Start Booking',
    route: '/auth/register?role=consumer',
    iconBg: 'bg-blue-500',
    ctaBg: 'bg-foreground text-background hover:bg-foreground/90',
    image: riderImage,
  },
  {
    id: 'provider',
    icon: Briefcase,
    title: 'Fleet Owners',
    subtitle: 'Grow your business',
    description: 'List your vehicles, manage drivers, and reach thousands of customers.',
    features: ['Fleet management tools', 'Driver onboarding', 'Earnings analytics', 'Automated settlements'],
    cta: 'Register Fleet',
    route: '/auth/register?role=provider',
    iconBg: 'bg-emerald-500',
    ctaBg: 'bg-foreground text-background hover:bg-foreground/90',
    image: fleetOwnerImage,
  },
  {
    id: 'driver',
    icon: Users,
    title: 'Drivers',
    subtitle: 'Earn on your terms',
    description: 'Join our network of professional drivers and earn competitive income.',
    features: ['Flexible schedules', 'Instant trip alerts', 'Weekly payouts', 'Performance bonuses'],
    cta: 'Become a Driver',
    route: '/auth/register?role=driver',
    iconBg: 'bg-amber-500',
    ctaBg: 'bg-foreground text-background hover:bg-foreground/90',
    image: driverImage,
  },
];

export function UserTypesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">Join Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Choose how you want to move
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're looking to travel, manage a fleet, or drive for income, we have the perfect platform for you.
          </p>
        </motion.div>

        {/* User Type Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {userTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-accent/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card z-10" />
                <motion.img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={`absolute top-4 left-4 z-20 w-12 h-12 rounded-xl ${type.iconBg} flex items-center justify-center text-white shadow-lg`}>
                  <type.icon size={24} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground text-sm font-medium mb-1">{type.subtitle}</p>
                <h3 className="text-2xl font-bold text-foreground mb-3">{type.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">{type.description}</p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {type.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-foreground" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(type.route)}
                  className={`w-full inline-flex items-center justify-center gap-2 ${type.ctaBg} py-3.5 rounded-xl font-semibold transition-all group-hover:shadow-lg`}
                >
                  {type.cta}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}