import express from 'express'
import crypto from 'crypto'
import { query } from '../config/db.js'

const router = express.Router()

/**
 * Helper verifikasi password dengan salt & PBKDF2 SHA-512
 */
function verifikasiPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
}

/**
 * POST /api/auth/login
 * Login Admin / Panitia Turnamen via Database MySQL
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const idBersih = (username || email || '').trim().toLowerCase()
    const passBersih = (password || '').trim()

    if (!idBersih || !passBersih) {
      return res.status(400).json({ error: 'Username / Email dan Password wajib diisi.' })
    }

    // Cari user di tabel pcl_admins berdasarkan username atau email
    const users = await query(
      'SELECT id, username, email, password_hash, salt, nama, role FROM pcl_admins WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
      [idBersih, idBersih]
    )

    if (users && users.length > 0) {
      const admin = users[0]
      const passwordCocok = verifikasiPassword(passBersih, admin.salt, admin.password_hash)

      if (passwordCocok) {
        const userObj = {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          nama: admin.nama,
          role: admin.role
        }
        return res.json({ user: userObj, token: `token-${userObj.id}` })
      }
    }

    return res.status(401).json({ error: 'Username/Email atau Password salah.' })
  } catch (err) {
    console.error('Error saat login admin:', err)
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses login.' })
  }
})

export default router
