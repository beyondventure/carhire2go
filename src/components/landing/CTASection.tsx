import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/constants';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-primary via-slate-800 to-slate-900 rounded-3xl p-8 md:p-16 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl" />
          
          {/* Car Icon */}
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
          >
            <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center">
              <Car size={64} className="text-accent/40" />
            </div>
          </motion.div>

          <div className="relative z-10 max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6"
            >
              Ready to experience the future of car hire?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-primary-foreground/60 mb-8"
            >
              Join thousands of satisfied users across Nigeria. Book your first ride in under 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-accent/25 hover:bg-accent/90 transition-colors"
              >
                Get Started Free
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground/10 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
              >
                Sign In
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}