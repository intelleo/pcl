/**
 * Persistent Cache Engine dengan LocalStorage + In-Memory Fallback
 * Data langsung tersedia instan saat browser di-refresh (F5).
 */

const inMemoryStore = new Map()
const PREFIX = 'pcl_cache_'

/**
 * Mengambil data dari cache (Memory -> LocalStorage).
 * @param {string} key - Identifier cache
 * @returns {*} Data atau null jika expired / tidak ada.
 */
export function getCache(key) {
  // 1. Cek In-Memory dulu
  const memItem = inMemoryStore.get(key)
  if (memItem) {
    if (Date.now() <= memItem.expiry) {
      return memItem.data
    }
    inMemoryStore.delete(key)
  }

  // 2. Fallback cek LocalStorage (tahan F5 refresh)
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (Date.now() <= parsed.expiry) {
      // Re-populate ke memory
      inMemoryStore.set(key, parsed)
      return parsed.data
    }
    localStorage.removeItem(PREFIX + key)
  } catch (e) {}

  return null
}

/**
 * Menyimpan data ke Cache Memory & LocalStorage dengan batas waktu kadaluarsa (TTL).
 * @param {string} key - Identifier cache
 * @param {*} data - Data yang ingin disimpan
 * @param {number} ttlMs - Masa aktif cache dalam milidetik (default 60000ms / 60 detik)
 */
export function setCache(key, data, ttlMs = 60000) {
  const item = {
    data,
    expiry: Date.now() + ttlMs
  }

  inMemoryStore.set(key, item)

  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(item))
  } catch (e) {}
}

/**
 * Menghapus cache (Memory + LocalStorage).
 * Dipanggil saat admin mutasi data.
 * @param {string|RegExp|null} keyPattern
 */
export function invalidateCache(keyPattern = null) {
  if (!keyPattern) {
    inMemoryStore.clear()
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(PREFIX)) keysToRemove.push(k)
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch (e) {}
    return
  }

  if (typeof keyPattern === 'string') {
    inMemoryStore.delete(keyPattern)
    try {
      localStorage.removeItem(PREFIX + keyPattern)
    } catch (e) {}
    return
  }

  if (keyPattern instanceof RegExp) {
    for (const key of inMemoryStore.keys()) {
      if (keyPattern.test(key)) {
        inMemoryStore.delete(key)
      }
    }
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(PREFIX)) {
          const rawKey = k.replace(PREFIX, '')
          if (keyPattern.test(rawKey)) {
            keysToRemove.push(k)
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch (e) {}
  }
}
