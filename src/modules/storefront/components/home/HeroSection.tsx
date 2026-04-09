import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "@phosphor-icons/react";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

export const HeroSection = () => {
  return (
    <section className="section-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Top tags */}
        <div className="flex items-center gap-6 mb-10">
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-ink/30">
            /Eyewear
          </span>
          <span className="w-px h-4 bg-ink/15" />
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-ink/30">
            /Eye Care
          </span>
        </div>

        {/* Main headline with images inline */}
        <div className="relative mb-12">
          <h1 className="font-display font-extrabold text-[clamp(2.5rem,8vw,7rem)] leading-[0.92] tracking-tight text-ink">
            <span className="block">
              where{" "}
              <span className="relative inline-block align-middle mx-2">
                <img
                  src={heroEyewear}
                  alt="Vision"
                  className="inline-block w-[1.6em] h-[0.7em] object-cover rounded-full"
                />
              </span>{" "}
              vision
            </span>
            <span className="block mt-2">
              lives{" "}
              <span className="text-mh-gold">—</span>{" "}
              <span className="relative inline-block align-middle mx-2">
                <img
                  src={frame1}
                  alt="Now"
                  className="inline-block w-[1.4em] h-[0.7em] object-cover rounded-full"
                />
              </span>{" "}
              <span className="italic font-semibold text-ink/70">now</span>
            </span>
          </h1>
        </div>

        {/* Jumia-inspired Promotional Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-ink mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] items-center min-h-[200px] lg:min-h-[240px]">
            {/* Left: Promo text */}
            <div className="p-8 lg:p-10 space-y-3">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-cream leading-[1.05] uppercase">
                New Season<br />
                <span className="text-mh-gold">Collection</span>
              </h2>
              <div className="inline-block px-4 py-1.5 border-2 border-dashed border-mh-gold/50 rounded-lg">
                <span className="font-display font-bold text-sm text-mh-gold tracking-wide">
                  April 2026 Drop
                </span>
              </div>
            </div>

            {/* Center: Discount callout */}
            <div className="px-8 lg:px-4 pb-6 lg:pb-0 space-y-3">
              <p className="text-cream/70 text-lg font-body">
                Every frame you love
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-cream rounded-full">
                <Tag weight="fill" className="w-5 h-5 text-flame" />
                <span className="font-display font-extrabold text-ink text-sm uppercase tracking-wider">Up to</span>
                <span className="font-display font-extrabold text-flame text-3xl">20% OFF</span>
              </div>
              <p className="text-cream/40 text-xs">T&Cs apply</p>
            </div>

            {/* Right: Product images stack */}
            <div className="hidden lg:flex items-end justify-center px-6 pb-0 relative h-full">
              <div className="relative w-[260px] h-[220px]">
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-t from-mh-gold/20 to-transparent rounded-t-3xl" />
                
                {/* Stacked product images */}
                <img
                  src={frame2}
                  alt="Frame"
                  className="absolute bottom-0 left-0 w-28 h-28 object-cover rounded-xl shadow-lg border-2 border-cream/10 rotate-[-6deg]"
                />
                <img
                  src={frame3}
                  alt="Frame"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 object-cover rounded-xl shadow-xl border-2 border-cream/10 z-10"
                />
                <img
                  src={frame4}
                  alt="Frame"
                  className="absolute bottom-0 right-0 w-28 h-28 object-cover rounded-xl shadow-lg border-2 border-cream/10 rotate-[6deg]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar: stats + CTAs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          {/* Description + stats */}
          <div className="max-w-md space-y-6">
            <p className="text-ink/50 text-lg leading-relaxed">
              Not just eyewear — a unique blend of clinical precision and luxury fashion. 
              Find frames that feel like you.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <p className="font-display font-extrabold text-2xl text-ink">50K+</p>
                <p className="text-xs text-ink/40 uppercase tracking-wider font-display">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-ink/10" />
              <div>
                <p className="font-display font-extrabold text-2xl text-ink">5+</p>
                <p className="text-xs text-ink/40 uppercase tracking-wider font-display">Locations</p>
              </div>
              <div className="w-px h-10 bg-ink/10" />
              <div>
                <p className="font-display font-extrabold text-2xl text-ink">2,800+</p>
                <p className="text-xs text-ink/40 uppercase tracking-wider font-display">Frames</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/eyewear"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase hover:scale-105 transition-all duration-300 shadow-gold"
            >
              Shop Collection
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/booking"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-flame text-cream font-display font-bold text-sm tracking-wide uppercase hover:scale-105 transition-all duration-300 shadow-flame"
            >
              Book Eye Exam
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
