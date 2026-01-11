import { motion } from 'framer-motion';
import { Car, Clock, MapPin, CreditCard, Shield, Smartphone, Calendar, Users } from 'lucide-react';

const services = [
  {
    icon: Car,
    title: 'Full-Day Hire',
    description: 'Book a vehicle with driver for the entire day. Perfect for business trips or special occasions.',
    color: 'from-accent to-secondary',
  },
  {
    icon: MapPin,
    title: 'Point-to-Point',
    description: 'Quick rides from one location to another. Airport transfers, city commutes, and more.',
    color: 'from-secondary to-accent',
  },
  {
    icon: Calendar,
    title: 'Event Transport',
    description: 'Weddings, conferences, and special events. Multiple vehicles, coordinated service.',
    color: 'from-warning to-orange-500',
  },
  {
    icon: Users,
    title: 'Group Travel',
    description: 'SUVs, vans, and buses for group trips. Family outings, corporate retreats, tours.',
    color: 'from-success to-emerald-500',
  },
];

const features = [
  { icon: Clock, label: '60-Second Matching' },
  { icon: Shield, label: 'Verified Drivers' },
  { icon: CreditCard, label: 'Secure Payments' },
  { icon: Smartphone, label: 'Real-time Tracking' },
];

export function ServicesSection() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Our Services</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Every journey, perfectly planned
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From quick city rides to full-day hires, we've got the perfect solution for your transportation needs.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group bg-card rounded-2xl p-6 border border-border hover:border-accent/30 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                <service.icon size={26} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl p-8 md:p-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                  <feature.icon size={22} className="text-accent" />
                </div>
                <span className="text-primary-foreground font-medium text-sm">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}