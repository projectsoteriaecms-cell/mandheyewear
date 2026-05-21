import { motion, useReducedMotion } from "framer-motion";
import { Check, Star, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: "₦15,000",
    period: "/ visit",
    description: "Essential eye care for routine check-ups and prescriptions.",
    icon: <Star className="w-5 h-5" />,
    features: [
      "Comprehensive eye examination",
      "Basic prescription assessment",
      "1 follow-up visit included",
      "Online appointment booking",
      "Digital prescription record",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₦35,000",
    period: "/ month",
    description: "Complete care for individuals who value proactive eye health.",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "Everything in Basic",
      "Contact lens fitting & trial",
      "Digital eye strain assessment",
      "3 follow-up visits included",
      "Priority appointment booking",
      "Specialist referral support",
    ],
    cta: "Get Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦75,000",
    period: "/ month",
    description: "Concierge-level eye care with advanced diagnostics and unlimited access.",
    icon: <Crown className="w-5 h-5" />,
    features: [
      "Everything in Pro",
      "OCT & Visual Field analysis",
      "Unlimited follow-up visits",
      "Dedicated specialist access",
      "Annual eye wellness report",
      "Home visit option",
    ],
    cta: "Go Premium",
    highlighted: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const featureVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

export function PricingCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative py-20 px-4 bg-[#0A0E1A] overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#0891B2]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#22D3EE]/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[#22D3EE] text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Care Plans
          </motion.p>
          <motion.h2
            id="pricing-heading"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Choose Your Eye Care Plan
          </motion.h2>
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="mt-4 text-slate-400 max-w-xl mx-auto text-base leading-relaxed"
          >
            Expert eye care tailored to your lifestyle. All plans include access
            to our certified optometrists and state-of-the-art equipment.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              custom={i}
              variants={shouldReduceMotion ? undefined : cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }
              }
              className={[
                "relative flex flex-col rounded-2xl p-7 cursor-pointer",
                "border transition-all duration-300",
                "backdrop-blur-xl",
                tier.highlighted
                  ? "bg-white/[0.08] border-[#0891B2]/60 shadow-[0_0_40px_0_rgba(8,145,178,0.18)]"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.06]",
              ].join(" ")}
              role="article"
              aria-label={`${tier.name} plan`}
            >
              {/* Most Popular badge */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#0891B2] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-[#0891B2]/30 border-0">
                    {tier.badge}
                  </Badge>
                </div>
              )}

              {/* Tier icon + name */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={[
                    "flex items-center justify-center w-9 h-9 rounded-xl",
                    tier.highlighted
                      ? "bg-[#0891B2]/20 text-[#22D3EE]"
                      : "bg-white/8 text-slate-400",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {tier.icon}
                </span>
                <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span
                    className={[
                      "text-4xl font-bold tracking-tight",
                      tier.highlighted ? "text-white" : "text-slate-200",
                    ].join(" ")}
                  >
                    {tier.price}
                  </span>
                  <span className="text-slate-500 text-sm mb-1.5">{tier.period}</span>
                </div>
                <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Divider */}
              <div
                className={[
                  "h-px my-5",
                  tier.highlighted ? "bg-[#0891B2]/30" : "bg-white/8",
                ].join(" ")}
                aria-hidden="true"
              />

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-7" aria-label={`${tier.name} plan features`}>
                {tier.features.map((feature, fi) => (
                  <motion.li
                    key={feature}
                    custom={fi}
                    variants={shouldReduceMotion ? undefined : featureVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check
                      className={[
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        tier.highlighted ? "text-[#22D3EE]" : "text-[#0891B2]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={[
                  "w-full min-h-[44px] font-semibold rounded-xl text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0891B2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A]",
                  tier.highlighted
                    ? "bg-[#0891B2] hover:bg-[#0e7490] text-white shadow-lg shadow-[#0891B2]/25"
                    : "bg-white/8 hover:bg-white/[0.12] text-slate-200 border border-white/10",
                ].join(" ")}
                aria-label={`${tier.cta} — ${tier.name} plan`}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center text-slate-600 text-xs mt-10"
        >
          All prices are in Nigerian Naira. Plans auto-renew monthly. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
