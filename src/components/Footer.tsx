import { Link } from "react-router-dom";
import { FacebookLogo, InstagramLogo, TwitterLogo, Lock, CaretDown, Moon, Sun } from "@phosphor-icons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";

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
        <CaretDown weight="light" className={cn(
          "h-4 w-4 text-muted-foreground lg:hidden transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="lg:!block">
        <ul className="space-y-3 pb-4 lg:pb-0 lg:mt-4">
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is already set
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/">
              <img 
                src={mhLogo} 
                alt="M&H Eyewear" 
                className="h-12 w-auto dark:hidden"
              />
              <img 
                src={mhLogoGold} 
                alt="M&H Eyewear" 
                className="h-12 w-auto hidden dark:block"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium eye care and designer eyewear. See better. Look better.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <FacebookLogo weight="light" className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Instagram"
              >
                <InstagramLogo weight="light" className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <TwitterLogo weight="light" className="h-4 w-4" />
              </a>
            </div>

            {/* Theme Toggle */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {isDark ? (
                  <>
                    <Sun weight="light" className="h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon weight="light" className="h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
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
              <Lock weight="duotone" className="h-4 w-4 text-green-600" />
              <span>We guarantee every transaction is 100% secure</span>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-secondary rounded text-xs font-medium text-foreground">
                Paystack
              </div>
              <div className="px-3 py-1.5 bg-secondary rounded text-xs font-medium text-foreground">
                Visa
              </div>
              <div className="px-3 py-1.5 bg-secondary rounded text-xs font-medium text-foreground">
                Mastercard
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            &copy; {currentYear} M&H Eyewear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
