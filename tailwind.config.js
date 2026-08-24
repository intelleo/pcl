/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030D26',
          900: '#051636',
          800: '#0A224F',
          700: '#123069',
          600: '#1B4085',
        },
        ucl: {
          50: '#EFF4FF',
          100: '#E4EDFF',
          500: '#2465EB',
          600: '#1553CF',
        },
        gold: {
          300: '#F3D98B',
          400: '#E9C46A',
          500: '#C99738',
          600: '#A87B22',
        },
        ink: {
          900: '#0C1B3A',
          600: '#33415C',
          400: '#64748B',
          300: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 27, 58, 0.06), 0 4px 16px -8px rgba(12, 27, 58, 0.10)',
        lift: '0 8px 28px -12px rgba(12, 27, 58, 0.22)',
      },
    },
  },
  plugins: [],
}
