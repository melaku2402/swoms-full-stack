// Import the default theme to merge with
import defaultTheme from 'tailwindcss/defaultTheme'; 

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Merge the default colors and then define your custom primary palette
        ...defaultTheme.colors,
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        // Use defaultTheme.fontFamily.sans to ensure system fonts are available
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },

    animation: {
      blob: "blob 7s infinite",
      dash: "dash 30s linear infinite",
      "slide-up": "slide-up 0.6s ease-out",
      "fade-in": "fade-in 0.8s ease-out",
      "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    keyframes: {
      blob: {
        "0%": {
          transform: "translate(0px, 0px) scale(1)",
        },
        "33%": {
          transform: "translate(30px, -50px) scale(1.1)",
        },
        "66%": {
          transform: "translate(-20px, 20px) scale(0.9)",
        },
        "100%": {
          transform: "translate(0px, 0px) scale(1)",
        },
      },
      dash: {
        to: {
          "stroke-dashoffset": "1000",
        },
      },
      "slide-up": {
        from: {
          opacity: "0",
          transform: "translateY(20px)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
      "fade-in": {
        from: {
          opacity: "0",
        },
        to: {
          opacity: "1",
        },
      },
    },
    backdropBlur: {
      xs: "2px",
    },
  },
  plugins: [],
};