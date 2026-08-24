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

  const samplePlayers = [
    { id: 'p1', name: 'Messi', team_id: '1', stats: { goal: 2, assist: 1, pass: 80, def: 5, mvp: 2 } },
    { id: 'p2', name: 'Ronaldo', team_id: '2', stats: { goal: 1, assist: 0, pass: 40, def: 2, mvp: 1 } },
    { id: 'p3', name: 'Pedri', team_id: '1', stats: { goal: 0, assist: 1, pass: 120, def: 15, mvp: 0 } },
    { id: 'p4', name: 'Van Dijk', team_id: '13', stats: { goal: 0, assist: 0, pass: 90, def: 45, mvp: 1 } }
  ]

  it('mengagregasi data top scorer, top assist, top pass, top defense, dan top mvp', () => {
    const { topScorer, topAssist, topPass, topDefense, topMvp } = hitungStatistikPemain(events, samplePlayers)

    expect(topScorer.length).toBeGreaterThan(0)
    expect(topScorer[0].player_id).toBe('p1')
    expect(topScorer[0].total).toBe(2)

    expect(topPass[0].name).toBe('Pedri')
    expect(topPass[0].total).toBe(120)

    expect(topDefense[0].name).toBe('Van Dijk')
    expect(topDefense[0].total).toBe(45)

    expect(topMvp[0].name).toBe('Messi')
    expect(topMvp[0].total).toBe(2)
  })
})
