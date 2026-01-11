import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { UserTypesSection } from '@/components/landing/UserTypesSection';
import { VehicleShowcase } from '@/components/landing/VehicleShowcase';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="services">
        <ServicesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <UserTypesSection />
      <div id="fleet">
        <VehicleShowcase />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}