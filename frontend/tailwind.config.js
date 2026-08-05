/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary: KCCA Official Deep Green (#006837)
        primary: {
          50:  "#eaf5ee",
          100: "#c9e8d4",
          200: "#96d2aa",
          300: "#62bc80",
          400: "#2ea656",
          500: "#006837", // KCCA Official Green
          600: "#00572e",
          700: "#004524",
          800: "#00341b",
          900: "#002211",
          DEFAULT: "#006837",
        },
        // Secondary: KCCA Official Red (#ED1C24)
        secondary: {
          50:  "#feebee",
          100: "#ffcdd2",
          200: "#ef9a9a",
          300: "#e57373",
          400: "#ef5350",
          500: "#ED1C24", // KCCA Official Red
          600: "#d31920",
          700: "#b7151b",
          800: "#991015",
          900: "#7a0b0f",
          DEFAULT: "#ED1C24",
        },
        // Accent: KCCA Clock Tower Gold / Sun Yellow (#FFC20E)
        accent: {
          50:  "#fffde7",
          100: "#fff9c4",
          200: "#fff59d",
          300: "#fff176",
          400: "#ffee58",
          500: "#FFC20E", // KCCA Clock Tower Gold
          600: "#e0a800",
          700: "#b38600",
          800: "#856300",
          900: "#574100",
          DEFAULT: "#FFC20E",
        },
        // KCCA Brand Color shortcuts
        kcca: {
          green: "#006837",
          red: "#ED1C24",
          gold: "#FFC20E",
          darkGreen: "#004524",
          lightGreen: "#eaf5ee",
        },
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        danger: "#ED1C24",
        warning: "#D97706",
        info: "#0284C7",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.06),0 1px 2px -1px rgba(0,0,0,.06)",
        "card-md": "0 4px 6px -1px rgba(0,0,0,.08),0 2px 4px -2px rgba(0,0,0,.08)",
        "card-lg": "0 10px 15px -3px rgba(0,0,0,.08),0 4px 6px -4px rgba(0,0,0,.08)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn .3s ease-out",
        "slide-up": "slideUp .35s ease-out",
        "counter": "counter 1s ease-out forwards",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
}
