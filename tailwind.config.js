/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'ripple-1': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '120px', height: '120px', opacity: '0' },
        },
        'ripple-2': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '100px', height: '100px', opacity: '0' },
        },
        'ripple-3': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '110px', height: '110px', opacity: '0' },
        },
        'ripple-4': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '90px', height: '90px', opacity: '0' },
        },
        'ripple-5': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '130px', height: '130px', opacity: '0' },
        },
        'ripple-6': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '95px', height: '95px', opacity: '0' },
        },
        'ripple-7': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '105px', height: '105px', opacity: '0' },
        },
        'ripple-8': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '115px', height: '115px', opacity: '0' },
        },
        'ripple-9': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '100px', height: '100px', opacity: '0' },
        },
        'ripple-10': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '80px', height: '80px', opacity: '0' },
        },
        'ripple-11': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '85px', height: '85px', opacity: '0' },
        },
        'ripple-12': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '90px', height: '90px', opacity: '0' },
        },
        'ripple-13': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '88px', height: '88px', opacity: '0' },
        },
        'ripple-14': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '75px', height: '75px', opacity: '0' },
        },
        'ripple-15': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '82px', height: '82px', opacity: '0' },
        },
        'ripple-16': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '78px', height: '78px', opacity: '0' },
        },
        'ripple-17': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '80px', height: '80px', opacity: '0' },
        },
        'ripple-18': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '70px', height: '70px', opacity: '0' },
        },
        'ripple-19': {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '72px', height: '72px', opacity: '0' },
        },
      },
      animation: {
        'ripple-1': 'ripple-1 3s ease-out infinite',
        'ripple-2': 'ripple-2 3.5s ease-out infinite 0.3s',
        'ripple-3': 'ripple-3 4s ease-out infinite 0.6s',
        'ripple-4': 'ripple-4 3.2s ease-out infinite 0.9s',
        'ripple-5': 'ripple-5 3.8s ease-out infinite 1.2s',
        'ripple-6': 'ripple-6 3.3s ease-out infinite 1.5s',
        'ripple-7': 'ripple-7 3.7s ease-out infinite 1.8s',
        'ripple-8': 'ripple-8 3.4s ease-out infinite 2.1s',
        'ripple-9': 'ripple-9 3.6s ease-out infinite 2.4s',
        'ripple-10': 'ripple-10 3.1s ease-out infinite 2.7s',
        'ripple-11': 'ripple-11 3.5s ease-out infinite 3s',
        'ripple-12': 'ripple-12 3.2s ease-out infinite 3.3s',
        'ripple-13': 'ripple-13 3.4s ease-out infinite 3.6s',
        'ripple-14': 'ripple-14 3.3s ease-out infinite 3.9s',
        'ripple-15': 'ripple-15 3.6s ease-out infinite 4.2s',
        'ripple-16': 'ripple-16 3.4s ease-out infinite 4.5s',
        'ripple-17': 'ripple-17 3.5s ease-out infinite 4.8s',
        'ripple-18': 'ripple-18 3.2s ease-out infinite 5.1s',
        'ripple-19': 'ripple-19 3.4s ease-out infinite 5.4s',
      },
    },
  },
  plugins: [],
};

