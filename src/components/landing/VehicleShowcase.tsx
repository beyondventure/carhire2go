import { motion } from 'framer-motion';
import { Users, Fuel, Settings, Star } from 'lucide-react';

const vehicles = [
  {
    type: 'Sedan',
    name: 'Toyota Camry',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    seats: 4,
    priceRange: '₦25,000 - ₦40,000',
    rating: 4.8,
    features: ['AC', 'Comfortable', 'Fuel Efficient'],
  },
  {
    type: 'SUV',
    name: 'Toyota Highlander',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80',
    seats: 7,
    priceRange: '₦45,000 - ₦65,000',
    rating: 4.9,
    features: ['Spacious', 'AC', 'Premium'],
  },
  {
    type: 'Luxury',
    name: 'Mercedes E-Class',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
    seats: 4,
    priceRange: '₦80,000 - ₦120,000',
    rating: 5.0,
    features: ['Executive', 'Premium', 'Chauffeur'],
  },
  {
    type: 'Van',
    name: 'Toyota Hiace',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
    seats: 14,
    priceRange: '₦60,000 - ₦90,000',
    rating: 4.7,
    features: ['Group Travel', 'AC', 'Luggage Space'],
  },
];

export function VehicleShowcase() {
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Our Fleet</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            Premium vehicles for every need
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
            From compact sedans to luxury vehicles and spacious vans, find the perfect ride for your journey.
          </p>
        </motion.div>

        {/* Vehicle Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-primary-foreground/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary-foreground/10 hover:border-accent/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <motion.img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Star size={12} className="text-warning fill-warning" />
                  <span className="text-xs font-semibold">{vehicle.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-accent text-xs font-semibold">{vehicle.type}</span>
                <h3 className="text-lg font-semibold mt-1 mb-3">{vehicle.name}</h3>

                <div className="flex items-center gap-4 text-sm text-primary-foreground/60 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{vehicle.seats} seats</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.features.slice(0, 2).map((feature) => (
                    <span key={feature} className="text-xs bg-primary-foreground/10 px-2 py-1 rounded-md">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-primary-foreground/10">
                  <span className="text-xs text-primary-foreground/50">Daily rate from</span>
                  <p className="text-accent font-semibold">{vehicle.priceRange}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}