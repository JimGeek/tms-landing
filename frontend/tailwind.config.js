/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metallic: {
          100: '#F3F4F6', // Light silver
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280', // Standard metal
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937', // Dark steel
          900: '#111827', // Almost black
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Will add Google Font link later
      }
    },
  },
  plugins: [],
}
