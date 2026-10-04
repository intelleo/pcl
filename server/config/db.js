import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pcl_tournament',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  dateStrings: true
})

/**
 * Generate UUID v4 standar
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * Helper eksekusi query tunggal dengan parameter
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

/**
 * Helper eksekusi transaksi database
 */
export async function transaction(callback) {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export default pool
