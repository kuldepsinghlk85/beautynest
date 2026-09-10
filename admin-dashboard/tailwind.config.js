/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E91E8C',
          primaryDark: '#C2185B',
          primaryLight: '#FCE4EC',
          bg: '#F8F9FA',
          sidebar: '#1E1B1E',
          sidebarHover: '#2C272D',
          accent: '#D4AF37',
          charcoal: '#2D2D2D',
        },
      },
    },
  },
  plugins: [],
}
