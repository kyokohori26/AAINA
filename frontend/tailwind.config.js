/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FBF8F3", // warm cream background
          200: "#F3EDE2",
          300: "#ECE6DC", // border
        },
        mirror: {
          blue: "#5B8DEF",
          hover: "#4A7BDC",
          light: "#EEF4FF",
        },
        lavender: {
          DEFAULT: "#B8A9F0",
          light: "#F3F0FC",
          dark: "#917FD1",
        },
        peach: {
          DEFAULT: "#FFB38A",
          light: "#FFF4ED",
        },
        ink: {
          DEFAULT: "#2B2D42",
          muted: "#6B7280",
          light: "#9CA3AF",
        },
        mood: {
          calm: "#8EC5F2",
          happy: "#FFD36E",
          sad: "#A9A6D6",
          anxious: "#FFB38A",
          angry: "#F28B8B",
          tired: "#B7C4CF",
          neutral: "#D9D9D9",
        },
        success: "#6BCB9B",
        danger: "#E76F6F",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        handwriting: ["Caveat", "cursive"],
      },
      borderRadius: {
        'card': '20px',
        'button': '14px',
        'input': '12px',
      },
      boxShadow: {
        'mirror': '0 6px 24px rgba(91, 141, 239, 0.10)',
        'mirror-lg': '0 12px 36px rgba(91, 141, 239, 0.16)',
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
