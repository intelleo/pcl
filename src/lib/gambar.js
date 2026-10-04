/**
 * Utilitas Kompresi & Resize Gambar Client-Side
 * Mengurangi ukuran base64 gambar sebelum disimpan ke database.
 */

const MAKS_LEBAR = 800
const MAKS_TINGGI = 800
const KUALITAS_KOMPRESI = 0.75 // 75% quality JPEG/WEBP

/**
 * Kompres dan resize gambar dari File input.
 * @param {File} file - File gambar dari input[type="file"]
 * @param {Object} opsi
 * @param {number} opsi.maksLebar - Lebar maksimal (px)
 * @param {number} opsi.maksTinggi - Tinggi maksimal (px)
 * @param {number} opsi.kualitas - Kualitas kompresi (0-1)
 * @param {string} opsi.format - Output format ('image/webp' atau 'image/jpeg')
 * @returns {Promise<string>} Base64 data URL hasil kompresi
 */
export function kompresGambar(file, opsi = {}) {
  const {
    maksLebar = MAKS_LEBAR,
    maksTinggi = MAKS_TINGGI,
    kualitas = KUALITAS_KOMPRESI,
    format = 'image/webp'
  } = opsi

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat gambar.'))
      img.onload = () => {
        let { width, height } = img

        // Hitung rasio resize
        if (width > maksLebar || height > maksTinggi) {
          const rasio = Math.min(maksLebar / width, maksTinggi / height)
          width = Math.round(width * rasio)
          height = Math.round(height * rasio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Coba WebP dulu, fallback JPEG jika browser tidak support
        let hasil = canvas.toDataURL(format, kualitas)
        if (format === 'image/webp' && hasil.startsWith('data:image/png')) {
          // Browser tidak support WebP export, fallback ke JPEG
          hasil = canvas.toDataURL('image/jpeg', kualitas)
        }

        resolve(hasil)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Validasi ukuran file gambar.
 * @param {File} file
 * @param {number} maksByte - Ukuran maksimal dalam bytes (default 2MB)
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiUkuranGambar(file, maksByte = 2 * 1024 * 1024) {
  if (!file) return { valid: false, pesan: 'File tidak ditemukan.' }
  if (file.size > maksByte) {
    const mbStr = (maksByte / (1024 * 1024)).toFixed(0)
    return { valid: false, pesan: `Ukuran gambar maksimal ${mbStr}MB.` }
  }
  return { valid: true, pesan: '' }
}
