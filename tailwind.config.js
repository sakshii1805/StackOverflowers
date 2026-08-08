/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#06080A",
        surface: "rgba(255,255,255,0.03)",
        "surface-solid": "#0D1210",
        "surface-2": "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        text: "#E4EBE6",
        "text-dim": "#8FA098",
        "text-faint": "#556158",
        accent: "#1F7A4C",
        "accent-neon": "#39FF8C",
        "accent-dim": "rgba(57,255,140,0.12)",
        critical: "#FF4D5E",
        high: "#FF9142",
        medium: "#39FF8C",
        low: "#5B8AA6",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)",
        "neon-sm": "0 0 12px rgba(57,255,140,0.25)",
      },
      animation: {
        "pulse-glow": "pulse-glow 1.8s ease-in-out infinite",
        scan: "scan 3.2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 0 0 rgba(57,255,140,0.5)" },
          "50%": { opacity: 0.7, boxShadow: "0 0 0 6px rgba(57,255,140,0)" },
        },
        scan: {
          "0%": { left: "-22%" },
          "100%": { left: "100%" },
        },
      },
    },
  },
  plugins: [],
};