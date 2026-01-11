import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import avatarAdebayo from '@/assets/avatar-adebayo.jpg';
import avatarChioma from '@/assets/avatar-chioma.jpg';
import avatarIbrahim from '@/assets/avatar-ibrahim.jpg';

const testimonials = [
  {
    name: 'Adebayo Ogundimu',
    role: 'Business Executive',
    avatar: avatarAdebayo,
    content: 'The best car hire experience I\'ve had in Nigeria. Professional drivers, clean vehicles, and the price negotiation feature is a game-changer.',
    rating: 5,
  },
  {
    name: 'Chioma Nwosu',
    role: 'Event Planner',
    avatar: avatarChioma,
    content: 'I use CarHire2Go for all my event transportation needs. The fleet management and coordination is impeccable. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Ibrahim Musa',
    role: 'Fleet Owner',
    avatar: avatarIbrahim,
    content: 'As a provider, this platform has transformed my business. The driver management tools and automated settlements save me hours every week.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Loved by thousands
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-card rounded-2xl p-6 border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Quote size={18} className="text-accent" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-warning fill-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}