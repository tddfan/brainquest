/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        brand: {
          purple: '#7C3AED',
          blue: '#2563EB',
          green: '#10B981',
          orange: '#F59E0B',
          pink: '#EC4899',
          red: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}
