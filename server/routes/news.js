import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { query, generateUUID } from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '../uploads/news')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

/**
 * Simpan base64 data URL ke file disk agar OG tag preview WhatsApp / Facebook
 * dapat mengambil gambar via URL publik statis HTTPS.
 * Mengonversi format ke JPEG/PNG jika diperlukan karena WhatsApp tidak selalu mendukung preview WEBP di OG image.
 */
function simpanBase64KeFile(dataUrl, namaDasar) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl
  }

  try {
    const cocok = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
    if (!cocok) return dataUrl

    let ekstensi = cocok[1].toLowerCase()
    if (ekstensi === 'jpeg') ekstensi = 'jpg'
    const buffer = Buffer.from(cocok[2], 'base64')
    const namaFile = `${namaDasar}-${Date.now()}.${ekstensi}`
    const pathLengkap = path.join(UPLOAD_DIR, namaFile)

    fs.writeFileSync(pathLengkap, buffer)
    return `/uploads/news/${namaFile}`
  } catch (err) {
    console.error('Gagal menyimpan file gambar base64 ke disk:', err)
    return dataUrl
  }
}

const router = express.Router()

let kolomTersedia = false
async function pastikanKolomTersedia() {
  if (kolomTersedia) return
  try {
    await query('ALTER TABLE pcl_news ADD COLUMN likes_count INT DEFAULT 0')
  } catch {
    // Kolom sudah ada
  }
  try {
    await query('ALTER TABLE pcl_news ADD COLUMN is_pinned TINYINT(1) DEFAULT 0')
  } catch {
    // Kolom sudah ada
  }
  kolomTersedia = true
}

/**
 * GET /api/news
 * Ambil semua daftar berita (berita yang disematkan tampil paling atas)
 */
router.get('/', async (req, res) => {
  try {
    await pastikanKolomTersedia()
    const rows = await query('SELECT * FROM pcl_news ORDER BY is_pinned DESC, diterbitkan_pada DESC, created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/news/:id
 * Ambil detail 1 berita
 */
router.get('/:id', async (req, res) => {
  try {
    await pastikanKolomTersedia()
    const { id } = req.params
    const [news] = await query('SELECT * FROM pcl_news WHERE id = ?', [id])
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' })
    }
    res.json(news)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/news
 * Buat berita baru
 */
router.post('/', async (req, res) => {
  try {
    const {
      judul, ringkasan, konten, kategori = 'turnamen', tag = 'MATCH RECAP',
      penulis = 'Redaksi PCL', gambar_url, waktu_baca = '3 min read', terkait_match_id,
      is_pinned = 0
    } = req.body

    if (!judul || !konten) {
      return res.status(400).json({ error: 'Judul dan konten berita wajib diisi.' })
    }

    const id = generateUUID()
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const urlGambarFinal = simpanBase64KeFile(gambar_url, id)
    const statusPin = is_pinned ? 1 : 0

    await query(
      `INSERT INTO pcl_news
       (id, judul, ringkasan, konten, kategori, tag, penulis, gambar_url, waktu_baca, terkait_match_id, is_pinned, diterbitkan_pada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, judul.trim(), ringkasan || null, konten, kategori, tag, penulis, urlGambarFinal || null, waktu_baca, terkait_match_id || null, statusPin, nowStr]
    )

    const [created] = await query('SELECT * FROM pcl_news WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/news/:id
 * Perbarui berita
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { judul, ringkasan, konten, kategori, tag, penulis, gambar_url, waktu_baca, terkait_match_id, is_pinned } = req.body

    const updates = []
    const params = []

    if (judul !== undefined) { updates.push('judul = ?'); params.push(judul.trim()) }
    if (ringkasan !== undefined) { updates.push('ringkasan = ?'); params.push(ringkasan) }
    if (konten !== undefined) { updates.push('konten = ?'); params.push(konten) }
    if (kategori !== undefined) { updates.push('kategori = ?'); params.push(kategori) }
    if (tag !== undefined) { updates.push('tag = ?'); params.push(tag) }
    if (penulis !== undefined) { updates.push('penulis = ?'); params.push(penulis) }
    if (gambar_url !== undefined) {
      const urlGambarFinal = simpanBase64KeFile(gambar_url, id)
      updates.push('gambar_url = ?')
      params.push(urlGambarFinal)
    }
    if (waktu_baca !== undefined) { updates.push('waktu_baca = ?'); params.push(waktu_baca) }
    if (terkait_match_id !== undefined) { updates.push('terkait_match_id = ?'); params.push(terkait_match_id || null) }
    if (is_pinned !== undefined) { updates.push('is_pinned = ?'); params.push(is_pinned ? 1 : 0) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah.' })
    }

    params.push(id)
    await query(`UPDATE pcl_news SET ${updates.join(', ')} WHERE id = ?`, params)

    const [updated] = await query('SELECT * FROM pcl_news WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/news/:id/pin
 * Toggle pin/unpin artikel berita secara cepat
 */
router.post('/:id/pin', async (req, res) => {
  try {
    await pastikanKolomTersedia()
    const { id } = req.params
    const [news] = await query('SELECT id, is_pinned FROM pcl_news WHERE id = ?', [id])
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' })
    }

    const statusBaru = news.is_pinned ? 0 : 1
    await query('UPDATE pcl_news SET is_pinned = ? WHERE id = ?', [statusBaru, id])

    const [updated] = await query('SELECT * FROM pcl_news WHERE id = ?', [id])
    res.json({ success: true, is_pinned: Boolean(statusBaru), news: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/news/:id/like
 * Toggle like artikel berita (increment / decrement)
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const { delta = 1 } = req.body // +1 untuk like, -1 untuk unlike

    // Pastikan kolom likes_count tersedia (self-healing migration)
    try {
      await query('ALTER TABLE pcl_news ADD COLUMN likes_count INT DEFAULT 0')
    } catch {
      // Kolom sudah ada
    }

    const perubahan = Number(delta) >= 0 ? 1 : -1
    await query(
      'UPDATE pcl_news SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + ?) WHERE id = ?',
      [perubahan, id]
    )

    const [news] = await query('SELECT id, likes_count FROM pcl_news WHERE id = ?', [id])
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' })
    }

    res.json({ success: true, likes_count: Number(news.likes_count || 0) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/news/:id
 * Hapus berita
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_news WHERE id = ?', [id])
    res.json({ success: true, message: 'Berita berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
