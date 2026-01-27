import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Lock, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

const footerSections = [
  {
    title: "Talk to us",
    links: [
      { name: "Contact Support", path: "/contact" },
      { name: "Find a Store", path: "/branches" },
      { name: "Call: 08063363506", path: "tel:08063363506" },
      { name: "Email Us", path: "mailto:info@soteriaeyeclinic.com" },
    ],
  },
  {
    title: "How can we help?",
    links: [
      { name: "FAQs", path: "/faq" },
      { name: "Order Tracking", path: "/track-order" },
      { name: "Shipping Info", path: "/faq" },
      { name: "Returns & Exchanges", path: "/returns" },
    ],
  },
  {
    title: "Privacy and Terms",
    links: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/privacy" },
    ],
  },
];

const FooterSection = ({ title, links }: { title: string; links: { name: string; path: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border lg:border-0">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 lg:py-0 lg:pointer-events-none">
        <span className="font-medium text-foreground">{title}</span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground lg:hidden transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="lg:!block">
        <ul className="space-y-2 pb-4 lg:pb-0 lg:mt-4">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-primary">SOTERIA</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-xl font-display font-bold text-accent">M&H</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium eye care and designer eyewear. See better. Look better.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Footer Sections - Collapsible on Mobile */}
          {footerSections.map((section) => (
            <FooterSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>We guarantee every transaction is 100% secure</span>
            </div>

            {/* Payment Icons Placeholder */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                Paystack
              </div>
              <div className="px-3 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                Visa
              </div>
              <div className="px-3 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                Mastercard
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            &copy; {currentYear} Soteria Eye Clinic & M&H Eyewear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
