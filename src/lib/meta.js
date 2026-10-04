/**
 * Utilitas untuk mengelola Open Graph (OG) meta tags secara dinamis
 * Digunakan agar preview link di WhatsApp, Telegram, Facebook, dan Twitter tampil dengan gambar & judul artikel.
 */

export function perbaruiMetaHalaman({
  judul = 'Peak Champions League (PCL)',
  deskripsi = 'Turnamen Game Flash Peak - Format 16 Klub Group Stage hingga Knockout Best of 3.',
  gambar = '',
  tipe = 'article',
  url = ''
} = {}) {
  // 1. Update Title Dokumen
  document.title = judul ? `${judul} - PCL 2026` : 'Peak Champions League (PCL)'

  const targetUrl = url || window.location.href

  // Helper untuk set / buat tag meta
  const setMeta = (attributeName, attributeValue, content) => {
    if (!content) return
    let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attributeName, attributeValue)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  // 2. Open Graph Tags (WhatsApp, Facebook, Telegram)
  setMeta('property', 'og:title', judul)
  setMeta('property', 'og:description', deskripsi)
  setMeta('property', 'og:type', tipe)
  setMeta('property', 'og:url', targetUrl)
  setMeta('property', 'og:site_name', 'Peak Champions League')

  // Gambar Open Graph (Cover Artikel atau Fallback Banner PCL)
  let fullImageUrl = gambar
  if (!fullImageUrl && typeof window !== 'undefined') {
    fullImageUrl = `${window.location.origin}/img/hero-banner.webp`
  } else if (fullImageUrl && fullImageUrl.startsWith('/') && typeof window !== 'undefined') {
    fullImageUrl = `${window.location.origin}${fullImageUrl}`
  }

  if (fullImageUrl) {
    setMeta('property', 'og:image', fullImageUrl)
    setMeta('property', 'og:image:secure_url', fullImageUrl)
    setMeta('property', 'og:image:alt', judul)
    setMeta('name', 'twitter:image', fullImageUrl)
  }

  // 3. Twitter Card Tags
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', judul)
  setMeta('name', 'twitter:description', deskripsi)
}
