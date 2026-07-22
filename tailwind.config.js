/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-bold': ['"Space Bold"', 'sans-serif'],
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bubble-rise': {
          '0%': { transform: 'translateY(0) translateX(0) scale(0.9)', opacity: '0' },
          '12%': { opacity: '0.85' },
          '85%': { opacity: '0.6' },
          '100%': {
            transform: 'translateY(-108vh) translateX(var(--bubble-drift, 0)) scale(1.05)',
            opacity: '0',
          },
        },
        'wave-shift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bubble-rise': 'bubble-rise linear infinite',
        'wave-shift': 'wave-shift linear infinite',
      },
    },
  },
  plugins: [],
}