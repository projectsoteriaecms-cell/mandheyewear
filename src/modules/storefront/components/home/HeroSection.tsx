import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Tag } from "@phosphor-icons/react";
import { useCountUp } from "@/shared/hooks/useCountUp";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

export const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const stat1 = useCountUp({ end: 50, suffix: "K+" });
  const stat2 = useCountUp({ end: 5, suffix: "+" });
  const stat3 = useCountUp({ end: 2800, suffix: "+" });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="section-ink-grain relative overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background breathing glows — warm gold light leaks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-mh-gold/8 blur-[120px] transition-all duration-[2000ms] ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        />
        <div
          className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-mh-gold/5 blur-[100px] animate-breathe transition-all duration-[2000ms] ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "2s", transitionDelay: "300ms" }}
        />
        <div
          className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-flame/5 blur-[100px] animate-breathe transition-all duration-[2000ms] ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "4s", transitionDelay: "600ms" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 w-full">
        {/* Top tags — slide in from left */}
        <div
          className={`flex items-center gap-6 mb-10 transition-all duration-700 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-cream/30">/Eyewear</span>
          <span className="w-px h-4 bg-cream/15" />
          <span className="font-display font-bold text-xs tracking-[0.3em] uppercase text-cream/30">/Eye Care</span>
        </div>

        {/* Giant typographic headline — clipPath mask reveal per word */}
        <div className="relative mb-12">
          <h1 className="font-display font-extrabold text-[clamp(3rem,9vw,8rem)] leading-[0.88] tracking-tight text-cream">
            {["A", "clearer", "IMG1"].map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden"
              >
                <span
                  className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{
                    transitionDelay: `${400 + i * 120}ms`,
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {word === "IMG1" ? (
                    <span className="relative inline-block align-middle mx-2">
                      <img
                        src={heroEyewear}
                        alt="Outlook"
                        className={`inline-block w-[1.6em] h-[0.7em] object-cover rounded-full border-2 border-mh-gold/20 shadow-lg transition-all duration-[900ms] ${loaded ? "blur-0 scale-100" : "blur-lg scale-105"}`}
                        style={{ transitionDelay: "1000ms" }}
                      />
                    </span>
                  ) : (
                    <>{word} </>
                  )}
                </span>
              </span>
            ))}
            <br />
            {["outlook", "IMG2", "on", "life"].map((word, i) => (
              <span
                key={`b-${i}`}
                className="inline-block overflow-hidden"
              >
                <span
                  className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{
                    transitionDelay: `${760 + i * 120}ms`,
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {word === "IMG2" ? (
                    <span className="relative inline-block align-middle mx-2">
                      <img
                        src={frame1}
                        alt="Life"
                        className={`inline-block w-[1.4em] h-[0.7em] object-cover rounded-full border-2 border-mh-gold/20 shadow-lg transition-all duration-[900ms] ${loaded ? "blur-0 scale-100" : "blur-lg scale-105"}`}
                        style={{ transitionDelay: "1100ms" }}
                      />
                    </span>
                  ) : word === "life" ? (
                    <span className="italic font-semibold text-cream/60">{word}<span className="text-mh-gold">.</span></span>
                  ) : (
                    <>{word} </>
                  )}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Promo banner with shimmer — slides up with spring bounce */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-ink-light mb-12 border border-cream/5 transition-all duration-[900ms] ${loaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.95]"}`}
          style={{
            transitionDelay: "1200ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-cream/5 to-transparent" style={{ animationDelay: "1.8s" }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] items-center min-h-[200px] lg:min-h-[240px]">
            <div className="p-8 lg:p-10 space-y-3">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-cream leading-[1.05] uppercase">
                New Season<br />
                <span className="text-mh-gold">Collection</span>
              </h2>
              <div className="inline-block px-4 py-1.5 border-2 border-dashed border-mh-gold/50 rounded-lg">
                <span className="font-display font-bold text-sm text-mh-gold tracking-wide">April 2026 Drop</span>
              </div>
            </div>

            <div className="px-8 lg:px-4 pb-6 lg:pb-0 space-y-3">
              <p className="text-cream/70 text-lg font-body">Every frame you love</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-cream rounded-full">
                <Tag weight="fill" className="w-5 h-5 text-flame" />
                <span className="font-display font-extrabold text-ink text-sm uppercase tracking-wider">Up to</span>
                <span className="font-display font-extrabold text-flame text-3xl">20% OFF</span>
              </div>
              <p className="text-cream/40 text-xs">T&Cs apply</p>
            </div>

            <div className="hidden lg:flex items-end justify-center px-6 pb-0 relative h-full">
              <div className="relative w-[260px] h-[220px]">
                <div className="absolute inset-0 bg-gradient-to-t from-mh-gold/20 to-transparent rounded-t-3xl" />
                <img src={frame2} alt="Frame" className="absolute bottom-0 left-0 w-28 h-28 object-cover rounded-xl shadow-lg border-2 border-mh-gold/15 rotate-[-6deg] animate-float-slow" />
                <img src={frame3} alt="Frame" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 object-cover rounded-xl shadow-xl border-2 border-mh-gold/15 z-10 animate-float-gentle" />
                <img src={frame4} alt="Frame" className="absolute bottom-0 right-0 w-28 h-28 object-cover rounded-xl shadow-lg border-2 border-mh-gold/15 rotate-[6deg] animate-float" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Subtext + Stats + CTAs — 3D tilt-in entrance */}
        <div
          className={`flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 transition-all duration-[800ms] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          style={{
            transitionDelay: "1500ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transform: loaded ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(8deg)",
          }}
        >
          <div className="max-w-md space-y-6">
            <p className="text-cream/80 text-xl leading-relaxed font-display font-semibold">
              For those who see the future before it arrives.<br />
              <span className="text-cream/50 font-body font-normal text-lg">Clarity without compromise — your world, in high definition.</span>
            </p>
            <p className="text-cream/30 text-sm leading-relaxed font-body">
              A new frame of mind. Because your outlook should be as loud as your ambition, but as silent as true luxury.
            </p>
            <div className="flex items-center gap-8" ref={statsRef}>
              <div>
                <p className="font-display font-extrabold text-2xl text-cream" ref={stat1.ref as React.RefObject<HTMLParagraphElement>}>{stat1.displayValue}</p>
                <p className="text-xs text-cream/40 uppercase tracking-wider font-display">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-cream/10" />
              <div>
                <p className="font-display font-extrabold text-2xl text-cream" ref={stat2.ref as React.RefObject<HTMLParagraphElement>}>{stat2.displayValue}</p>
                <p className="text-xs text-cream/40 uppercase tracking-wider font-display">Locations</p>
              </div>
              <div className="w-px h-10 bg-cream/10" />
              <div>
                <p className="font-display font-extrabold text-2xl text-cream" ref={stat3.ref as React.RefObject<HTMLParagraphElement>}>{stat3.displayValue}</p>
                <p className="text-xs text-cream/40 uppercase tracking-wider font-display">Frames</p>
              </div>
            </div>
          </div>

          {/* CTAs — elastic-in stagger */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/eyewear"
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase hover:scale-105 hover:shadow-glow-accent transition-all duration-300 shadow-gold ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                transitionDelay: "1800ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Shop Collection
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/booking"
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-flame text-cream font-display font-bold text-sm tracking-wide uppercase hover:scale-105 transition-all duration-300 shadow-flame ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                transitionDelay: "1950ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Book Eye Exam
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "2200ms" }}
      >
        <span className="text-xs font-display tracking-[0.2em] uppercase text-cream/30">Scroll</span>
        <ArrowDown weight="bold" className="w-4 h-4 text-cream/30 animate-float-gentle" />
      </div>
    </section>
  );
};
