import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/constants';

const footerLinks = {
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  services: [
    { label: 'Book a Ride', href: '/consumer' },
    { label: 'Fleet Owners', href: '/provider' },
    { label: 'Become a Driver', href: '/driver' },
    { label: 'Enterprise', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Safety', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Linkedin, href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                <Car size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold">{PLATFORM_NAME}</span>
            </div>
            <p className="text-primary-foreground/60 mb-6 max-w-sm">
              Nigeria's premier car hire aggregation platform. Connecting riders with verified drivers since 2024.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <Mail size={16} className="text-accent" />
                <span>support@carhire2go.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <Phone size={16} className="text-accent" />
                <span>+234 800 CAR HIRE</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <MapPin size={16} className="text-accent" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2026 {PLATFORM_NAME}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
              >
                <social.icon size={18} className="text-primary-foreground/60" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}