import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import frame1 from "@/assets/frame-1.jpg";

export const HeroSection = () => {
  return (
    <section className="section-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Top tags */}
        <div className="flex items-center gap-6 mb-12">
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-ink/30">
            /Eyewear
          </span>
          <span className="w-px h-4 bg-ink/15" />
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-ink/30">
            /Eye Care
          </span>
        </div>

        {/* Main headline with images inline */}
        <div className="relative">
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

        {/* Bottom bar: stats + CTAs */}
        <div className="mt-16 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
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
