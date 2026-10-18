import express from 'express'
import crypto from 'crypto'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

// Pastikan tabel booking keys sudah dibuat saat modul pertama kali di-load
async function inisialisasiTabelBookingKeys() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`pcl_booking_keys\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`key_code\` VARCHAR(32) NOT NULL UNIQUE,
        \`is_used\` TINYINT(1) NOT NULL DEFAULT 0,
        \`used_by_team_id\` VARCHAR(36) NULL,
        \`used_by_team_name\` VARCHAR(255) NULL,
        \`used_at\` DATETIME NULL,
        \`catatan\` VARCHAR(255) NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_booking_key_code\` (\`key_code\`),
        INDEX \`idx_booking_is_used\` (\`is_used\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
  } catch (err) {
    console.error('Inisialisasi tabel pcl_booking_keys:', err.message)
  }
}
inisialisasiTabelBookingKeys()

/**
 * Generate kode key booking format: PCL-BKXXXX (misal: PCL-BK7F9A2C)
 */
function buatKodeKeyAcak() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // tanpa karakter ambigu seperti 0, O, 1, I
  let str = ''
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    str += chars[bytes[i] % chars.length]
  }
  return `PCL-BK${str}`
}

/**
 * GET /api/booking-keys
 * Ambil semua daftar key booking (Khusus Admin)
 */
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM pcl_booking_keys ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/booking-keys/generate
 * Buat sejumlah key booking baru
 * Body: { jumlah: 1..20, catatan: string }
 */
router.post('/generate', async (req, res) => {
  try {
    let { jumlah = 1, catatan = '' } = req.body
    jumlah = Math.max(1, Math.min(50, parseInt(jumlah, 10) || 1))

    const keysCreated = []

    for (let i = 0; i < jumlah; i++) {
      let unique = false
      let keyKode = ''
      // Coba generate sampai dapat unik
      while (!unique) {
        keyKode = buatKodeKeyAcak()
        const [existing] = await query('SELECT id FROM pcl_booking_keys WHERE key_code = ?', [keyKode])
        if (!existing) unique = true
      }

      const id = generateUUID()
      await query(
        `INSERT INTO pcl_booking_keys (id, key_code, is_used, catatan)
         VALUES (?, ?, 0, ?)`,
        [id, keyKode, catatan ? String(catatan).trim() : null]
      )

      keysCreated.push({
        id,
        key_code: keyKode,
        is_used: 0,
        catatan: catatan || null
      })
    }

    res.status(201).json({
      success: true,
      message: `Berhasil membuat ${keysCreated.length} booking key.`,
      keys: keysCreated
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/booking-keys/verify
 * Verifikasi apakah key valid dan belum terpakai (Publik / Pendaftar)
 * Body: { key: string }
 */
router.post('/verify', async (req, res) => {
  try {
    const { key } = req.body
    if (!key || !String(key).trim()) {
      return res.status(400).json({ valid: false, message: 'Key booking wajib diisi.' })
    }

    const keyClean = String(key).trim().toUpperCase()
    const [row] = await query('SELECT * FROM pcl_booking_keys WHERE UPPER(key_code) = ?', [keyClean])

    if (!row) {
      return res.status(404).json({ valid: false, message: 'Booking key tidak ditemukan atau salah ketik.' })
    }

    if (row.is_used) {
      return res.status(400).json({
        valid: false,
        message: `Booking key ini sudah digunakan oleh tim "${row.used_by_team_name || 'Lain'}".`
      })
    }

    res.json({
      valid: true,
      key_code: row.key_code,
      catatan: row.catatan,
      message: 'Booking key valid dan slot tersedia!'
    })
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message })
  }
})

/**
 * DELETE /api/booking-keys/:id
 * Hapus booking key (Khusus Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM pcl_booking_keys WHERE id = ?', [id])
    res.json({ success: true, message: 'Booking key berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
