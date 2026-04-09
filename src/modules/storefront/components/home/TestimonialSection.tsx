import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "@phosphor-icons/react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

const testimonials = [
  { quote: "M&H didn't just sell me glasses — they changed how I see the world. The eye exam was thorough, the frames are stunning, and the virtual try-on made choosing so easy.", name: "Chioma Adekunle", location: "Lagos, Nigeria", rating: 5 },
  { quote: "I've never had an eye care experience like this. From the clinical precision of the exam to the luxury of choosing designer frames — it's all under one roof.", name: "Emeka Obi", location: "Abuja, Nigeria", rating: 5 },
  { quote: "The AI styling quiz matched me with the perfect frames in under a minute. I get compliments every day. M&H truly understands modern eyewear.", name: "Amara Nwosu", location: "Port Harcourt, Nigeria", rating: 5 },
];

export const TestimonialSection = () => {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const sectionReveal = useScrollReveal({ threshold: 0.2 });

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((active + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [active, goTo]);

  const t = testimonials[active];

  return (
    <section className="section-cream py-24 lg:py-32">
      <div
        ref={sectionReveal.ref as React.RefObject<HTMLDivElement>}
        className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${sectionReveal.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Header */}
        <p className="text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-3">Eye No Dey Lie</p>
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-ink leading-[0.95] mb-4">
          What they say<span className="text-mh-gold">.</span>
        </h2>

        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} weight="fill" className="w-5 h-5 text-mh-gold animate-glow-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span className="text-sm font-display font-semibold text-ink">5.0</span>
          <span className="text-sm text-ink/40">· 145 Reviews</span>
        </div>

        {/* Featured quote */}
        <div className="relative min-h-[200px] flex flex-col items-center justify-center">
          {/* Big quote mark */}
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[120px] font-display font-bold text-mh-gold/8 leading-none select-none animate-float-gentle">"</span>

          <blockquote
            className={`text-ink/80 text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto mb-8 relative z-10 transition-all duration-300 ${fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
          >
            "{t.quote}"
          </blockquote>

          <div className={`transition-all duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
            <p className="font-display font-bold text-ink text-sm">[{t.name}]</p>
            <p className="text-ink/40 text-xs mt-1">{t.location}</p>
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === active ? "bg-mh-gold w-8" : "bg-ink/15 hover:bg-ink/30"}`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Link */}
        <div className="mt-10">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold tracking-wide uppercase text-mh-gold hover:gap-3 transition-all duration-300"
          >
            See What Our Customers Are Saying
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
