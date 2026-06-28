/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-red': '#ee1010',
        'dark-red': '#DD0E2E',
        'soft-pink': '#991C12',
        'light-pink': '#FFB1D2',
        'matte-black': '#1a1a18',
        'silver-white': '#c9c9c9',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'display': ['Haibara', 'sans-serif'],
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(238, 16, 16, 0.6), 0 0 40px rgba(238, 16, 16, 0.3)',
        'neon-red-lg': '0 0 40px rgba(238, 16, 16, 0.8), 0 0 80px rgba(238, 16, 16, 0.4)',
        'glow': '0 0 30px rgba(238, 16, 16, 0.5)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(238, 16, 16, 0.6), 0 0 40px rgba(238, 16, 16, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(238, 16, 16, 0.8), 0 0 50px rgba(238, 16, 16, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        glow: 'glow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
