import express from 'express'
import { query, generateUUID } from '../config/db.js'

const router = express.Router()

/**
 * Ekstraksi Series Base Key dari knockout_bracket_slot.
 * Misal: "QF 1 (Game 1)" -> "QF 1", "SF 1 (Game 2)" -> "SF 1", "Final (Game 1)" -> "Final"
 */
function ambilBaseSlotKey(slot, stage) {
  if (!slot) {
    if (stage === 'final') return 'Final'
    if (stage === 'semi_final') return 'SF 1'
    if (stage === 'quarter_final') return 'QF 1'
    return 'Laga'
  }
  const cleaned = slot.replace(/\s*\(Game\s*\d+\)/i, '').trim()
  if (stage === 'quarter_final') {
    const m = cleaned.match(/(\d+)/)
    if (m) return `QF ${m[1]}`
    return cleaned || 'QF 1'
  }
  if (stage === 'semi_final') {
    if (/SF\s*1|Semi\s*Final\s*1/i.test(cleaned)) return 'SF 1'
    if (/SF\s*2|Semi\s*Final\s*2/i.test(cleaned)) return 'SF 2'
    return cleaned || 'SF 1'
  }
  if (stage === 'final') return 'Final'
  return cleaned
}

/**
 * Otomatis insert / update record juara musim ke pcl_season_champions
 */
