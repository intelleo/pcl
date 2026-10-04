import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function inisialisasiDatabase() {
  console.log('🔄 Memulai inisialisasi database MySQL PCL...')

  const host = process.env.DB_HOST || 'localhost'
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''
  const dbName = process.env.DB_NAME || 'pcl_tournament'
  const port = Number(process.env.DB_PORT || 3306)

  try {
    // 1. Koneksi awal tanpa database untuk memastikan DB exists
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    })

    console.log(`✅ Terhubung ke server MySQL di ${host}:${port}`)

    // 2. Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
    await connection.query(`USE \`${dbName}\`;`)
    console.log(`✅ Database \`${dbName}\` siap digunakan.`)

    // 3. Baca dan jalankan skrip schema_mysql.sql langsung via multipleStatements
    const sqlPath = path.join(__dirname, 'schema_mysql.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;')
    await connection.query(sqlContent)
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;')

    console.log('✅ Skema tabel, relasi, indeks, dan data seed awal berhasil dieksekusi.')
    await connection.end()
    console.log('🎉 Inisialisasi database selesai 100%!')
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database MySQL:', error.message)
    console.error('ℹ️ Pastikan service MySQL (XAMPP/Laragon/Docker) sudah berjalan dan kredensial .env sudah benar.')
    process.exit(1)
  }
}

inisialisasiDatabase()
