/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalize-1': 'equalize 0.8s ease-in-out infinite alternate',
        'equalize-2': 'equalize 1.1s ease-in-out infinite alternate',
        'equalize-3': 'equalize 0.9s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        equalize: {
          '0%': { height: '4px' },
          '100%': { height: '18px' },
        }
      }
    },
  },
  plugins: [],
}
