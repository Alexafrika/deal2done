/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — clean, trustworthy, Kaspi-inspired
        brand: {
          50:  "#fff0f0",
          100: "#ffd6d6",
          200: "#ffadad",
          300: "#ff6b6b",
          400: "#ff4444",
          500: "#e83333",  // primary brand red
          600: "#cc1a1a",
          700: "#a61111",
          800: "#7a0d0d",
          900: "#550a0a",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f5f5f7",
          border: "#e8e8e8",
          hover: "#f0f0f0",
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#555555",
          muted: "#999999",
        },
        success: "#16a34a",
        warning: "#d97706",
        error:   "#dc2626",
        info:    "#2563eb",
        // Status colours (semantic)
        status: {
          pending:   { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
          confirmed: { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
          preparing: { bg: "#faf5ff", text: "#6d28d9", border: "#c4b5fd" },
          shipped:   { bg: "#eef2ff", text: "#3730a3", border: "#a5b4fc" },
          delivered: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
          cancelled: { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        "card-sm":  "0 1px 2px rgba(0,0,0,0.05)",
        header:     "0 1px 0 rgba(0,0,0,0.06)",
      },
      screens: {
        xs: "375px",
      },
      animation: {
        "fade-in":   "fadeIn 0.2s ease-out",
        "slide-up":  "slideUp 0.25s ease-out",
        "slide-down":"slideDown 0.2s ease-out",
        shimmer:     "shimmer 1.5s infinite",
        "scale-in":  "scaleIn 0.15s ease-out",
        "badge-pop": "badgePop 0.2s ease-out",
      },
      keyframes: {
        fadeIn:   { from: { opacity: "0" },          to: { opacity: "1" } },
        slideUp:  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown:{ from: { opacity: "0", transform: "translateY(-6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:  { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        badgePop: { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};
