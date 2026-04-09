import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkle, 
  Bag, 
  ArrowRight, 
  Eye, 
  Calendar,
  Circle 
} from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";
import { cn } from "@/lib/utils";

// Slide data structure - M&H Eyewear focused
const slides = [
  {
    id: 1,
    type: "eyewear" as const,
    image: heroEyewear,
    badge: "M&H Eyewear",
    badgeIcon: Sparkle,
    headline: "Transforming vision with",
    subheadline: "clarity & confidence",
    description: "Not just eyewear — a unique blend of elegance, cutting-edge tech, and affordability that defines your style.",
    primaryCTA: { text: "Find Your Frame", link: "/style-quiz", icon: Sparkle },
    secondaryCTA: { text: "Shop Collection", link: "/eyewear", icon: Bag },
    accentColor: "accent",
    trustIndicators: [
      { icon: "✓", label: "Free Eye Exams", sublabel: "At all locations" },
      { icon: "📷", label: "Virtual Try-On", sublabel: "AI-powered" },
      { icon: "🚚", label: "Free Shipping", sublabel: "Orders over ₦50k" },
    ],
  },
  {
    id: 2,
    type: "clinic" as const,
    image: heroEyeCare,
    badge: "M&H Eye Care",
    badgeIcon: Eye,
    headline: "Your path to clearer vision",
    subheadline: "begins with us",
    description: "Comprehensive eye exams, advanced diagnostics, and personalized care from Nigeria's trusted eye care specialists.",
    primaryCTA: { text: "Book Eye Exam", link: "/booking", icon: Calendar },
    secondaryCTA: { text: "Our Services", link: "/eye-care", icon: Eye },
    accentColor: "primary",
    trustIndicators: [
      { icon: "✓", label: "Certified Optometrists", sublabel: "Board certified" },
      { icon: "🏥", label: "5+ Locations", sublabel: "Across Nigeria" },
      { icon: "⏰", label: "Same Day Exams", sublabel: "Walk-ins welcome" },
    ],
  },
];

