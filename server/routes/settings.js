import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

/**
 * GET /api/settings
 * Ambil semua pengaturan aplikasi
 */
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT `key`, value, updated_at FROM pcl_settings')
    const mapSettings = {}
    rows.forEach(r => {
      mapSettings[r.key] = r.value
    })
    res.json(mapSettings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/settings/:key
 * Ambil nilai 1 setting
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const [row] = await query('SELECT `key`, value FROM pcl_settings WHERE `key` = ?', [key])
    if (!row) {
      return res.status(404).json({ error: `Setting "${key}" tidak ditemukan.` })
    }
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/settings/:key
 * Simpan atau perbarui nilai setting
 */
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { value } = req.body

    if (value === undefined) {
      return res.status(400).json({ error: 'Value setting wajib disertakan.' })
    }

    const valStr = String(value)
    await query(
      'INSERT INTO pcl_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
      [key, valStr]
    )

    const [updated] = await query('SELECT `key`, value, updated_at FROM pcl_settings WHERE `key` = ?', [key])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
