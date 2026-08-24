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
          navy: '#0B162C',       // Midnight Navy (Background dasar & base tekstur)
          royal: '#1A4B9C',      // Royal Blue (Panel samping & aksen gradasi)
          blueGlow: '#3B82F6',   // Vibrant Blue Highlight (Pencahayaan tepi/glow)
          gold: '#D4AF37',       // Metallic Gold (Mahkota, border lis emas)
          goldLight: '#F3E0A3',  // Pale Gold Highlight (Kilau sudut logam)
          bronze: '#8C6B2D',     // Dark Bronze Shadow (Bayangan depth 3D)
          white: '#F8FAFC',      // Platinum White (Teks utama & panel)
          silver: '#CBD5E1',     // Metallic Silver (Gradasi bayangan teks)
          card: '#0F1E3D',       // Kartu navy elevated
          cardLight: '#182C54',  // Hover kartu
          border: '#1E3A6E',     // Border navy royal
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Teko', 'Impact', 'sans-serif']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E0A3 0%, #D4AF37 50%, #8C6B2D 100%)',
        'blue-gradient': 'linear-gradient(135deg, #3B82F6 0%, #1A4B9C 50%, #0B162C 100%)',
        'silver-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 100%)'
      }
    },
  },
  plugins: [],
}
