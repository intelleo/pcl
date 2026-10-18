import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { query, generateUUID } from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '../uploads/recaps')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const router = express.Router()

// Pastikan tabel ada (auto-migrasi)
let tabelSiap = false
async function pastikanTabelSiap() {
  if (tabelSiap) return
  try {
    await query(`CREATE TABLE IF NOT EXISTS pcl_match_recaps (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      match_id VARCHAR(36) NOT NULL,
      team_id VARCHAR(36) NOT NULL,
      recap_image_url TEXT NOT NULL,
      gk_stats_image_url TEXT NULL,
      catatan TEXT NULL,
      status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_recap_match_team (match_id, team_id),
      CONSTRAINT fk_recaps_match FOREIGN KEY (match_id) REFERENCES pcl_matches(id) ON DELETE CASCADE,
      CONSTRAINT fk_recaps_team FOREIGN KEY (team_id) REFERENCES pcl_teams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  } catch { /* tabel sudah ada */ }
  tabelSiap = true
}

/**
 * Simpan base64 data URL ke file disk, return path relatif.
 * Pola reuse dari server/routes/news.js
 */
function simpanBase64KeFile(dataUrl, namaDasar) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl

  try {
    const cocok = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
    if (!cocok) return dataUrl

    let ekstensi = cocok[1].toLowerCase()
    if (ekstensi === 'jpeg') ekstensi = 'jpg'
    const buffer = Buffer.from(cocok[2], 'base64')
    const namaFile = `${namaDasar}-${Date.now()}.${ekstensi}`
    const pathLengkap = path.join(UPLOAD_DIR, namaFile)

    fs.writeFileSync(pathLengkap, buffer)
    return `/uploads/recaps/${namaFile}`
  } catch (err) {
    console.error('Gagal menyimpan file recap ke disk:', err)
    return dataUrl
  }
}

/**
 * POST /api/recaps
 * Upload recap match (dari kapten tim)
 */
router.post('/', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const { match_id, team_id, recap_image, gk_stats_image, catatan } = req.body

    if (!match_id || !team_id || !recap_image) {
      return res.status(400).json({ error: 'match_id, team_id, dan recap_image wajib diisi.' })
    }

    // Cek duplikat (1 tim 1 match hanya boleh 1 recap)
    const [existing] = await query(
      'SELECT id FROM pcl_match_recaps WHERE match_id = ? AND team_id = ?',
      [match_id, team_id]
    )
    if (existing) {
      return res.status(409).json({ error: 'Recap untuk pertandingan ini sudah pernah dikirim.' })
    }

    const id = generateUUID()
    const slug = `recap-${id.slice(0, 8)}`

    const recapUrl = simpanBase64KeFile(recap_image, slug)
    const gkUrl = gk_stats_image ? simpanBase64KeFile(gk_stats_image, `gk-${id.slice(0, 8)}`) : null

    await query(
      `INSERT INTO pcl_match_recaps (id, match_id, team_id, recap_image_url, gk_stats_image_url, catatan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, match_id, team_id, recapUrl, gkUrl, catatan || null]
    )

    res.json({ id, match_id, team_id, recap_image_url: recapUrl, gk_stats_image_url: gkUrl, catatan, status: 'pending' })
  } catch (err) {
    console.error('Error upload recap:', err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/recaps
 * Daftar semua recap (admin) — JOIN info tim & laga
 */
router.get('/', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const rows = await query(
      `SELECT r.*,
              t.name AS team_name, t.short_name AS team_short, t.logo_url AS team_logo,
              m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.stage, m.status AS match_status,
              th.name AS home_team_name, th.short_name AS home_team_short,
              ta.name AS away_team_name, ta.short_name AS away_team_short
       FROM pcl_match_recaps r
       JOIN pcl_teams t ON t.id = r.team_id
       JOIN pcl_matches m ON m.id = r.match_id
       LEFT JOIN pcl_teams th ON th.id = m.home_team_id
       LEFT JOIN pcl_teams ta ON ta.id = m.away_team_id
       ORDER BY r.created_at DESC`
    )
    res.json(rows || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/recaps/team/:teamId
 * Daftar recap per tim (untuk portal kapten)
 */
router.get('/team/:teamId', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const rows = await query(
      `SELECT r.*,
              m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.stage,
              th.name AS home_team_name, th.short_name AS home_team_short,
              ta.name AS away_team_name, ta.short_name AS away_team_short
       FROM pcl_match_recaps r
       JOIN pcl_matches m ON m.id = r.match_id
       LEFT JOIN pcl_teams th ON th.id = m.home_team_id
       LEFT JOIN pcl_teams ta ON ta.id = m.away_team_id
       WHERE r.team_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.teamId]
    )
    res.json(rows || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/recaps/:id/status
 * Admin: update status recap (verified / rejected)
 */
router.put('/:id/status', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const { status } = req.body
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status harus pending, verified, atau rejected.' })
    }
    await query('UPDATE pcl_match_recaps SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ success: true, status })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/recaps/:id
 * Admin: hapus recap + file gambar dari disk
 */
router.delete('/:id', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const [recap] = await query('SELECT recap_image_url, gk_stats_image_url FROM pcl_match_recaps WHERE id = ?', [req.params.id])
    if (!recap) return res.status(404).json({ error: 'Recap tidak ditemukan.' })

    // Hapus file dari disk jika path lokal
    for (const url of [recap.recap_image_url, recap.gk_stats_image_url]) {
      if (url && url.startsWith('/uploads/recaps/')) {
        const filePath = path.join(__dirname, '..', url)
        try { fs.unlinkSync(filePath) } catch { /* file mungkin sudah tidak ada */ }
      }
    }

    await query('DELETE FROM pcl_match_recaps WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
