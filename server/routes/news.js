import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

let kolomLikeTersedia = false
async function pastikanKolomLikesCount() {
  if (kolomLikeTersedia) return
  try {
    await query('ALTER TABLE pcl_news ADD COLUMN likes_count INT DEFAULT 0')
  } catch {
    // Kolom sudah ada
  }
  kolomLikeTersedia = true
}

/**
 * GET /api/news
 * Ambil semua daftar berita
 */
router.get('/', async (req, res) => {
  try {
    await pastikanKolomLikesCount()
    const rows = await query('SELECT * FROM pcl_news ORDER BY diterbitkan_pada DESC, created_at DESC')
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
    await pastikanKolomLikesCount()
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
      penulis = 'Redaksi PCL', gambar_url, waktu_baca = '3 min read', terkait_match_id
    } = req.body

    if (!judul || !konten) {
      return res.status(400).json({ error: 'Judul dan konten berita wajib diisi.' })
    }

    const id = generateUUID()
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await query(
      `INSERT INTO pcl_news
       (id, judul, ringkasan, konten, kategori, tag, penulis, gambar_url, waktu_baca, terkait_match_id, diterbitkan_pada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, judul.trim(), ringkasan || null, konten, kategori, tag, penulis, gambar_url || null, waktu_baca, terkait_match_id || null, nowStr]
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
    const { judul, ringkasan, konten, kategori, tag, penulis, gambar_url, waktu_baca, terkait_match_id } = req.body

    const updates = []
    const params = []

    if (judul !== undefined) { updates.push('judul = ?'); params.push(judul.trim()) }
    if (ringkasan !== undefined) { updates.push('ringkasan = ?'); params.push(ringkasan) }
    if (konten !== undefined) { updates.push('konten = ?'); params.push(konten) }
    if (kategori !== undefined) { updates.push('kategori = ?'); params.push(kategori) }
    if (tag !== undefined) { updates.push('tag = ?'); params.push(tag) }
    if (penulis !== undefined) { updates.push('penulis = ?'); params.push(penulis) }
    if (gambar_url !== undefined) { updates.push('gambar_url = ?'); params.push(gambar_url) }
    if (waktu_baca !== undefined) { updates.push('waktu_baca = ?'); params.push(waktu_baca) }
    if (terkait_match_id !== undefined) { updates.push('terkait_match_id = ?'); params.push(terkait_match_id || null) }

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
