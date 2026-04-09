import { useState } from "react";
import { Link } from "react-router-dom";
import { FacebookLogo, InstagramLogo, XLogo, Lock, Envelope, PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/shared/hooks/use-toast";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";

// Payment provider SVG logos
const VisaLogo = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <path d="M19.5 10.5l-2.3 11h-2.8l2.3-11h2.8zm11.8 7.1l1.5-4 .8 4h-2.3zm3.1 3.9h2.6l-2.3-11h-2.4c-.5 0-1 .3-1.2.8l-4.2 10.2h2.9l.6-1.6h3.6l.4 1.6zm-7.6-3.6c0-2.9-4-3.1-4-4.4 0-.4.4-.8 1.2-.9.4 0 1.5-.1 2.8.5l.5-2.3c-.7-.3-1.6-.5-2.7-.5-2.8 0-4.8 1.5-4.8 3.6 0 1.6 1.4 2.4 2.5 3 1.1.5 1.5.9 1.5 1.4 0 .7-.9 1.1-1.7 1.1-1.5 0-2.3-.4-2.9-.7l-.5 2.4c.7.3 1.9.6 3.2.6 3 0 4.9-1.5 4.9-3.8zM14.5 10.5l-4.4 11H7.2l-2.2-8.8c-.1-.5-.2-.7-.6-.9-.6-.3-1.6-.7-2.5-.9l.1-.4h4.5c.6 0 1.1.4 1.2 1l1.1 5.9 2.8-6.9h2.9z" />
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto">
    <circle cx="17" cy="16" r="10" fill="#EB001B" opacity="0.8" />
    <circle cx="31" cy="16" r="10" fill="#F79E1B" opacity="0.8" />
    <path d="M24 8.5a10 10 0 0 0-3.5 7.5 10 10 0 0 0 3.5 7.5 10 10 0 0 0 3.5-7.5 10 10 0 0 0-3.5-7.5z" fill="#FF5F00" opacity="0.9" />
  </svg>
);

const PaystackLogo = () => (
  <svg viewBox="0 0 100 24" className="h-5 w-auto" fill="currentColor">
    <path d="M8 4h84v3H8V4zm0 6.5h68v3H8v-3zM8 17h84v3H8v-3z" />
  </svg>
);

// Newsletter Banner Component
const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email }, { onConflict: "email" });
      
      if (error) throw error;
      
      toast({
        title: "Welcome to the family!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
    } catch {
      toast({
        title: "Couldn't subscribe",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feature-navy py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Text */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Envelope weight="duotone" className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-display font-semibold text-white">
                Stay Updated
              </h3>
              <p className="text-white/60 text-sm">
                Exclusive offers, new arrivals & eye care tips
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-accent focus:ring-accent/20 rounded-lg flex-1 lg:w-72"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-12 px-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium shadow-gold hover:shadow-glow-accent transition-all"
            >
              {isSubmitting ? "..." : (
                <>
                  Subscribe
                  <PaperPlaneTilt weight="bold" className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Footer link columns configuration
const shopLinks = [
  { name: "Eyeglasses", path: "/eyewear?category=eyeglasses" },
  { name: "Sunglasses", path: "/eyewear?category=sunglasses" },
  { name: "Accessories", path: "/eyewear?category=accessories" },
  { name: "Eye Exams", path: "/booking" },
  { name: "New Arrivals", path: "/eyewear?sort=newest" },
];

const supportLinks = [
  { name: "Contact Us", path: "/contact" },
  { name: "FAQs", path: "/faq" },
  { name: "Order Tracking", path: "/track-order" },
  { name: "Shipping & Delivery", path: "/faq" },
  { name: "Returns & Exchanges", path: "/returns" },
];

const companyLinks = [
  { name: "About M&H", path: "/about" },
  { name: "Our Locations", path: "/branches" },
  { name: "Eye Care Services", path: "/eye-care" },
  { name: "Careers", path: "/contact" },
];

// Reusable Link Column Component
const FooterColumn = ({ title, links }: { title: string; links: { name: string; path: string }[] }) => (
  <div>
    <h4 className="font-medium text-foreground mb-4">{title}</h4>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.name}>
          <Link
            to={link.path}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pb-20 lg:pb-0">
      {/* Newsletter Banner */}
      <NewsletterBanner />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={mhLogo} 
                alt="M&H Eyewear" 
                className="h-10 w-auto dark:hidden"
              />
              <img 
                src={mhLogoGold} 
                alt="M&H Eyewear" 
                className="h-10 w-auto hidden dark:block"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Premium eye care and designer eyewear. See better. Look better.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              <a
                href="#"
                className="p-2.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <FacebookLogo weight="fill" className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <InstagramLogo weight="fill" className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <XLogo weight="fill" className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <FooterColumn title="Shop" links={shopLinks} />

          {/* Support Column */}
          <FooterColumn title="Support" links={supportLinks} />

          {/* Company Column */}
          <FooterColumn title="Company" links={companyLinks} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock weight="duotone" className="h-4 w-4 text-green-600" />
              <span>100% secure transactions guaranteed</span>
            </div>

            {/* Payment Logos */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <VisaLogo />
              <MastercardLogo />
              <PaystackLogo />
            </div>
          </div>

          {/* Copyright & Legal */}
          <div className="mt-6 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-muted-foreground">
              © {currentYear} M&H Eyewear. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
