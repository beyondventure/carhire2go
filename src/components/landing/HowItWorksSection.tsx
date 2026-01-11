import { motion } from 'framer-motion';
import { Search, Users, MessageSquare, Car } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search & Book',
    description: 'Enter your pickup, destination, and preferred vehicle type. Get instant quotes from verified providers.',
  },
  {
    number: '02',
    icon: Users,
    title: 'Match with Driver',
    description: 'Our smart system matches you with the best available driver within 60 seconds.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Negotiate & Confirm',
    description: 'Chat directly with providers, negotiate prices, and confirm your booking securely.',
  },
  {
    number: '04',
    icon: Car,
    title: 'Travel & Rate',
    description: 'Track your ride in real-time, travel safely, and rate your experience.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Book in 4 simple steps
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Step Number */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center">
                <span className="text-accent font-bold text-xl">{step.number}</span>
                {/* Pulse Effect */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className="absolute inset-0 rounded-2xl bg-accent/20"
                />
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                  <step.icon size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}