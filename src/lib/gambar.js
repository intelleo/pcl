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
    maksLebar = 1200,
    maksTinggi = 1200,
    kualitas = 0.85,
    format = 'image/jpeg'
  } = opsi

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat gambar.'))
      img.onload = () => {
        let { width, height } = img

        // Hitung rasio resize proporsional
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

        // Gunakan JPEG agar kompatibel 100% dengan WhatsApp Link Preview
        const hasil = canvas.toDataURL(format, kualitas)
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

/**
 * Unduh gambar ke file lokal pengguna (mendukung base64 data URL maupun remote URL).
 * @param {string} url - URL gambar atau base64
 * @param {string} namaBerkas - Nama file target (misal: logo-chelsea.png)
 */
export async function unduhGambar(url, namaBerkas = 'logo-tim.png') {
  if (!url) throw new Error('URL gambar tidak valid.')

  // Pastikan nama berkas memiliki ekstensi aman
  const namaAman = namaBerkas.endsWith('.png') || namaBerkas.endsWith('.jpg') || namaBerkas.endsWith('.webp')
    ? namaBerkas
    : `${namaBerkas}.png`

  // Kasus 1: Data URL (base64)
  if (url.startsWith('data:')) {
    const a = document.createElement('a')
    a.href = url
    a.download = namaAman
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  // Kasus 2: Remote URL (ambil blob via fetch untuk bypass download restriction)
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = namaAman
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  } catch (err) {
    // Fallback jika CORS memblokir fetch: gambar via canvas atau buka langsung
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = namaAman
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // Fallback terakhir: buka URL di tab baru
      window.open(url, '_blank')
    }
  }
}
