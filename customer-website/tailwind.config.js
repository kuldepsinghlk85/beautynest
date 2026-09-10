/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E91E8C',
          primaryDark: '#C2185B',
          primaryLight: '#FCE4EC',
          bg: '#FFF5F7',
          card: '#FFFFFF',
          accent: '#D4AF37',
          accentLight: '#FFF8E7',
          charcoal: '#2D2D2D',
          muted: '#6B7280',
          border: '#F8D7DA',
        },
      },
      boxShadow: {
        'pink-soft': '0 8px 30px rgba(233, 30, 140, 0.08)',
        'pink-hover': '0 12px 35px rgba(233, 30, 140, 0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
