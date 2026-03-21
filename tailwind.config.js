/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050816",
        panel: "#0b1120",
        muted: "#93a4bd",
        line: "rgba(148, 163, 184, 0.16)",
        glow: "#77f2ff",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(4, 10, 28, 0.45)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px rgba(10,16,38,0.55)",
        aura: "0 0 80px rgba(101, 229, 255, 0.2)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.95", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        rise: "rise 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
