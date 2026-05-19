import { Link } from "react-router-dom";
import { Eyeglasses, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";

export const PartnershipBanner = () => {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center p-3 shrink-0">
            <img src={mhLogo} alt="M&H Eyewear" className="w-full h-full object-contain dark:hidden" />
            <img src={mhLogoGold} alt="M&H Eyewear" className="w-full h-full object-contain hidden dark:block" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Eyeglasses weight="duotone" className="h-5 w-5 text-accent" />
              <p className="text-accent font-medium text-sm uppercase tracking-widest">Premium Eyewear Partner</p>
            </div>
            <h3 className="text-2xl font-display font-semibold text-foreground">
              Designer Frames by M&H Eyewear
            </h3>
            <p className="text-muted-foreground max-w-xl">
              Our strategic partner M&H Eyewear offers a curated collection of designer frames and fashion eyewear. 
              Get your prescription from Soteria, then find your perfect frames.
            </p>
          </div>

          {/* CTA */}
          <Button variant="outline" size="lg" asChild className="shrink-0 border-accent text-accent hover:bg-accent/10">
            <a href="https://www.mandheyewear.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              Visit M&H Eyewear
              <ArrowRight weight="bold" className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
