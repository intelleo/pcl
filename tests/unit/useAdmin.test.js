import { describe, it, expect } from 'vitest'
import { validasiInputSkor } from '../../src/composables/useAdmin.js'

describe('useAdmin - validasiInputSkor', () => {
  it('menolak skor bernilai negatif atau bukan angka', () => {
    expect(validasiInputSkor(-1, 2).valid).toBe(false)
    expect(validasiInputSkor('abc', 2).valid).toBe(false)
  })

  it('menerima skor yang valid', () => {
    expect(validasiInputSkor(3, 1).valid).toBe(true)
    expect(validasiInputSkor(0, 0).valid).toBe(true)
  })
})
