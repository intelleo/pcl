import { computed } from 'vue'

export function useEstimasiJadwal(hasilDrawing, jamMulai, jedaMenit) {
  return computed(() => {
    let totalLaga = 0
    const maxMd = 3
    Object.values(hasilDrawing.value).forEach((timList) => {
      const n = timList.length
      if (n === 4) totalLaga += 6
      else if (n >= 2) totalLaga += (n * (n - 1)) / 2
    })
    if (totalLaga === 0) return null

    const jeda = Number(jedaMenit.value) || 15
    const [h, m] = (jamMulai.value || '19:00').split(':').map(Number)
    const pad = (v) => String(v).padStart(2, '0')

    const getTimeStr = (mdIndex) => {
      const d = new Date()
      d.setHours(isNaN(h) ? 19 : h, isNaN(m) ? 0 : m, 0, 0)
      const target = new Date(d.getTime() + mdIndex * jeda * 60 * 1000)
      return `${pad(target.getHours())}:${pad(target.getMinutes())}`
    }

    return {
      totalLaga,
      maxMd,
      md1: getTimeStr(0),
      md2: getTimeStr(1),
      md3: getTimeStr(2)
    }
  })
}
