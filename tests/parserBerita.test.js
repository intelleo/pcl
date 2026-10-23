import { describe, it, expect } from 'vitest'
import { parseKontenBerita } from '../src/lib/parserBerita.js'

describe('parseKontenBerita', () => {
  it('harus memparsing bold, italic, dan strikethrough dengan benar', () => {
    const raw = 'Ini adalah **teks tebal**, *teks miring*, dan ~~teks dicoret~~.'
    const blok = parseKontenBerita(raw)
    expect(blok).toHaveLength(1)
    expect(blok[0].tipe).toBe('paragraf')
    expect(blok[0].html).toContain('<strong class="font-bold text-ink-900">teks tebal</strong>')
    expect(blok[0].html).toContain('<em class="italic">teks miring</em>')
    expect(blok[0].html).toContain('<del class="line-through text-slate-400">teks dicoret</del>')
  })

  it('harus memparsing gambar inline fleksibel', () => {
    const raw = `Paragraf pembuka.

![Selebrasi Gol Menit 90](/uploads/news/gol.jpg)

Paragraf penutup setelah foto.`

    const blok = parseKontenBerita(raw)
    expect(blok).toHaveLength(3)
    expect(blok[0].tipe).toBe('paragraf')
    expect(blok[1].tipe).toBe('gambar')
    expect(blok[1].alt).toBe('Selebrasi Gol Menit 90')
    expect(blok[1].url).toBe('/uploads/news/gol.jpg')
    expect(blok[2].tipe).toBe('paragraf')
  })

  it('harus memparsing heading, quote, dan list', () => {
    const raw = `## Judul Bagian
> Kutipan penting dari pelatih
- Poin pertama
- Poin kedua`

    const blok = parseKontenBerita(raw)
    expect(blok).toHaveLength(3)
    expect(blok[0].tipe).toBe('heading')
    expect(blok[1].tipe).toBe('kutipan')
    expect(blok[2].tipe).toBe('list')
    expect(blok[2].items).toHaveLength(2)
  })

  it('harus membersihkan tag HTML berbahaya untuk mencegah XSS', () => {
    const raw = '<script>alert("xss")</script> **Aman**'
    const blok = parseKontenBerita(raw)
    expect(blok[0].html).not.toContain('<script>')
    expect(blok[0].html).toContain('&lt;script&gt;')
    expect(blok[0].html).toContain('<strong class="font-bold text-ink-900">Aman</strong>')
  })
})
