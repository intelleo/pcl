/**
 * Parser Markdown Ringan untuk Konten Berita PCL
 * Mendukung: bold, italic, strikethrough, heading 3, quote, list, dan foto inline.
 */

function sanitasiHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Format teks inline: link, bold, italic, strike
 */
function parseInline(teksSanitasi) {
  let hasil = teksSanitasi

  // Bold & Italic kombinasi (***teks***)
  hasil = hasil.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')

  // Bold (**teks**)
  hasil = hasil.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-ink-900">$1</strong>')

  // Italic (*teks*)
  hasil = hasil.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

  // Strikethrough (~~teks~~)
  hasil = hasil.replace(/~~(.+?)~~/g, '<del class="line-through text-slate-400">$1</del>')

  // Auto link URL
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi
  hasil = hasil.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-ucl-600 hover:text-ucl-700 font-semibold underline underline-offset-2 break-all inline-flex items-center gap-0.5">${url}</a>`
  })

  return hasil
}

/**
 * Konversi teks/markdown artikel menjadi blok token untuk rendering fleksibel.
 * @param {string} rawText
 * @returns {Array<{ tipe: string, konten?: string, alt?: string, url?: string, items?: string[] }>}
 */
export function parseKontenBerita(rawText) {
  if (!rawText) return []

  const baris = String(rawText).split(/\r?\n/)
  const blok = []
  let bufferParagraf = []

  function flushParagraf() {
    if (bufferParagraf.length > 0) {
      const teksGabung = bufferParagraf.join(' ').trim()
      if (teksGabung) {
        blok.push({
          tipe: 'paragraf',
          html: parseInline(sanitasiHtml(teksGabung))
        })
      }
      bufferParagraf = []
    }
  }

  for (let i = 0; i < baris.length; i++) {
    const b = baris[i].trim()

    // Baris kosong => pemisah paragraf
    if (!b) {
      flushParagraf()
      continue
    }

    // Gambar Markdown: ![alt](url)
    const gambarMatch = b.match(/^!\[(.*?)\]\((.+?)\)$/)
    if (gambarMatch) {
      flushParagraf()
      blok.push({
        tipe: 'gambar',
        alt: sanitasiHtml(gambarMatch[1] || 'Foto Dokumentasi PCL'),
        url: gambarMatch[2].trim()
      })
      continue
    }

    // Heading: ### Sub Judul atau ## Sub Judul
    const headingMatch = b.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      flushParagraf()
      blok.push({
        tipe: 'heading',
        level: headingMatch[1].length,
        html: parseInline(sanitasiHtml(headingMatch[2]))
      })
      continue
    }

    // Blockquote: > Kutipan
    const quoteMatch = b.match(/^>\s*(.+)$/)
    if (quoteMatch) {
      flushParagraf()
      blok.push({
        tipe: 'kutipan',
        html: parseInline(sanitasiHtml(quoteMatch[1]))
      })
      continue
    }

    // List item: - Poin atau * Poin
    const listMatch = b.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      flushParagraf()
      // Jika blok sebelumnya bukan list, buat list baru
      const last = blok[blok.length - 1]
      if (last && last.tipe === 'list') {
        last.items.push(parseInline(sanitasiHtml(listMatch[1])))
      } else {
        blok.push({
          tipe: 'list',
          items: [parseInline(sanitasiHtml(listMatch[1]))]
        })
      }
      continue
    }

    // Teks paragraf biasa
    bufferParagraf.push(b)
  }

  flushParagraf()
  return blok
}
