import { describe, it, expect } from 'vitest'
import { filterPertandingan } from '../../src/composables/usePertandingan.js'

describe('usePertandingan - filterPertandingan', () => {
  const sampleMatches = [
    { id: '1', stage: 'group', group_id: 'grp_a', matchday: 1, status: 'finished' },
    { id: '2', stage: 'group', group_id: 'grp_a', matchday: 2, status: 'scheduled' },
    { id: '3', stage: 'group', group_id: 'grp_b', matchday: 1, status: 'finished' },
    { id: '4', stage: 'round_of_16', group_id: null, matchday: 1, status: 'scheduled' },
    { id: '5', stage: 'final', group_id: null, matchday: 1, status: 'scheduled' }
  ]

  it('memfilter berdasarkan stage tertentu', () => {
    const hasil = filterPertandingan(sampleMatches, { stage: 'group' })
    expect(hasil).toHaveLength(3)
  })

  it('memfilter berdasarkan matchday tertentu', () => {
    const hasil = filterPertandingan(sampleMatches, { stage: 'group', matchday: 1 })
    expect(hasil).toHaveLength(2)
  })

  it('memfilter berdasarkan grup tertentu', () => {
    const hasil = filterPertandingan(sampleMatches, { groupId: 'grp_a' })
    expect(hasil).toHaveLength(2)
  })
})
