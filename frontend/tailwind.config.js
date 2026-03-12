/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pure Monochrome — Black & White
        primary: {
          DEFAULT: "#000000",
          50:  "#FFFFFF",
          100: "#F5F5F5",
          200: "#E0E0E0",
          300: "#C0C0C0",
          400: "#888888",
          500: "#555555",
          600: "#333333",
          700: "#1A1A1A",
          800: "#111111",
          900: "#000000",
        },
        surface: {
          DEFAULT: "#0A0A0A",
          elevated: "#141414",
          overlay: "#1A1A1A",
        },
        border: "#222222",
        // Semantic — pure whites, no gold
        success: { DEFAULT: "#4ADE80", soft: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)" },
        warning: { DEFAULT: "#FBBF24", soft: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)" },
        danger:  { DEFAULT: "#F87171", soft: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
        // Text scale
        text: {
          primary:   "#FFFFFF",
          secondary: "#AAAAAA",
          muted:     "#555555",
          ghost:     "#2A2A2A",
        },
      },
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "6px",
        md:   "6px",
        lg:   "10px",
        xl:   "14px",
        "2xl":"18px",
        "3xl":"24px",
        full: "9999px",
      },
      boxShadow: {
        "glow-white": "0 0 16px rgba(255,255,255,0.12)",
        "glow-white-sm": "0 0 8px rgba(255,255,255,0.08)",
        "card": "0 1px 3px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.9), 0 0 1px rgba(255,255,255,0.1)",
      },
      animation: {
        "float-slow":   "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite",
        "float-fast":   "float 4s ease-in-out infinite",
        "glow-pulse":   "glow-pulse 3s ease-in-out infinite",
        "fade-in":      "fade-in 0.4s ease-out",
        "slide-up":     "slide-up 0.3s ease-out",
        "slide-in":     "slide-in 0.3s ease-out",
        "spin-slow":    "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(2deg)" },
          "66%":      { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0px rgba(255,255,255,0)" },
          "50%":      { boxShadow: "0 0 16px rgba(255,255,255,0.12)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
