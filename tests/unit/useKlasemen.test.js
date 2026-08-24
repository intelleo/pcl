import { describe, it, expect } from 'vitest'
import { hitungKlasemen } from '../../src/composables/useKlasemen.js'

describe('useKlasemen - hitungKlasemen', () => {
  const timDaftar = [
    { id: '1', name: 'Barcelona FC', short_name: 'BAR' },
    { id: '2', name: 'Real Madrid', short_name: 'RMA' },
    { id: '3', name: 'Manchester United', short_name: 'MUN' },
    { id: '4', name: 'Manchester City', short_name: 'MCI' }
  ]

  it('mengembalikan klasemen awal dengan poin 0 jika belum ada pertandingan finished', () => {
    const hasil = hitungKlasemen([], timDaftar)
    expect(hasil).toHaveLength(4)
    expect(hasil[0].points).toBe(0)
    expect(hasil[0].played).toBe(0)
  })

  it('menghitung poin, selisih gol, dan mengurutkan peringkat dengan benar', () => {
    const pertandinganList = [
      // BAR 3 - 1 RMA (BAR win, RMA lose)
      { home_team_id: '1', away_team_id: '2', home_score: 3, away_score: 1, status: 'finished' },
      // MUN 2 - 2 MCI (MUN draw, MCI draw)
      { home_team_id: '3', away_team_id: '4', home_score: 2, away_score: 2, status: 'finished' },
      // BAR 2 - 0 MUN (BAR win, MUN lose)
      { home_team_id: '1', away_team_id: '3', home_score: 2, away_score: 0, status: 'finished' }
    ]

    const hasil = hitungKlasemen(pertandinganList, timDaftar)

    // BAR harus peringkat 1 (2 main, 2 menang, 6 poin, GF 5, GA 1, GD +4)
    expect(hasil[0].team_id).toBe('1')
    expect(hasil[0].played).toBe(2)
    expect(hasil[0].won).toBe(2)
    expect(hasil[0].drawn).toBe(0)
    expect(hasil[0].lost).toBe(0)
    expect(hasil[0].goals_for).toBe(5)
    expect(hasil[0].goals_against).toBe(1)
    expect(hasil[0].goal_difference).toBe(4)
    expect(hasil[0].points).toBe(6)
    expect(hasil[0].rank).toBe(1)

    // Posisi 2 adalah MCI (1 main, 0 menang, 1 seri, 1 poin, GD 0, GF 2)
    expect(hasil[1].team_id).toBe('4')
    expect(hasil[1].points).toBe(1)

    // Posisi 3 adalah MUN (2 main, 0 menang, 1 seri, 1 kalah, 1 poin, GD -2)
    expect(hasil[2].team_id).toBe('3')
    expect(hasil[2].points).toBe(1)

    // Posisi 4 adalah RMA (1 main, 0 menang, 0 seri, 1 kalah, 0 poin, GD -2)
    expect(hasil[3].team_id).toBe('2')
    expect(hasil[3].points).toBe(0)
  })
})
