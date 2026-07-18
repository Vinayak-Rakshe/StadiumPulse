/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stadium: {
          dark: "#0B0F19",
          slate: "#151F32",
          card: "#1E293B",
          border: "#334155",
        },
        fifa: {
          green: "#10B981", // Accent Green
          greenDark: "#059669",
          gold: "#F59E0B", // AAA Accent Gold
          goldDark: "#D97706",
          red: "#EF4444",
          blue: "#3B82F6"
        }
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
