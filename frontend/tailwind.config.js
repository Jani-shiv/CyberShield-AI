/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0b1329",
        border: "#1e293b",
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1d4ed8",
        },
        accent: {
          DEFAULT: "#06B6D4",
          dark: "#0891b2",
        },
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