export const HeroSection = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoplayRef = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [autoplayRef.current]
  );

  const currentSlide = slides[selectedIndex];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIsAnimating(true);
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setTimeout(() => setIsAnimating(false), 700);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Dot indicators component
  const DotIndicators = ({ className, variant = "mobile" }: { className?: string; variant?: "mobile" | "desktop" }) => (
    <div className={cn("flex justify-center gap-3", className)}>
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => scrollTo(index)}
          className={cn(
            "transition-all duration-500",
            variant === "mobile" && (
              selectedIndex === index 
                ? "scale-100" 
                : "scale-75 opacity-50 hover:opacity-75"
            ),
            variant === "desktop" && "group"
          )}
          aria-label={`Go to slide ${index + 1}`}
        >
          {variant === "mobile" ? (
            <Circle 
              weight={selectedIndex === index ? "fill" : "regular"} 
              className={cn(
                "h-3 w-3 transition-all duration-300",
                selectedIndex === index ? "text-mh-gold" : "text-cream/40"
              )}
            />
          ) : (
            <span className={cn(
              "block rounded-full transition-all duration-500",
              selectedIndex === index 
                ? "bg-mh-gold w-8 h-2"
                : "bg-cream/30 hover:bg-cream/50 w-2 h-2"
            )} />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-ink">
      {/* Animated background orbs - Gold/Flame glows */}
      <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-mh-gold/8 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full bg-flame/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 lg:py-28">
          {/* Content */}
          <div className="space-y-10 order-2 lg:order-1">
            {/* Tagline badge */}
            <div 
              key={`badge-${currentSlide.id}`}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium",
                isAnimating ? "animate-slide-up-spring" : "",
                "bg-mh-gold/10 border-mh-gold/20 text-mh-gold"
              )}
            >
              <currentSlide.badgeIcon weight="duotone" className="h-4 w-4" />
              {currentSlide.badge}
            </div>

            <div key={`headline-${currentSlide.id}`} className="space-y-6">
              <h1 className={cn(
                "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-semibold text-cream leading-[1.1] tracking-tight",
                isAnimating ? "animate-slide-up-spring" : ""
              )} style={{ animationDelay: '0.1s' }}>
                {currentSlide.headline}{" "}
                <span className="relative inline-block text-mh-gold">
                  {currentSlide.subheadline}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-mh-gold/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0 9c50-6 100-6 200 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p 
                className={cn(
                  "text-lg sm:text-xl text-cream/60 max-w-lg leading-relaxed",
                  isAnimating ? "animate-slide-up-spring" : ""
                )}
                style={{ animationDelay: '0.2s' }}
              >
                {currentSlide.description}
              </p>
            </div>

            <div 
              key={`cta-${currentSlide.id}`}
              className={cn(
                "flex flex-col sm:flex-row gap-4",
                isAnimating ? "animate-slide-up-spring" : ""
              )}
              style={{ animationDelay: '0.3s' }}
            >
              <Button 
                size="lg" 
                asChild 
                className="group h-14 px-8 text-base shadow-float hover:shadow-card-hover transition-all relative overflow-hidden hover:scale-105 bg-mh-gold text-ink hover:bg-mh-gold/90"
              >
                <Link to={currentSlide.primaryCTA.link} className="flex items-center gap-3">
                  <span className="absolute inset-0 shimmer-bg" />
                  <currentSlide.primaryCTA.icon weight="duotone" className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">{currentSlide.primaryCTA.text}</span>
                  <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base border-2 border-cream/20 text-cream hover:bg-cream/10 transition-all hover:scale-105">
                <Link to={currentSlide.secondaryCTA.link} className="flex items-center gap-3">
                  <currentSlide.secondaryCTA.icon weight="light" className="h-5 w-5" />
                  {currentSlide.secondaryCTA.text}
                </Link>
              </Button>
            </div>

            {/* Mobile/Tablet Hero Image Carousel */}
            <div className="lg:hidden mt-8">
              <div ref={emblaRef} className="overflow-hidden rounded-2xl shadow-float">
                <div className="flex">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
                      <img
                        src={slide.image}
                        alt={slide.badge}
                        className={cn(
                          "w-full h-[280px] sm:h-[350px] object-cover transition-transform duration-[6000ms] ease-out",
                          selectedIndex === index && "scale-105"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
              <DotIndicators className="mt-4" variant="mobile" />
            </div>

            {/* Trust indicators */}
            <div 
              key={`trust-${currentSlide.id}`}
              className={cn(
                "flex flex-wrap items-center gap-8 pt-6 border-t border-cream/10",
                isAnimating ? "animate-slide-up-spring" : ""
              )}
              style={{ animationDelay: '0.4s' }}
            >
              {currentSlide.trustIndicators.map((indicator, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 hover-lift cursor-default group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-mh-gold/10">
                    <span className="text-lg text-mh-gold">{indicator.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-cream text-sm">{indicator.label}</p>
                    <p className="text-xs text-cream/50">{indicator.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image Carousel - Desktop */}
          <div className="relative hidden lg:block order-1 lg:order-2 perspective-1500">
            <div className="relative rounded-3xl overflow-hidden shadow-float">
              <div className="relative">
                {slides.map((slide, index) => (
                  <img
                    key={slide.id}
                    src={slide.image}
                    alt={slide.badge}
                    className={cn(
                      "w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover absolute inset-0 transition-all duration-1000",
                      selectedIndex === index 
                        ? "opacity-100 scale-105 animate-ken-burns" 
                        : "opacity-0 scale-100",
                      index === 0 && "relative"
                    )}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none" />
              <DotIndicators 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20" 
                variant="desktop" 
              />
            </div>
            
            {/* Floating testimonial card - eyewear slide */}
            <div 
              className={cn(
                "absolute -bottom-6 -left-6 glass-dark p-5 rounded-2xl shadow-float border border-cream/10 max-w-[280px] transition-all duration-700",
                selectedIndex === 0 ? "opacity-100 animate-float translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mh-gold to-mh-gold/70 flex items-center justify-center text-ink font-bold text-lg shrink-0 animate-pulse-soft">
                  50K+
                </div>
                <div>
                  <p className="font-semibold text-cream">Happy Customers</p>
                  <p className="text-sm text-cream/50 mt-0.5">Trusted across Nigeria for quality eyewear</p>
                </div>
              </div>
            </div>

            {/* Floating testimonial card - clinic slide */}
            <div 
              className={cn(
                "absolute -bottom-6 -left-6 glass-dark p-5 rounded-2xl shadow-float border border-cream/10 max-w-[280px] transition-all duration-700",
                selectedIndex === 1 ? "opacity-100 animate-float translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mh-gold to-mh-gold/70 flex items-center justify-center text-ink font-bold text-lg shrink-0 animate-pulse-soft">
                  10K+
                </div>
                <div>
                  <p className="font-semibold text-cream">Eye Exams Completed</p>
                  <p className="text-sm text-cream/50 mt-0.5">Trusted care for clearer vision</p>
                </div>
              </div>
            </div>

            {/* Floating product card - top right (eyewear slide) */}
            <div 
              className={cn(
                "absolute -top-4 -right-4 glass-dark p-4 rounded-2xl shadow-float border border-cream/10 transition-all duration-700",
                selectedIndex === 0 ? "opacity-100 animate-float-slow translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
              )}
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-cream/10 flex items-center justify-center text-2xl">
                  👓
                </div>
                <div>
                  <p className="text-xs text-cream/50">New Arrival</p>
                  <p className="font-semibold text-cream">Classic Aviator</p>
                  <p className="text-sm font-bold text-mh-gold">₦45,000</p>
                </div>
              </div>
            </div>

            {/* Floating product card - top right (clinic slide) */}
            <div 
              className={cn(
                "absolute -top-4 -right-4 glass-dark p-4 rounded-2xl shadow-float border border-cream/10 transition-all duration-700",
                selectedIndex === 1 ? "opacity-100 animate-float-slow translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
              )}
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-mh-gold/10 flex items-center justify-center text-2xl">
                  👁️
                </div>
                <div>
                  <p className="text-xs text-cream/50">Book Now</p>
                  <p className="font-semibold text-cream">Eye Exam</p>
                  <p className="text-sm font-bold text-mh-gold">Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
