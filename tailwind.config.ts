import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        soteria: {
          blue: "hsl(var(--soteria-blue))",
          'blue-light': "hsl(var(--soteria-blue-light))",
          'blue-dark': "hsl(var(--soteria-blue-dark))",
        },
        mh: {
          gold: "hsl(var(--mh-gold))",
          'gold-light': "hsl(var(--mh-gold-light))",
          'gold-dark': "hsl(var(--mh-gold-dark))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Accordion
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Fade animations
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // Float animations
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(-1deg)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        // Premium shimmer
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // Pulse animations
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(0.98)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--accent) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--accent) / 0.5)" },
        },
        // Scale animations
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-spring": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "60%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Blur animations
        "blur-in": {
          "0%": { opacity: "0", filter: "blur(12px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        "blur-sharp": {
          "0%": { opacity: "0", filter: "blur(20px)", transform: "scale(1.05)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "scale(1)" },
        },
        // Ken Burns
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        "ken-burns-reverse": {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        // Slide animations
        "slide-fade-in": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-content-in": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up-spring": {
          "0%": { opacity: "0", transform: "translateY(60px)" },
          "60%": { opacity: "1", transform: "translateY(-5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Text reveal
        "text-reveal": {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        "mask-reveal": {
          "0%": { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          "100%": { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
        },
        // 3D Effects
        "tilt-in": {
          "0%": { opacity: "0", transform: "perspective(1000px) rotateX(15deg) translateY(40px)" },
          "100%": { opacity: "1", transform: "perspective(1000px) rotateX(0deg) translateY(0)" },
        },
        "flip-in": {
          "0%": { opacity: "0", transform: "perspective(1000px) rotateY(-30deg)" },
          "100%": { opacity: "1", transform: "perspective(1000px) rotateY(0deg)" },
        },
        // Orbit animations
        "orbit-slow": {
          "0%": { transform: "rotate(0deg) translateX(10px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(10px) rotate(-360deg)" },
        },
        "orbit-reverse": {
          "0%": { transform: "rotate(360deg) translateX(15px) rotate(-360deg)" },
          "100%": { transform: "rotate(0deg) translateX(15px) rotate(0deg)" },
        },
        // Glow effects
        "glow-pulse": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.2)" },
        },
        // Scan line
        "scan-line": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        // Cascade reveal
        "cascade": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // Pop in
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Elastic
        "elastic-in": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "55%": { transform: "scale(1.15)" },
          "75%": { transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Breathing
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        // Basic
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Fade animations with spring easing
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-down": "fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-left": "fade-in-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-right": "fade-in-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Float animations
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        // Shimmer
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 2s ease-in-out infinite",
        // Pulse
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        // Scale
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-spring": "scale-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        // Blur
        "blur-in": "blur-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "blur-sharp": "blur-sharp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Ken Burns
        "ken-burns": "ken-burns 8s ease-out forwards",
        "ken-burns-reverse": "ken-burns-reverse 8s ease-out forwards",
        // Slide
        "slide-fade-in": "slide-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-content-in": "slide-content-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up-spring": "slide-up-spring 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        // Text reveal
        "text-reveal": "text-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "mask-reveal": "mask-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // 3D
        "tilt-in": "tilt-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "flip-in": "flip-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Orbit
        "orbit-slow": "orbit-slow 20s linear infinite",
        "orbit-reverse": "orbit-reverse 25s linear infinite",
        // Glow
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        // Scan
        "scan-line": "scan-line 2.5s ease-in-out infinite",
        // Cascade
        "cascade": "cascade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Pop
        "pop-in": "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        // Elastic
        "elastic-in": "elastic-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        // Breathing
        "breathe": "breathe 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
