/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./constants.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Inter"', 'sans-serif'],
      },
      colors: {
        palette: {
          beige: '#F2F2F2',
          tan: '#182540',
          maroon: '#111827',
          red: '#D92B3A',
          black: '#182540',
        },
        primary: {
          DEFAULT: '#D92B3A',
          50: '#fef1f2',
          100: '#fee2e2',
          500: '#D92B3A',
          600: '#BF1111',
          700: '#111827',
        }
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
        'equalizer': 'equalizer 1s ease-in-out infinite',
        'modal-entry': 'modal-entry 0.1s ease-out forwards',
        'backdrop-entry': 'fade-in 0.1s ease-out forwards',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'equalizer': {
          '0%': { height: '10%' },
          '50%': { height: '100%' },
          '100%': { height: '10%' },
        },
        'modal-entry': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}
