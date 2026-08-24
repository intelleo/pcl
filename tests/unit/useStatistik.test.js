import { describe, it, expect } from 'vitest'
import { hitungStatistikPemain } from '../../src/composables/useStatistik.js'

describe('useStatistik - hitungStatistikPemain', () => {
  const events = [
    { player_id: 'p1', player: { name: 'Messi' }, team: { short_name: 'BAR' }, event_type: 'goal' },
    { player_id: 'p1', player: { name: 'Messi' }, team: { short_name: 'BAR' }, event_type: 'goal' },
    { player_id: 'p2', player: { name: 'Ronaldo' }, team: { short_name: 'RMA' }, event_type: 'goal' },
    { player_id: 'p3', player: { name: 'Pedri' }, team: { short_name: 'BAR' }, assist_player_id: 'p3', event_type: 'assist' },
    { player_id: 'p2', player: { name: 'Ronaldo' }, team: { short_name: 'RMA' }, event_type: 'yellow_card' }
  ]

  it('mengagregasi jumlah gol pencetak gol terbanyak', () => {
    const { topScorer } = hitungStatistikPemain(events)
    expect(topScorer).toHaveLength(2)
    expect(topScorer[0].player_id).toBe('p1')
    expect(topScorer[0].total).toBe(2)
    expect(topScorer[1].player_id).toBe('p2')
    expect(topScorer[1].total).toBe(1)
  })
})
