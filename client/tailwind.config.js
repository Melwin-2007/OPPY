/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oppy: {
          bg: '#101113',
          card: '#181A1D',
          surface: '#22252A',
          border: '#34383E',
          borderLight: '#4B5058',
          textPrimary: '#F1F1F1',
          textSecondary: '#A1A5AA',
          textMuted: '#737980',
          accent: '#38BDF8',
          accentEmerald: '#34D399',
          accentOrange: '#FB923C'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
