import express from 'express'

const router = express.Router()

const PENGGUNA_ADMIN_DEFAULT = [
  { username: 'admin', email: 'admin@pcl.com', nama: 'Super Admin PCL', role: 'admin' },
  { username: 'panitia', email: 'panitia@pcl.com', nama: 'Panitia Turnamen', role: 'panitia' }
]

/**
 * POST /api/auth/login
 * Login Admin / Panitia Turnamen
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const idBersih = (username || email || '').trim().toLowerCase()
    const passBersih = (password || '').trim()

    if (!idBersih || !passBersih) {
      return res.status(400).json({ error: 'Username / Email dan Password wajib diisi.' })
    }

    const kecocokan = PENGGUNA_ADMIN_DEFAULT.find(
      u => u.username.toLowerCase() === idBersih || u.email.toLowerCase() === idBersih
    )

    if (kecocokan && (passBersih === 'admin123' || passBersih === 'pcl2026')) {
      const userObj = {
        id: `usr-${kecocokan.username}`,
        username: kecocokan.username,
        email: kecocokan.email,
        nama: kecocokan.nama,
        role: kecocokan.role
      }
      return res.json({ user: userObj, token: `token-${userObj.id}` })
    }

    return res.status(401).json({ error: 'Username/Email atau Password salah. (Default: admin / admin123)' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
