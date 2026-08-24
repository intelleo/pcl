import { describe, it, expect } from 'vitest'
import { supabase } from '../../src/lib/supabase.js'

describe('Supabase Client Module', () => {
  it('berhasil menginisialisasi instance supabase', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
