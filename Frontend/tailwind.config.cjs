/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0a0c",       // Sleek deep dark background
          card: "#151518",     // Sleek card background
          border: "#202026",   // Slate border
          input: "#18181f",    // Slate dark inputs
          hover: "#2a2a35",
        },
        accent: {
          blue: "#3b82f6",     // Clean developer blue
          hover: "#2563eb",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#3b82f6",     // Blue accent
          "secondary": "#64748b",   // Slate Gray
          "accent": "#60a5fa",
          "neutral": "#1e293b",
          "base-100": "#0a0a0c",    // Dark background
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}
