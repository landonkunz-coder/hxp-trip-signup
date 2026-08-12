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
        sans: ['"Zilla Slab"', "Georgia", "serif"],
        display: ['"Zilla Slab"', "Georgia", "serif"],
        hand: ['"Caveat Variable"', "cursive"],
      },
      colors: {
        // HXP "crafted" palette — warm parchment + slab-serif world.
        ink: "#3a2b1e", // warm dark brown — text + dark surfaces
        paper: "#ffffff", // white — form inputs / crisp cards
        cream: "#f0e5cf", // parchment — page background
        card: "#fbf5e6", // warm card surface
        sand: "#cdb994", // hand-drawn line / border tone
        brick: "#cd5144", // terracotta accent
        brickdeep: "#a63a30", // deep terracotta — shadows, borders
        gold: "#d9b877", // gold highlighter accent
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
