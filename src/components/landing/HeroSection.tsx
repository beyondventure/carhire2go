import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/constants';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }} />
        </div>
      </div>

      {/* Car Silhouette */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute right-0 bottom-0 w-[60%] h-[50%] hidden lg:block"
      >
        <svg viewBox="0 0 800 400" fill="none" className="w-full h-full">
          <path 
            d="M50 300 L100 300 L120 260 L180 240 L280 240 L340 200 L500 200 L560 220 L650 220 L700 260 L750 260 L780 300 L800 300" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-accent/30"
            fill="none"
          />
          <ellipse cx="180" cy="310" rx="45" ry="45" className="fill-accent/10 stroke-accent/30" strokeWidth="2" />
          <ellipse cx="620" cy="310" rx="45" ry="45" className="fill-accent/10 stroke-accent/30" strokeWidth="2" />
          <path 
            d="M340 200 L380 160 L480 160 L500 200" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-accent/20"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Nigeria's #1 Car Hire Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Move with{' '}
            <span className="text-zinc-400">
              confidence
            </span>
            , arrive in style
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-xl"
          >
            Connect with verified drivers and premium vehicles. Book instantly, negotiate prices, and travel safely across Nigeria.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth/register')}
              className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-zinc-100 transition-colors"
            >
              Get Started
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-8 md:gap-12 mt-16 pt-8 border-t border-white/10"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500+', label: 'Verified Drivers' },
              { value: '5+', label: 'Cities Covered' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}