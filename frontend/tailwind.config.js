/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f0f9", 100: "#cce0f3", 200: "#99c1e7", 300: "#66a2db",
          400: "#3383cf", 500: "#005BAC", 600: "#004e93", 700: "#003d74",
          800: "#002c55", 900: "#001b36", DEFAULT: "#005BAC",
        },
        secondary: {
          50: "#fef9e7", 100: "#fdf3cf", 200: "#fbe79f", 300: "#f9db6f",
          400: "#f7cf3f", 500: "#F4B400", 600: "#d49e00", 700: "#a87e00",
          800: "#7c5e00", 900: "#503e00", DEFAULT: "#F4B400",
        },
        accent: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#16A34A", 600: "#15803d", 700: "#166534",
          800: "#145523", 900: "#052e16", DEFAULT: "#16A34A",
        },
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        danger: "#DC2626",
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
