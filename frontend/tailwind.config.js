/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vivora brand palette
        vivora: {
          50:  'hsl(239, 100%, 97%)',
          100: 'hsl(239, 96%, 92%)',
          200: 'hsl(239, 92%, 85%)',
          300: 'hsl(239, 88%, 76%)',
          400: 'hsl(239, 84%, 67%)',
          500: 'hsl(239, 84%, 60%)',
          600: 'hsl(239, 84%, 55%)',
          700: 'hsl(239, 80%, 45%)',
          800: 'hsl(239, 76%, 36%)',
          900: 'hsl(239, 72%, 28%)',
        },
        // Dark surfaces
        surface: {
          base:     'hsl(222, 47%, 7%)',
          DEFAULT:  'hsl(222, 44%, 10%)',
          elevated: 'hsl(222, 40%, 13%)',
          overlay:  'hsl(222, 36%, 17%)',
          muted:    'hsl(222, 30%, 22%)',
        },
        border: {
          subtle:  'hsl(222, 30%, 20%)',
          DEFAULT: 'hsl(222, 30%, 26%)',
          accent:  'hsl(239, 50%, 45%)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in':    'fadeIn 0.25s ease-out',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 0.25s ease-out',
        'pulse-dot':  'pulseDot 1.8s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
        'shimmer':    'shimmer 1.8s infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'bar-wave-1': 'barWave 0.7s ease-in-out infinite',
        'bar-wave-2': 'barWave 1.0s ease-in-out infinite 0.15s',
        'bar-wave-3': 'barWave 0.8s ease-in-out infinite 0.30s',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to':   { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glowPulse: {
          '0%, 100%': { 'box-shadow': '0 0 0 0 hsla(239, 84%, 67%, 0)' },
          '50%':      { 'box-shadow': '0 0 0 8px hsla(239, 84%, 67%, 0.12)' },
        },
        barWave: {
          '0%':   { height: '3px',  opacity: '0.4' },
          '50%':  { height: '18px', opacity: '1'   },
          '100%': { height: '3px',  opacity: '0.4' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        'glass':   '0 8px 32px hsla(222, 47%, 4%, 0.5), inset 0 1px 0 hsla(255, 100%, 100%, 0.05)',
        'glow':    '0 0 20px hsla(239, 84%, 67%, 0.25)',
        'glow-lg': '0 0 40px hsla(239, 84%, 67%, 0.35)',
        'lift':    '0 12px 32px hsla(222, 47%, 4%, 0.45)',
      },
    },
  },
  plugins: [],
}
