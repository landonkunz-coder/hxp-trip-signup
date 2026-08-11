import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        display: ['"Fraunces Variable"', "Georgia", "serif"],
      },
      colors: {
        // HXP brand palette — ONLY these four colors.
        ink: "#000000", // black — text + dark surfaces (hero, footer)
        paper: "#ffffff", // white — page background, text on dark
        sand: "#c7b293", // warm tan — secondary surfaces, borders, warm accents
        brick: "#cd5144", // terracotta — the single accent (CTAs, badges, marks)
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,28,24,0.04), 0 8px 30px rgba(14,28,24,0.08)",
        lift: "0 10px 40px rgba(14,28,24,0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
