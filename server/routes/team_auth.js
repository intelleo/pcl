import express from 'express'
import crypto from 'crypto'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

// Pastikan tabel pcl_team_accounts ada (auto-migrasi)
let tabelSiap = false
async function pastikanTabelSiap() {
  if (tabelSiap) return
  try {
    await query(`CREATE TABLE IF NOT EXISTS pcl_team_accounts (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      team_id VARCHAR(36) NOT NULL UNIQUE,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_team_accounts_team FOREIGN KEY (team_id) REFERENCES pcl_teams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  } catch { /* tabel sudah ada */ }
  tabelSiap = true
}

function buatHash(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

function verifikasiPassword(password, salt, storedHash) {
  const hash = buatHash(password, salt)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
}

function generatePassword(panjang = 6) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < panjang; i++) {
    pw += chars[crypto.randomInt(chars.length)]
  }
  return pw
}

/**
 * POST /api/team-auth/login
 * Login kapten tim
 */
router.post('/login', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const { username, password } = req.body
    const user = (username || '').trim().toLowerCase()
    const pass = (password || '').trim()

    if (!user || !pass) {
      return res.status(400).json({ error: 'Username dan Password wajib diisi.' })
    }

    const rows = await query(
      `SELECT a.id, a.team_id, a.username, a.password_hash, a.salt,
              t.name AS team_name, t.short_name, t.logo_url, t.tournament_id
       FROM pcl_team_accounts a
       JOIN pcl_teams t ON t.id = a.team_id
       WHERE LOWER(a.username) = ?
       LIMIT 1`,
      [user]
    )

    if (rows && rows.length > 0) {
      const akun = rows[0]
      if (verifikasiPassword(pass, akun.salt, akun.password_hash)) {
        return res.json({
          user: {
            id: akun.id,
            team_id: akun.team_id,
            team_name: akun.team_name,
            short_name: akun.short_name,
            logo_url: akun.logo_url,
            tournament_id: akun.tournament_id
          },
          token: `team-token-${akun.id}`
        })
      }
    }

    return res.status(401).json({ error: 'Username atau Password salah.' })
  } catch (err) {
    console.error('Error login tim:', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

/**
 * POST /api/team-auth/generate
 * Admin: generate akun untuk sebuah tim
 */
router.post('/generate', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const { team_id } = req.body
    if (!team_id) return res.status(400).json({ error: 'team_id wajib diisi.' })

    // Cek tim ada
    const [tim] = await query('SELECT id, name, short_name FROM pcl_teams WHERE id = ?', [team_id])
    if (!tim) return res.status(404).json({ error: 'Tim tidak ditemukan.' })

    // Cek apakah sudah punya akun
    const [existing] = await query('SELECT id FROM pcl_team_accounts WHERE team_id = ?', [team_id])
    if (existing) return res.status(409).json({ error: `Tim ${tim.name} sudah memiliki akun.` })

    const username = `tim_${tim.short_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    const password = generatePassword(6)
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = buatHash(password, salt)
    const id = generateUUID()

    // Cek username unik (jika ada collision, tambah angka)
    let finalUsername = username
    const [dupUser] = await query('SELECT id FROM pcl_team_accounts WHERE username = ?', [username])
    if (dupUser) {
      finalUsername = `${username}${crypto.randomInt(10, 99)}`
    }

    await query(
      'INSERT INTO pcl_team_accounts (id, team_id, username, password_hash, salt) VALUES (?, ?, ?, ?, ?)',
      [id, team_id, finalUsername, passwordHash, salt]
    )

    res.json({ id, username: finalUsername, password, team_name: tim.name, short_name: tim.short_name })
  } catch (err) {
    console.error('Error generate akun tim:', err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/team-auth/list
 * Admin: daftar semua akun tim
 */
router.get('/list', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const rows = await query(
      `SELECT a.id, a.team_id, a.username, a.created_at,
              t.name AS team_name, t.short_name, t.logo_url
       FROM pcl_team_accounts a
       JOIN pcl_teams t ON t.id = a.team_id
       ORDER BY t.name`
    )
    res.json(rows || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/team-auth/reset-password
 * Admin: reset password akun tim, generate password baru
 */
router.post('/reset-password', async (req, res) => {
  await pastikanTabelSiap()
  try {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id akun wajib diisi.' })

    const [akun] = await query(
      `SELECT a.id, a.username, t.name AS team_name FROM pcl_team_accounts a JOIN pcl_teams t ON t.id = a.team_id WHERE a.id = ?`,
      [id]
    )
    if (!akun) return res.status(404).json({ error: 'Akun tidak ditemukan.' })

    const password = generatePassword(6)
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = buatHash(password, salt)

    await query('UPDATE pcl_team_accounts SET password_hash = ?, salt = ? WHERE id = ?', [passwordHash, salt, id])

    res.json({ id, username: akun.username, password, team_name: akun.team_name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/team-auth/:id
 * Admin: hapus akun tim
 */
router.delete('/:id', async (req, res) => {
  await pastikanTabelSiap()
  try {
    await query('DELETE FROM pcl_team_accounts WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
