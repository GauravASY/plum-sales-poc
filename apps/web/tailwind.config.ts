import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        plum: {
          DEFAULT: "#2b0b21",
          50: "#f9eef0",
          100: "#f0d4da",
          200: "#e4b3bd",
          300: "#d88da0",
          400: "#cf7a8b",
          500: "#c96978",
          600: "#a85660",
          700: "#7d4049",
          800: "#522e34",
          900: "#2b0b21",
        },
        coral: {
          DEFAULT: "#ff4053",
          50: "#ffeef2",
          100: "#ffd4da",
          200: "#ffb3bf",
          300: "#ff8f9f",
          400: "#ff6b7d",
          500: "#ff4053",
          600: "#d6283d",
          700: "#a11e2d",
          800: "#6e1520",
          900: "#3f0c15",
        },
        cream: {
          DEFAULT: "#fff2e6",
          50: "#fffcf8",
          100: "#fff2e6",
          200: "#ffe4cc",
          300: "#ffd4ae",
          400: "#ffc28d",
          500: "#efae6e",
        },
        amber: "#FFB347",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["GT Alpina Standard", "Verdana", "sans-serif"],
        sans: ["Passenger Sans", "Segoe UI", "Arial", "sans-serif"],
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 0 var(--pulse-color, hsl(var(--primary) / 0.45)), 0 0 0 0 transparent",
          },
          "50%": {
            boxShadow:
              "0 0 0 10px transparent, 0 0 24px 4px var(--pulse-glow, transparent)",
          },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "soft-pulse": "soft-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;