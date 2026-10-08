/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0057B8',
        secondary: '#D71920',
        canvas: '#FFFFFF',
        'canvas-soft': '#F5F8FC',
        ink: '#172033',
        muted: '#667085',
        'footer-blue': '#063C78',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        quiet: '0 14px 40px rgba(23, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
}