import { Link } from "react-router-dom";
import { Star, ArrowRight } from "@phosphor-icons/react";

const testimonials = [
  {
    quote: "M&H didn't just sell me glasses — they changed how I see the world. The eye exam was thorough, the frames are stunning, and the virtual try-on made choosing so easy.",
    name: "Chioma Adekunle",
    location: "Lagos, Nigeria",
    rating: 5,
  },
  {
    quote: "I've never had an eye care experience like this. From the clinical precision of the exam to the luxury of choosing designer frames — it's all under one roof.",
    name: "Emeka Obi",
    location: "Abuja, Nigeria",
    rating: 5,
  },
  {
    quote: "The AI styling quiz matched me with the perfect frames in under a minute. I get compliments every day. M&H truly understands modern eyewear.",
    name: "Amara Nwosu",
    location: "Port Harcourt, Nigeria",
    rating: 5,
  },
];

export const TestimonialSection = () => {
  return (
    <section className="section-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-ink leading-[0.95]">
              What they say<span className="text-mh-gold">.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} weight="fill" className="w-5 h-5 text-mh-gold" />
              ))}
            </div>
            <span className="text-sm font-display font-semibold text-ink">
              5.0
            </span>
            <span className="text-sm text-ink/40">
              · 145 Reviews
            </span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl border border-ink/8 bg-cream-dark/30 hover:border-mh-gold/20 transition-all duration-500 group"
            >
              {/* Quote mark */}
              <span className="absolute top-6 right-8 text-6xl font-display font-bold text-mh-gold/10 leading-none select-none">
                "
              </span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} weight="fill" className="w-4 h-4 text-mh-gold" />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-ink/80 text-base leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-ink/8 pt-5">
                <p className="font-display font-bold text-ink text-sm">
                  [{t.name}]
                </p>
                <p className="text-ink/40 text-xs mt-1">
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* See all link */}
        <div className="text-center mt-12">
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