async function catatJuaraOtomatis(finalMatch, juaraId, runnerUpId, skorJuara, skorRunnerUp) {
  try {
    let labelMusim = 'Peak Champions League'
    let namaMusim = `Season ${new Date().getFullYear()}`

    if (finalMatch.tournament_id) {
      const [tourney] = await query('SELECT name, season FROM pcl_tournaments WHERE id = ?', [finalMatch.tournament_id])
      if (tourney) {
        namaMusim = tourney.season || namaMusim
        labelMusim = `${tourney.name} (${namaMusim})`
      }
    }

    const [existing] = await query('SELECT id FROM pcl_season_champions WHERE musim = ? LIMIT 1', [namaMusim])

    const [golEvents, allPlayers] = await Promise.all([
      query(`
        SELECT e.player_id, p.name AS player_name, t.short_name AS team_short
        FROM pcl_match_events e
        LEFT JOIN pcl_players p ON e.player_id = p.id
        LEFT JOIN pcl_teams t ON e.team_id = t.id
        WHERE e.event_type IN ('goal', 'penalty_goal')
      `),
      query(`
        SELECT p.id, p.name, p.goals, p.mvp, t.short_name AS team_short
        FROM pcl_players p
        LEFT JOIN pcl_teams t ON p.team_id = t.id
      `)
    ])

    const hitungGol = {}
    ;(golEvents || []).forEach(ev => {
      const pId = ev.player_id
      if (pId) {
        if (!hitungGol[pId]) {
          hitungGol[pId] = {
            nama: ev.player_name || 'Pemain',
            klub: ev.team_short || 'TIM',
            total: 0
          }
        }
        hitungGol[pId].total += 1
      }
    })

    ;(allPlayers || []).forEach(p => {
      const manualGol = Number(p.goals || 0)
      if (manualGol > 0) {
        if (!hitungGol[p.id]) {
          hitungGol[p.id] = {
            nama: p.name,
            klub: p.team_short || 'TIM',
            total: manualGol
          }
        } else {
          hitungGol[p.id].total += manualGol
        }
      }
    })

    let topScorerNama = '-'
    let topScorerTotal = 0
    const sortedScorer = Object.values(hitungGol).sort((a, b) => b.total - a.total)
    if (sortedScorer.length > 0 && sortedScorer[0].total > 0) {
      topScorerNama = sortedScorer[0].nama
      topScorerTotal = sortedScorer[0].total
    }

    // Hitung MVP dari input manual MVP di pemain, atau fallback ke top scorer
    let mvpNama = '-'
    let mvpRating = 9.0
    const sortedMvp = [...(allPlayers || [])].filter(p => Number(p.mvp || 0) > 0).sort((a, b) => Number(b.mvp || 0) - Number(a.mvp || 0))
    if (sortedMvp.length > 0) {
      mvpNama = sortedMvp[0].name
      mvpRating = Math.min(10, 7.5 + Number(sortedMvp[0].mvp) * 0.5)
    } else if (topScorerTotal > 0) {
      mvpNama = topScorerNama
      mvpRating = Math.min(10, 7 + topScorerTotal * 0.3)
    }

    const skorFinal = `${skorJuara} – ${skorRunnerUp} (BO3)`

    if (existing) {
      await query(
        `UPDATE pcl_season_champions SET
         label_musim = ?, juara_team_id = ?, runner_up_team_id = ?,
         skor_final = ?, top_scorer_nama = ?, top_scorer_total = ?,
         mvp_nama = ?, mvp_rating = ?
         WHERE id = ?`,
        [labelMusim, juaraId, runnerUpId, skorFinal, topScorerNama, topScorerTotal, mvpNama, Number(mvpRating.toFixed(1)), existing.id]
      )
    } else {
      const newChampId = generateUUID()
      await query(
        `INSERT INTO pcl_season_champions
         (id, musim, label_musim, juara_team_id, runner_up_team_id, skor_final, top_scorer_nama, top_scorer_total, mvp_nama, mvp_rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newChampId, namaMusim, labelMusim, juaraId, runnerUpId, skorFinal, topScorerNama, topScorerTotal, mvpNama, Number(mvpRating.toFixed(1))]
      )
    }
  } catch (err) {
    console.error('Error catatJuaraOtomatis:', err)
  }
}

/**
 * Helper evaluator pemenang seri BO3 (menang 2 game atau agregat gol setelah 3 game)
 */
function evaluasiPemenangBO3(games = [], tim1Id, tim2Id) {
  if (!tim1Id || !tim2Id || games.length === 0) {
    return { selesai: false, pemenangId: null, winTim1: 0, winTim2: 0, golTim1: 0, golTim2: 0, totalSelesai: 0, alasan: null }
  }

  let winTim1 = 0
  let winTim2 = 0
  let golTim1 = 0
  let golTim2 = 0
  let totalSelesai = 0
  let g3 = null

  games.forEach(g => {
    if ((g.matchday || 1) === 3) g3 = g
    if (g.status === 'finished') {
      totalSelesai += 1
      const isT1Home = g.home_team_id === tim1Id
      const sT1 = isT1Home ? Number(g.home_score || 0) : Number(g.away_score || 0)
      const sT2 = isT1Home ? Number(g.away_score || 0) : Number(g.home_score || 0)
      golTim1 += sT1
      golTim2 += sT2
      if (sT1 > sT2) winTim1 += 1
      else if (sT2 > sT1) winTim2 += 1
    }
  })

  // 1. Menang mutlak 2 game (2-0 atau 2-1)
  if (winTim1 >= 2) {
    return { selesai: true, pemenangId: tim1Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'menang_game' }
  }
  if (winTim2 >= 2) {
    return { selesai: true, pemenangId: tim2Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'menang_game' }
  }

  // 2. Jika 3 game selesai tapi seri kemenangan (1-1 atau 0-0 karena draw)
  if (totalSelesai >= 3) {
    if (winTim1 > winTim2) {
      return { selesai: true, pemenangId: tim1Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'menang_game' }
    }
    if (winTim2 > winTim1) {
      return { selesai: true, pemenangId: tim2Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'menang_game' }
    }

    // winTim1 === winTim2 -> Evaluasi Total Agregat Gol
    if (golTim1 > golTim2) {
      return { selesai: true, pemenangId: tim1Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'agregat_gol' }
    }
    if (golTim2 > golTim1) {
      return { selesai: true, pemenangId: tim2Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'agregat_gol' }
    }

    // golTim1 === golTim2 -> Cek adu penalti di Game 3 jika ada
    if (g3) {
      const isT1HomeG3 = g3.home_team_id === tim1Id
      const penT1 = isT1HomeG3 ? Number(g3.home_penalty_score || 0) : Number(g3.away_penalty_score || 0)
      const penT2 = isT1HomeG3 ? Number(g3.away_penalty_score || 0) : Number(g3.home_penalty_score || 0)
      if (penT1 > penT2) {
        return { selesai: true, pemenangId: tim1Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'penalti' }
      }
      if (penT2 > penT1) {
        return { selesai: true, pemenangId: tim2Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'penalti' }
      }
    }

    // Default Seed Home / Tim 1
    return { selesai: true, pemenangId: tim1Id, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: 'seed' }
  }

  // Belum tuntas
  return { selesai: false, pemenangId: null, winTim1, winTim2, golTim1, golTim2, totalSelesai, alasan: null }
}

/**
 * Sinkronisasi state seluruh bagan knockout (QF -> SF -> Final)
 * Memastikan tim HANYA maju ke babak berikutnya jika seri BO3 babak sebelumnya SUDAH SELESAI.
 * Jika seri belum selesai / skor diedit ulang, slot di babak berikutnya otomatis di-reset jadi NULL.
 */
export async function sinkronkanSemuaBaganKnockout() {
  try {
    const allKnockoutMatches = await query(
      "SELECT * FROM pcl_matches WHERE stage IN ('quarter_final', 'semi_final', 'final') ORDER BY stage, matchday"
    )
    if (!allKnockoutMatches || allKnockoutMatches.length === 0) return

    // 1. Evaluasi Quarter Finals (QF 1..4)
    const qfMatches = allKnockoutMatches.filter(m => m.stage === 'quarter_final')
    const pemenangQF = {} // { 1: timId|null, 2: timId|null, 3: timId|null, 4: timId|null }

    for (let qfNum = 1; qfNum <= 4; qfNum++) {
      const slotKey = `QF ${qfNum}`
      const qfPattern = new RegExp(`^QF[- ]?0*${qfNum}(\\b|\\D)`, 'i')
      const games = qfMatches.filter(m => (m.knockout_bracket_slot || '').startsWith(slotKey) || qfPattern.test(m.knockout_bracket_slot || ''))
      if (games.length === 0) continue

      const g1 = games.find(m => (m.matchday || 1) === 1) || games[0]
      const g2 = games.find(m => (m.matchday || 1) === 2)
      const tim1Id = g1?.home_team_id || g2?.away_team_id
      const tim2Id = g1?.away_team_id || g2?.home_team_id

      const hasilQF = evaluasiPemenangBO3(games, tim1Id, tim2Id)

      if (hasilQF.selesai && hasilQF.pemenangId) {
        pemenangQF[qfNum] = hasilQF.pemenangId

        // Hapus Game 3 scheduled jika sudah menang 2-0
        if (hasilQF.winTim1 >= 2 || hasilQF.winTim2 >= 2) {
          await query(
            "DELETE FROM pcl_matches WHERE stage = 'quarter_final' AND knockout_bracket_slot LIKE ? AND status = 'scheduled'",
            [`${slotKey} (Game 3)%`]
          )
        }
      } else {
        pemenangQF[qfNum] = null

        // Buat Game 3 Decider jika sudah 2 game selesai dan belum ada pemenang
        if (hasilQF.totalSelesai >= 2 && tim1Id && tim2Id) {
          const game3Ada = games.some(m => (m.knockout_bracket_slot || '').includes('Game 3'))
          if (!game3Ada) {
            const tglGame3 = new Date(g1.scheduled_at ? new Date(g1.scheduled_at) : new Date())
            tglGame3.setHours(tglGame3.getHours() + 1)
            await query(
              `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
               VALUES (?, ?, 'quarter_final', 3, ?, ?, ?, 0, 0, 'scheduled', ?)`,
              [generateUUID(), g1.tournament_id, `${slotKey} (Game 3)`, tim1Id, tim2Id, tglGame3.toISOString().slice(0, 19).replace('T', ' ')]
            )
          }
        }
      }
    }

    // 2. Evaluasi Semi Finals (SF 1 & SF 2)
    const sfMatches = allKnockoutMatches.filter(m => m.stage === 'semi_final')
    const pemenangSF = { 1: null, 2: null }

    for (let sfNum = 1; sfNum <= 2; sfNum++) {
      const slotBaseSF = `SF ${sfNum}`
      const qfHomeNum = sfNum === 1 ? 1 : 3
      const qfAwayNum = sfNum === 1 ? 2 : 4
      const winnerHome = pemenangQF[qfHomeNum] || null
      const winnerAway = pemenangQF[qfAwayNum] || null

      const sfPattern = new RegExp(`^SF[- ]?0*${sfNum}(\\b|\\D)`, 'i')
      let sfGames = sfMatches.filter(m => (m.knockout_bracket_slot || '').startsWith(slotBaseSF) || sfPattern.test(m.knockout_bracket_slot || ''))

      // Jika belum ada row SF dibuat tapi salah satu pemenang QF sudah ada, buat Game 1 & Game 2 SF
      if (sfGames.length === 0 && (winnerHome || winnerAway)) {
        const tglSF = new Date()
        tglSF.setDate(tglSF.getDate() + 2)
        for (let g = 1; g <= 2; g++) {
          const tglGame = new Date(tglSF)
          tglGame.setHours(19 + (sfNum - 1) * 2 + (g - 1), 0, 0, 0)
          const matchId = generateUUID()
          await query(
            `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
             VALUES (?, NULL, 'semi_final', ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
            [
              matchId,
              g,
              `${slotBaseSF} (Game ${g})`,
              g % 2 === 1 ? winnerHome : winnerAway,
              g % 2 === 1 ? winnerAway : winnerHome,
              tglGame.toISOString().slice(0, 19).replace('T', ' ')
            ]
          )
        }
      } else if (sfGames.length > 0) {
        for (const g of sfGames) {
          const isG1 = (g.matchday || 1) % 2 === 1
          const targetHomeId = isG1 ? winnerHome : winnerAway
          const targetAwayId = isG1 ? winnerAway : winnerHome
          if (g.home_team_id !== targetHomeId || g.away_team_id !== targetAwayId) {
            await query(
              'UPDATE pcl_matches SET home_team_id = ?, away_team_id = ? WHERE id = ?',
              [targetHomeId, targetAwayId, g.id]
            )
            g.home_team_id = targetHomeId
            g.away_team_id = targetAwayId
          }
        }
      }

      // Hitung pemenang SF HANYA jika KEDUA pemenang QF sudah ada
      if (winnerHome && winnerAway && sfGames.length > 0) {
        const g1 = sfGames.find(m => (m.matchday || 1) === 1) || sfGames[0]
        const g2 = sfGames.find(m => (m.matchday || 1) === 2)
        const tim1Id = g1?.home_team_id || g2?.away_team_id
        const tim2Id = g1?.away_team_id || g2?.home_team_id

        const hasilSF = evaluasiPemenangBO3(sfGames, tim1Id, tim2Id)

        if (hasilSF.selesai && hasilSF.pemenangId) {
          pemenangSF[sfNum] = hasilSF.pemenangId

          if (hasilSF.winTim1 >= 2 || hasilSF.winTim2 >= 2) {
            await query(
              "DELETE FROM pcl_matches WHERE stage = 'semi_final' AND knockout_bracket_slot LIKE ? AND status = 'scheduled'",
              [`${slotBaseSF} (Game 3)%`]
            )
          }
        } else {
          pemenangSF[sfNum] = null
          if (hasilSF.totalSelesai >= 2 && tim1Id && tim2Id) {
            const game3Ada = sfGames.some(m => (m.knockout_bracket_slot || '').includes('Game 3'))
            if (!game3Ada) {
              const tglGame3 = new Date(g1.scheduled_at ? new Date(g1.scheduled_at) : new Date())
              tglGame3.setHours(tglGame3.getHours() + 1)
              await query(
                `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
                 VALUES (?, ?, 'semi_final', 3, ?, ?, ?, 0, 0, 'scheduled', ?)`,
                [generateUUID(), g1.tournament_id, `${slotBaseSF} (Game 3)`, tim1Id, tim2Id, tglGame3.toISOString().slice(0, 19).replace('T', ' ')]
              )
            }
          }
        }
      }
    }

    // 3. Evaluasi Grand Final
    const finalMatches = allKnockoutMatches.filter(m => m.stage === 'final')
    const winnerSF1 = pemenangSF[1] || null
    const winnerSF2 = pemenangSF[2] || null

    if (finalMatches.length === 0 && (winnerSF1 || winnerSF2)) {
      const tglFinal = new Date()
      tglFinal.setDate(tglFinal.getDate() + 4)
      for (let g = 1; g <= 2; g++) {
        const tglGame = new Date(tglFinal)
        tglGame.setHours(19 + g - 1, 0, 0, 0)
        const matchId = generateUUID()
        await query(
          `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
           VALUES (?, NULL, 'final', ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
          [
            matchId,
            g,
            `Final (Game ${g})`,
            g % 2 === 1 ? winnerSF1 : winnerSF2,
            g % 2 === 1 ? winnerSF2 : winnerSF1,
            tglGame.toISOString().slice(0, 19).replace('T', ' ')
          ]
        )
      }
    } else if (finalMatches.length > 0) {
      for (const g of finalMatches) {
        const isG1 = (g.matchday || 1) % 2 === 1
        const targetHomeId = isG1 ? winnerSF1 : winnerSF2
        const targetAwayId = isG1 ? winnerSF2 : winnerSF1
        if (g.home_team_id !== targetHomeId || g.away_team_id !== targetAwayId) {
          await query(
            'UPDATE pcl_matches SET home_team_id = ?, away_team_id = ? WHERE id = ?',
            [targetHomeId, targetAwayId, g.id]
          )
          g.home_team_id = targetHomeId
          g.away_team_id = targetAwayId
        }
      }
    }

    // Catat Juara jika Grand Final selesai
    if (finalMatches.length > 0 && winnerSF1 && winnerSF2) {
      const g1 = finalMatches.find(m => (m.matchday || 1) === 1) || finalMatches[0]
      const g2 = finalMatches.find(m => (m.matchday || 1) === 2)
      const tim1Id = g1?.home_team_id || g2?.away_team_id
      const tim2Id = g1?.away_team_id || g2?.home_team_id

      let winTim1 = 0
      let winTim2 = 0
      let golTim1 = 0
      let golTim2 = 0
      let totalSelesai = 0

      finalMatches.forEach(g => {
        if (g.status === 'finished') {
          totalSelesai += 1
          const isT1Home = g.home_team_id === tim1Id
          const sT1 = isT1Home ? Number(g.home_score || 0) : Number(g.away_score || 0)
          const sT2 = isT1Home ? Number(g.away_score || 0) : Number(g.home_score || 0)
          golTim1 += sT1
          golTim2 += sT2
          if (sT1 > sT2) winTim1 += 1
          else if (sT2 > sT1) winTim2 += 1
        }
      })

      const isMenangMutlak = winTim1 >= 2 || winTim2 >= 2
      const isSelesai3Game = totalSelesai >= 3 && golTim1 !== golTim2
      if (isMenangMutlak || isSelesai3Game) {
        const winnerId = isMenangMutlak
          ? (winTim1 >= 2 ? tim1Id : tim2Id)
          : (golTim1 > golTim2 ? tim1Id : tim2Id)
        const loserId = isMenangMutlak
          ? (winTim1 >= 2 ? tim2Id : tim1Id)
          : (golTim1 > golTim2 ? tim2Id : tim1Id)
        await catatJuaraOtomatis(g1, winnerId, loserId, Math.max(winTim1, winTim2), Math.min(winTim1, winTim2))
      }
    }
  } catch (err) {
    console.error('Error sinkronkanSemuaBaganKnockout:', err)
  }
}

/**
 * POST /api/knockout/generate
 * Generate bracket knockout
 */
router.post('/generate', async (req, res) => {
  try {
    const { daftarTimTerpilih = [], kapasitas = 8, customTournamentId = null } = req.body
    let tournamentId = customTournamentId

    if (!tournamentId) {
      const [turData] = await query('SELECT id FROM pcl_tournaments ORDER BY created_at DESC LIMIT 1')
      if (turData?.id) {
        tournamentId = turData.id
      } else {
        tournamentId = generateUUID()
        await query(
          'INSERT INTO pcl_tournaments (id, name, season, status) VALUES (?, ?, ?, ?)',
          [tournamentId, 'Peak Champions League', 'Season 1', 'knockout']
        )
      }
    }

    // Hapus semua laga sebelumnya yang belum selesai
    await query("DELETE FROM pcl_matches WHERE status != 'finished'")

    const numTeams = Number(kapasitas) || daftarTimTerpilih.length
    let startingStage = 'quarter_final'
    if (numTeams >= 32) startingStage = 'round_of_32'
    else if (numTeams >= 16) startingStage = 'round_of_16'
    else if (numTeams <= 4) startingStage = 'semi_final'

    const jumlahLagaBabak1 = Math.floor(numTeams / 2)
    const besok = new Date()
    besok.setDate(besok.getDate() + 1)

    const createdMatches = []

    if (startingStage === 'semi_final') {
      for (let i = 0; i < jumlahLagaBabak1; i++) {
        const homeTeam = daftarTimTerpilih[i * 2] || null
        const awayTeam = daftarTimTerpilih[i * 2 + 1] || null
        const slotBase = `SF ${i + 1}`

        for (let g = 1; g <= 2; g++) {
          const tglLaga = new Date(besok)
          tglLaga.setHours(19 + g - 1, 0, 0, 0)
          const mId = generateUUID()
          const slotLabel = `${slotBase} (Game ${g})`
          const homeId = g % 2 === 1 ? homeTeam?.id || null : awayTeam?.id || null
          const awayId = g % 2 === 1 ? awayTeam?.id || null : homeTeam?.id || null
          const tglStr = tglLaga.toISOString().slice(0, 19).replace('T', ' ')

          await query(
            `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
             VALUES (?, ?, 'semi_final', ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
            [mId, tournamentId, g, slotLabel, homeId, awayId, tglStr]
          )
          createdMatches.push(mId)
        }
      }
    } else if (startingStage === 'quarter_final') {
      // 8 Besar -> 4 Pasang Laga format BO3 (Game 1 & Game 2 dibuat awal)
      for (let i = 0; i < 4; i++) {
        const homeTeam = daftarTimTerpilih[i * 2] || null
        const awayTeam = daftarTimTerpilih[i * 2 + 1] || null
        const slotBase = `QF ${i + 1}`

        for (let g = 1; g <= 2; g++) {
          const tglLaga = new Date(besok)
          tglLaga.setHours(19 + (i % 2) * 2 + (g - 1), 0, 0, 0)
          const mId = generateUUID()
          const slotLabel = `${slotBase} (Game ${g})`
          const homeId = g % 2 === 1 ? homeTeam?.id || null : awayTeam?.id || null
          const awayId = g % 2 === 1 ? awayTeam?.id || null : homeTeam?.id || null
          const tglStr = tglLaga.toISOString().slice(0, 19).replace('T', ' ')

          await query(
            `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
             VALUES (?, ?, 'quarter_final', ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
            [mId, tournamentId, g, slotLabel, homeId, awayId, tglStr]
          )
          createdMatches.push(mId)
        }
      }
    } else {
      for (let i = 0; i < jumlahLagaBabak1; i++) {
        const homeTeam = daftarTimTerpilih[i * 2] || null
        const awayTeam = daftarTimTerpilih[i * 2 + 1] || null
        let slotLabel = `R1-${i + 1}`
        if (startingStage === 'round_of_32') slotLabel = `R32-${i + 1}`
        else if (startingStage === 'round_of_16') slotLabel = `R16-${i + 1}`

        const tglLaga = new Date(besok)
        const jamSlot = 19 + (i % 3)
        tglLaga.setHours(jamSlot, 0, 0, 0)
        const mId = generateUUID()
        const tglStr = tglLaga.toISOString().slice(0, 19).replace('T', ' ')

        await query(
          `INSERT INTO pcl_matches (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
           VALUES (?, ?, ?, 1, ?, ?, ?, 0, 0, 'scheduled', ?)`,
          [mId, tournamentId, startingStage, slotLabel, homeTeam?.id || null, awayTeam?.id || null, tglStr]
        )
        createdMatches.push(mId)
      }
    }

    res.json({ success: true, count: createdMatches.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/knockout/advance
 * Majukan pemenang laga knockout ke babak selanjutnya
 */
router.post('/advance', async (req, res) => {
  try {
    const { match_id, home_score, away_score } = req.body

    const [currentMatch] = await query(
      'SELECT id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, scheduled_at FROM pcl_matches WHERE id = ?',
      [match_id]
    )

    if (!currentMatch) {
      return res.status(404).json({ error: 'Pertandingan tidak ditemukan.' })
    }

    const currentStage = currentMatch.stage

    // === BO3 HANDLER (QUARTER FINAL / 8 BESAR, SEMI FINAL, & GRAND FINAL) ===
    if (currentStage === 'quarter_final' || currentStage === 'semi_final' || currentStage === 'final') {
      await sinkronkanSemuaBaganKnockout()
      return res.json({ success: true, message: 'Seri BO3 berhasil disinkronkan.' })
    }

    // === SINGLE ELIMINATION HANDLER (R32, R16) ===
    const hScore = Number(home_score)
    const aScore = Number(away_score)
    if (hScore === aScore) {
      return res.json({ message: 'Skor imbang, tidak ada pemenang langsung.' })
    }

    const winnerId = hScore > aScore ? currentMatch.home_team_id : currentMatch.away_team_id
    if (!winnerId) {
      return res.json({ message: 'ID Pemenang tidak valid.' })
    }

    const currentSlot = currentMatch.knockout_bracket_slot || ''
    const slotNumberMatch = currentSlot.match(/(\d+)/)
    const currentSlotNum = slotNumberMatch ? parseInt(slotNumberMatch[1], 10) : 1

    const targetSlotNumber = Math.ceil(currentSlotNum / 2)
    const isHomeSlot = currentSlotNum % 2 !== 0

    let nextStage = null
    let targetSlotLabel = ''

    if (currentStage === 'round_of_32') {
      nextStage = 'round_of_16'
      targetSlotLabel = `R16-${targetSlotNumber}`
    } else if (currentStage === 'round_of_16') {
      nextStage = 'quarter_final'
      targetSlotLabel = `QF ${targetSlotNumber}`
    }

    if (!nextStage) {
      return res.json({ message: 'Tidak ada babak lanjutan.' })
    }

    // Jika maju ke Quarter Final (Babak BO3): Buat / update Game 1 & Game 2
    if (nextStage === 'quarter_final') {
      let queryQF = 'SELECT id, knockout_bracket_slot, home_team_id, away_team_id, matchday FROM pcl_matches WHERE stage = ?'
      const paramsQF = ['quarter_final']
      if (currentMatch.tournament_id) {
        queryQF += ' AND tournament_id = ?'
        paramsQF.push(currentMatch.tournament_id)
      }

      const existingQFMatches = await query(queryQF, paramsQF)
      const qfMatchesTarget = existingQFMatches.filter(m => (m.knockout_bracket_slot || '').startsWith(targetSlotLabel))

      if (qfMatchesTarget.length > 0) {
        for (const qfM of qfMatchesTarget) {
          const col = isHomeSlot
            ? (qfM.matchday % 2 === 1 ? 'home_team_id' : 'away_team_id')
            : (qfM.matchday % 2 === 1 ? 'away_team_id' : 'home_team_id')
          await query(`UPDATE pcl_matches SET ${col} = ? WHERE id = ?`, [winnerId, qfM.id])
        }
      } else {
        const tglQF = new Date(currentMatch.scheduled_at ? new Date(currentMatch.scheduled_at) : new Date())
        tglQF.setDate(tglQF.getDate() + 2)

        for (let g = 1; g <= 2; g++) {
          const tglGame = new Date(tglQF)
          tglGame.setHours(19 + g - 1, 0, 0, 0)
          const mId = generateUUID()
          await query(
            `INSERT INTO pcl_matches
             (id, tournament_id, stage, matchday, knockout_bracket_slot, home_team_id, away_team_id, home_score, away_score, status, scheduled_at)
             VALUES (?, ?, 'quarter_final', ?, ?, ?, ?, 0, 0, 'scheduled', ?)`,
            [
              mId,
              currentMatch.tournament_id || null,
              g,
              `${targetSlotLabel} (Game ${g})`,
              isHomeSlot ? (g % 2 === 1 ? winnerId : null) : (g % 2 === 1 ? null : winnerId),
              !isHomeSlot ? (g % 2 === 1 ? winnerId : null) : (g % 2 === 1 ? null : winnerId),
              tglGame.toISOString().slice(0, 19).replace('T', ' ')
            ]
          )
        }
      }
      return res.json({ success: true, message: 'Laga quarter final BO3 berhasil dibuat/diperbarui.' })
    }

    res.json({ success: true, message: 'Pemenang babak berhasil dimajukan.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
