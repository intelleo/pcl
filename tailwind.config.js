/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pcl: {
          dark: '#080c14',
          card: '#0f172a',
          cardLight: '#1e293b',
          border: '#334155',
          accent: '#10b981',      // Emerald glow
          accentCyan: '#06b6d4',  // Cyan glow
          gold: '#f59e0b',        // Champion gold
          silver: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Teko', 'Impact', 'sans-serif']
      }
    },
  },
  plugins: [],
}
