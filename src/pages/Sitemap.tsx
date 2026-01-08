import { Link } from "react-router-dom";
import { Home, Car, Building2, User, Shield, MapPin, CreditCard, Settings, BarChart3, Users, Truck, CheckCircle, FileText } from "lucide-react";

const sections = [
  {
    title: "Landing",
    icon: Home,
    links: [
      { path: "/", label: "Home" },
      { path: "/sitemap", label: "Sitemap" },
    ]
  },
  {
    title: "Consumer",
    icon: User,
    links: [
      { path: "/consumer", label: "Dashboard" },
      { path: "/consumer/book", label: "Book a Ride" },
      { path: "/consumer/bookings", label: "My Bookings" },
      { path: "/consumer/payments", label: "Payments" },
      { path: "/consumer/profile", label: "Profile" },
    ]
  },
  {
    title: "Provider",
    icon: Building2,
    links: [
      { path: "/provider", label: "Dashboard" },
      { path: "/provider/requests", label: "Requests" },
      { path: "/provider/fleet", label: "Fleet" },
      { path: "/provider/drivers", label: "Drivers" },
      { path: "/provider/earnings", label: "Earnings" },
      { path: "/provider/settings", label: "Settings" },
    ]
  },
  {
    title: "Driver",
    icon: Car,
    links: [
      { path: "/driver", label: "Dashboard" },
      { path: "/driver/trip", label: "Current Trip" },
      { path: "/driver/trips", label: "Trip History" },
      { path: "/driver/earnings", label: "Earnings" },
      { path: "/driver/profile", label: "Profile" },
    ]
  },
  {
    title: "Admin",
    icon: Shield,
    links: [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/bookings", label: "Bookings" },
      { path: "/admin/providers", label: "Providers" },
      { path: "/admin/consumers", label: "Consumers" },
      { path: "/admin/settlements", label: "Settlements" },
      { path: "/admin/analytics", label: "Analytics" },
      { path: "/admin/verification", label: "Verification" },
      { path: "/admin/settings", label: "Settings" },
    ]
  },
];

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">CarHire2Go Sitemap</h1>
        <p className="text-muted-foreground mb-8">All pages in the application</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
