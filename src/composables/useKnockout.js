import { api } from '../lib/api.js'
import { invalidateCache } from '../lib/cache.js'

/**
 * Generate jadwal knockout bracket dari daftar tim terpilih via backend API.
 */
export async function generateJadwalKnockoutSupabase(daftarTimTerpilih, kapasitas = 8, customTournamentId = null) {
  try {
    const res = await api.generateKnockout({
      daftarTimTerpilih,
      kapasitas: Number(kapasitas) || daftarTimTerpilih.length,
      customTournamentId
    })
    invalidateCache()
    return { data: res }
  } catch (error) {
    console.error('Gagal generate jadwal knockout:', error)
    return { error }
  }
}

/**
 * Ekstraksi Series Base Key dari knockout_bracket_slot.
 * Misal: "QF 1 (Game 1)" -> "QF 1", "SF 1 (Game 2)" -> "SF 1", "Final (Game 1)" -> "Final"
 */
export function ambilBaseSlotKey(slot, stage) {
  if (!slot) {
    if (stage === 'final') return 'Final'
    if (stage === 'semi_final') return 'SF 1'
    if (stage === 'quarter_final') return 'QF 1'
    return 'Laga'
  }
  const cleaned = slot.replace(/\s*\(Game\s*\d+\)/i, '').trim()
  if (stage === 'quarter_final') {
    const m = cleaned.match(/(\d+)/)
    return m ? `QF ${m[1]}` : (cleaned || 'QF 1')
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
 * Menghitung skor seri BO3 (menang game) dan agregat gol untuk laga quarter_final, semi_final, atau final.
 * @param {Object} laga - Objek laga saat ini
 * @param {Array} semuaLaga - Daftar seluruh laga (untuk mencari saudara game dalam seri)
 * @returns {Object|null}
 */
export function hitungStatusSeriBO3(laga, semuaLaga = []) {
  if (!laga) return null
  const stage = laga.stage
  if (stage !== 'quarter_final' && stage !== 'semi_final' && stage !== 'final') return null

  const baseSlot = ambilBaseSlotKey(laga.knockout_bracket_slot, stage)

  // Cari semua game dalam seri yang sama
  const gamesDalamSeri = (semuaLaga || [])
    .filter(m => m.stage === stage && ambilBaseSlotKey(m.knockout_bracket_slot, m.stage) === baseSlot)
    .sort((a, b) => (a.matchday || 1) - (b.matchday || 1))

  if (gamesDalamSeri.length === 0) {
    gamesDalamSeri.push(laga)
  }

  const g1 = gamesDalamSeri.find(g => (g.matchday || 1) === 1) || gamesDalamSeri[0] || laga
  const g2 = gamesDalamSeri.find(g => (g.matchday || 1) === 2)
  const timAId = g1.home_team_id || g2?.away_team_id || laga.home_team_id
  const timBId = g1.away_team_id || g2?.home_team_id || laga.away_team_id
  const timAName = g1.home_team?.name || g2?.away_team?.name || laga.home_team?.name || 'Tim 1'
  const timBName = g1.away_team?.name || g2?.home_team?.name || laga.away_team?.name || 'Tim 2'
  const timAShort = g1.home_team?.short_name || g2?.away_team?.short_name || laga.home_team?.short_name || 'T1'
  const timBShort = g1.away_team?.short_name || g2?.home_team?.short_name || laga.away_team?.short_name || 'T2'

  let winA = 0
  let winB = 0
  let golA = 0
  let golB = 0
  const rincianGames = []

  gamesDalamSeri.forEach((g, idx) => {
    const isTimAHome = g.home_team_id === timAId
    const scoreA = isTimAHome ? Number(g.home_score || 0) : Number(g.away_score || 0)
    const scoreB = isTimAHome ? Number(g.away_score || 0) : Number(g.home_score || 0)
    const selesai = g.status === 'finished'

    if (selesai) {
      golA += scoreA
      golB += scoreB
      if (scoreA > scoreB) winA += 1
      else if (scoreB > scoreA) winB += 1
    }

    rincianGames.push({
      gameNumber: g.matchday || idx + 1,
      id: g.id,
      scoreA,
      scoreB,
      homeScore: Number(g.home_score || 0),
      awayScore: Number(g.away_score || 0),
      homeTeamShort: g.home_team?.short_name || (g.home_team_id === timAId ? timAShort : timBShort),
      awayTeamShort: g.away_team?.short_name || (g.away_team_id === timAId ? timAShort : timBShort),
      status: g.status,
      isCurrentMatch: g.id === laga.id
    })
  })

  // Relatif terhadap home & away laga saat ini
  const currentHomeIsTimA = laga.home_team_id === timAId
  const winHome = currentHomeIsTimA ? winA : winB
  const winAway = currentHomeIsTimA ? winB : winA
  const golHome = currentHomeIsTimA ? golA : golB
  const golAway = currentHomeIsTimA ? golB : golA

  const totalGameSelesai = gamesDalamSeri.filter(g => g.status === 'finished').length
  const isMenangGameMutlak = winA >= 2 || winB >= 2
  const isSelesai3Game = totalGameSelesai >= 3
  const isSelesaiSeri = isMenangGameMutlak || isSelesai3Game
  const gameKe = laga.matchday || 1

  let pemenangSeri = null
  let pemenangShort = null
  let alasanMenang = null

  if (isMenangGameMutlak) {
    pemenangSeri = winA >= 2 ? timAName : timBName
    pemenangShort = winA >= 2 ? timAShort : timBShort
    alasanMenang = 'menang_game'
  } else if (isSelesai3Game) {
    if (winA > winB) {
      pemenangSeri = timAName
      pemenangShort = timAShort
      alasanMenang = 'menang_game'
    } else if (winB > winA) {
      pemenangSeri = timBName
      pemenangShort = timBShort
      alasanMenang = 'menang_game'
    } else if (golA > golB) {
      pemenangSeri = timAName
      pemenangShort = timAShort
      alasanMenang = 'agregat_gol'
    } else if (golB > golA) {
      pemenangSeri = timBName
      pemenangShort = timBShort
      alasanMenang = 'agregat_gol'
    } else {
      pemenangSeri = timAName
      pemenangShort = timAShort
      alasanMenang = 'seed'
    }
  }

  const viaAgregatGol = isSelesaiSeri && alasanMenang === 'agregat_gol'

  return {
    isBo3: true,
    baseSlot,
    gameKe,
    totalGames: gamesDalamSeri.length,
    totalGameSelesai,
    winA,
    winB,
    winHome,
    winAway,
    golA,
    golB,
    golHome,
    golAway,
    timAName,
    timBName,
    timAShort,
    timBShort,
    rincianGames,
    isSelesaiSeri,
    pemenangSeri,
    pemenangShort,
    alasanMenang,
    viaAgregatGol,
    labelSkorSeri: `${winA} – ${winB}`,
    labelAgregatBO: `${winA} – ${winB}`
  }
}

/**
 * Membentuk struktur bagan turnamen lengkap dari daftar laga knockout
 * @param {Array} listKnockoutMatches
 * @returns {Object}
 */
export function bentukDataBagan(listKnockoutMatches = []) {
  const urutkanPerSlot = (a, b) => {
    const numA = parseInt((a.knockout_bracket_slot || '').match(/(\d+)/)?.[1] || '0', 10)
    const numB = parseInt((b.knockout_bracket_slot || '').match(/(\d+)/)?.[1] || '0', 10)
    return numA - numB
  }

  const r32Matches = listKnockoutMatches.filter((m) => m.stage === "round_of_32").sort(urutkanPerSlot);
  const r16Matches = listKnockoutMatches.filter((m) => m.stage === "round_of_16").sort(urutkanPerSlot);
  const qfMatches = listKnockoutMatches.filter((m) => m.stage === "quarter_final").sort(urutkanPerSlot);
  const sfMatches = listKnockoutMatches.filter((m) => m.stage === "semi_final").sort((a, b) => (a.matchday || 1) - (b.matchday || 1));
  const finalMatches = listKnockoutMatches.filter((m) => m.stage === "final").sort((a, b) => (a.matchday || 1) - (b.matchday || 1));

  const formatLagaSingle = (m, defaultLabel) => {
    if (!m) return null;
    const homeScore = Number(m.home_score || 0);
    const awayScore = Number(m.away_score || 0);
    const selesai = m.status === "finished";
    return {
      id: m.id,
      label: m.knockout_bracket_slot || defaultLabel,
      isBo3: false,
      home: {
        nama: m.home_team?.name || "TBD",
        short: m.home_team?.short_name || "-",
        logo_url: m.home_team?.logo_url || null,
        skor: homeScore,
        pemenang: selesai && homeScore > awayScore,
      },
      away: {
        nama: m.away_team?.name || "TBD",
        short: m.away_team?.short_name || "-",
        logo_url: m.away_team?.logo_url || null,
        skor: awayScore,
        pemenang: selesai && awayScore > homeScore,
      },
      selesai,
    };
  };

  const formatSeriBO3 = (listGames, defaultBaseLabel, defaultHomeName = "TBD", defaultAwayName = "TBD", defaultHomeShort = "H", defaultAwayShort = "A") => {
    if (!listGames || listGames.length === 0) return null;

    const g1 = listGames.find(g => (g.matchday || 1) === 1) || listGames[0];
    const g2 = listGames.find(g => (g.matchday || 1) === 2);

    const team1 = g1?.home_team || g2?.away_team || null;
    const team2 = g1?.away_team || g2?.home_team || null;
    const team1Id = team1?.id || g1?.home_team_id || g2?.away_team_id;
    const team2Id = team2?.id || g1?.away_team_id || g2?.home_team_id;

    let winTeam1 = 0;
    let winTeam2 = 0;
    let golTeam1 = 0;
    let golTeam2 = 0;
    let totalGameSelesai = 0;
    const rincianGames = [];

    listGames.forEach((g) => {
      const hScore = Number(g.home_score || 0);
      const aScore = Number(g.away_score || 0);
      const selesai = g.status === "finished";

      const isTeam1Home = (g.home_team?.id || g.home_team_id) === team1Id;
      const skorT1 = isTeam1Home ? hScore : aScore;
      const skorT2 = isTeam1Home ? aScore : hScore;

      if (selesai) {
        totalGameSelesai += 1;
        golTeam1 += skorT1;
        golTeam2 += skorT2;

        if (skorT1 > skorT2) winTeam1 += 1;
        else if (skorT2 > skorT1) winTeam2 += 1;
      }

      rincianGames.push({
        game: g.matchday || rincianGames.length + 1,
        skorT1,
        skorT2,
        selesai,
      });
    });

    const isMenangGameMutlak = winTeam1 >= 2 || winTeam2 >= 2;
    const isSelesai3Game = totalGameSelesai >= 3;
    const selesaiSeri = isMenangGameMutlak || isSelesai3Game;

    let team1Menang = false;
    let team2Menang = false;
    let alasan = null;

    if (winTeam1 >= 2) {
      team1Menang = true;
      alasan = 'menang_game';
    } else if (winTeam2 >= 2) {
      team2Menang = true;
      alasan = 'menang_game';
    } else if (totalGameSelesai >= 3) {
      if (winTeam1 > winTeam2) {
        team1Menang = true;
        alasan = 'menang_game';
      } else if (winTeam2 > winTeam1) {
        team2Menang = true;
        alasan = 'menang_game';
      } else if (golTeam1 > golTeam2) {
        team1Menang = true;
        alasan = 'agregat_gol';
      } else if (golTeam2 > golTeam1) {
        team2Menang = true;
        alasan = 'agregat_gol';
      } else {
        team1Menang = true;
        alasan = 'seed';
      }
    }

    const viaAgregatGol = selesaiSeri && alasan === 'agregat_gol';

    return {
      id: `bo3-${defaultBaseLabel}`,
      label: `${defaultBaseLabel} (BO3)`,
      isBo3: true,
      rincianGames,
      golTeam1,
      golTeam2,
      viaAgregatGol,
      totalGameSelesai,
      home: {
        nama: team1?.name || defaultHomeName,
        short: team1?.short_name || defaultHomeShort,
        logo_url: team1?.logo_url || null,
        skor: winTeam1,
        totalGol: golTeam1,
        pemenang: team1Menang,
      },
      away: {
        nama: team2?.name || defaultAwayName,
        short: team2?.short_name || defaultAwayShort,
        logo_url: team2?.logo_url || null,
        skor: winTeam2,
        totalGol: golTeam2,
        pemenang: team2Menang,
      },
      selesai: selesaiSeri,
    };
  };

  let hasR32 = r32Matches.length > 0;
  let hasR16 = r16Matches.length > 0 || hasR32;
  let hasQF = qfMatches.length > 0 || hasR16 || (!hasR32 && !hasR16);

  const r32List = hasR32
    ? Array.from(
        { length: 16 },
        (_, i) =>
          formatLagaSingle(r32Matches[i], `R32-${i + 1}`) || {
            id: `r32-${i + 1}`,
            label: `R32-${i + 1}`,
            isBo3: false,
            home: { nama: `Tim ${i * 2 + 1}`, short: `T${i * 2 + 1}`, skor: 0, pemenang: false },
            away: { nama: `Tim ${i * 2 + 2}`, short: `T${i * 2 + 2}`, skor: 0, pemenang: false },
            selesai: false,
          }
      )
    : [];

  const r16List = hasR16
    ? Array.from(
        { length: 8 },
        (_, i) =>
          formatLagaSingle(r16Matches[i], `R16-${i + 1}`) || {
            id: `r16-${i + 1}`,
            label: `R16-${i + 1}`,
            isBo3: false,
            home: { nama: `Pemenang R32-${i * 2 + 1}`, short: `W${i * 2 + 1}`, skor: 0, pemenang: false },
            away: { nama: `Pemenang R32-${i * 2 + 2}`, short: `W${i * 2 + 2}`, skor: 0, pemenang: false },
            selesai: false,
          }
      )
    : [];

  const qfList = hasQF
    ? Array.from(
        { length: 4 },
        (_, i) => {
          const slotKey = `QF ${i + 1}`
          const qfPattern = new RegExp(`^QF[- ]?0*${i + 1}(\\b|\\D)`, 'i')
          const gamesQF = qfMatches.filter((m) => (m.knockout_bracket_slot || '').startsWith(slotKey) || qfPattern.test(m.knockout_bracket_slot || ''))
          const defaultHome = i === 0 ? "Juara Grup A" : i === 1 ? "Juara Grup C" : i === 2 ? "Juara Grup B" : "Juara Grup D"
          const defaultAway = i === 0 ? "Runner-up Grup B" : i === 1 ? "Runner-up Grup D" : i === 2 ? "Runner-up Grup A" : "Runner-up Grup C"
          const defaultHomeShort = i === 0 ? "1A" : i === 1 ? "1C" : i === 2 ? "1B" : "1D"
          const defaultAwayShort = i === 0 ? "2B" : i === 1 ? "2D" : i === 2 ? "2A" : "2C"

          if (gamesQF.length > 0) {
            return formatSeriBO3(gamesQF, slotKey, defaultHome, defaultAway, defaultHomeShort, defaultAwayShort)
          }
          return {
            id: `qf-${i + 1}`,
            label: `${slotKey} (BO3)`,
            isBo3: true,
            rincianGames: [],
            home: {
              nama: defaultHome,
              short: defaultHomeShort,
              skor: 0,
              pemenang: false,
            },
            away: {
              nama: defaultAway,
              short: defaultAwayShort,
              skor: 0,
              pemenang: false,
            },
            selesai: false,
          }
        }
      )
    : [];

  const sf1Games = sfMatches.filter((m) =>
    (m.knockout_bracket_slot || "").includes("SF 1") ||
    /SF[- ]?1(\b|\D)/i.test(m.knockout_bracket_slot || "")
  );
  const sf2Games = sfMatches.filter((m) =>
    (m.knockout_bracket_slot || "").includes("SF 2") ||
    /SF[- ]?2(\b|\D)/i.test(m.knockout_bracket_slot || "")
  );

  const ambilPemenangSeri = (seriCard) => {
    if (!seriCard || !seriCard.selesai) return null;
    if (seriCard.home?.pemenang) return seriCard.home;
    if (seriCard.away?.pemenang) return seriCard.away;
    return null;
  };

  const timLolosQF1 = ambilPemenangSeri(qfList[0]);
  const timLolosQF2 = ambilPemenangSeri(qfList[1]);
  const timLolosQF3 = ambilPemenangSeri(qfList[2]);
  const timLolosQF4 = ambilPemenangSeri(qfList[3]);

  const rawSf1 = formatSeriBO3(sf1Games, "SF 1", "Pemenang QF 1", "Pemenang QF 2", "W1", "W2");
  const sf1Siap = !!(timLolosQF1 && timLolosQF2);
  const sf1Card = {
    id: "sf-1",
    label: "SF 1 (BO3)",
    isBo3: true,
    rincianGames: sf1Siap && rawSf1 ? rawSf1.rincianGames : [],
    golTeam1: sf1Siap && rawSf1 ? rawSf1.golTeam1 : 0,
    golTeam2: sf1Siap && rawSf1 ? rawSf1.golTeam2 : 0,
    viaAgregatGol: sf1Siap && rawSf1 ? rawSf1.viaAgregatGol : false,
    home: timLolosQF1
      ? {
          nama: timLolosQF1.nama,
          short: timLolosQF1.short,
          logo_url: timLolosQF1.logo_url,
          skor: sf1Siap && rawSf1 ? rawSf1.home.skor : 0,
          totalGol: sf1Siap && rawSf1 ? rawSf1.home.totalGol : 0,
          pemenang: sf1Siap && rawSf1 ? rawSf1.home.pemenang : false,
        }
      : { nama: "Pemenang QF 1", short: "W1", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    away: timLolosQF2
      ? {
          nama: timLolosQF2.nama,
          short: timLolosQF2.short,
          logo_url: timLolosQF2.logo_url,
          skor: sf1Siap && rawSf1 ? rawSf1.away.skor : 0,
          totalGol: sf1Siap && rawSf1 ? rawSf1.away.totalGol : 0,
          pemenang: sf1Siap && rawSf1 ? rawSf1.away.pemenang : false,
        }
      : { nama: "Pemenang QF 2", short: "W2", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    selesai: sf1Siap && rawSf1 ? rawSf1.selesai : false,
  };

  const rawSf2 = formatSeriBO3(sf2Games, "SF 2", "Pemenang QF 3", "Pemenang QF 4", "W3", "W4");
  const sf2Siap = !!(timLolosQF3 && timLolosQF4);
  const sf2Card = {
    id: "sf-2",
    label: "SF 2 (BO3)",
    isBo3: true,
    rincianGames: sf2Siap && rawSf2 ? rawSf2.rincianGames : [],
    golTeam1: sf2Siap && rawSf2 ? rawSf2.golTeam1 : 0,
    golTeam2: sf2Siap && rawSf2 ? rawSf2.golTeam2 : 0,
    viaAgregatGol: sf2Siap && rawSf2 ? rawSf2.viaAgregatGol : false,
    home: timLolosQF3
      ? {
          nama: timLolosQF3.nama,
          short: timLolosQF3.short,
          logo_url: timLolosQF3.logo_url,
          skor: sf2Siap && rawSf2 ? rawSf2.home.skor : 0,
          totalGol: sf2Siap && rawSf2 ? rawSf2.home.totalGol : 0,
          pemenang: sf2Siap && rawSf2 ? rawSf2.home.pemenang : false,
        }
      : { nama: "Pemenang QF 3", short: "W3", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    away: timLolosQF4
      ? {
          nama: timLolosQF4.nama,
          short: timLolosQF4.short,
          logo_url: timLolosQF4.logo_url,
          skor: sf2Siap && rawSf2 ? rawSf2.away.skor : 0,
          totalGol: sf2Siap && rawSf2 ? rawSf2.away.totalGol : 0,
          pemenang: sf2Siap && rawSf2 ? rawSf2.away.pemenang : false,
        }
      : { nama: "Pemenang QF 4", short: "W4", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    selesai: sf2Siap && rawSf2 ? rawSf2.selesai : false,
  };

  const sfList = [sf1Card, sf2Card];

  const timLolosSF1 = ambilPemenangSeri(sf1Card);
  const timLolosSF2 = ambilPemenangSeri(sf2Card);
  const finalSiap = !!(timLolosSF1 && timLolosSF2);
  const rawFinal = formatSeriBO3(finalMatches, "Grand Final PCL 2026", "Pemenang SF 1", "Pemenang SF 2", "F1", "F2");

  const fin = {
    id: "fin",
    label: "Grand Final (BO3)",
    isBo3: true,
    rincianGames: finalSiap && rawFinal ? rawFinal.rincianGames : [],
    golTeam1: finalSiap && rawFinal ? rawFinal.golTeam1 : 0,
    golTeam2: finalSiap && rawFinal ? rawFinal.golTeam2 : 0,
    viaAgregatGol: finalSiap && rawFinal ? rawFinal.viaAgregatGol : false,
    home: timLolosSF1
      ? {
          nama: timLolosSF1.nama,
          short: timLolosSF1.short,
          logo_url: timLolosSF1.logo_url,
          skor: finalSiap && rawFinal ? rawFinal.home.skor : 0,
          totalGol: finalSiap && rawFinal ? rawFinal.home.totalGol : 0,
          pemenang: finalSiap && rawFinal ? rawFinal.home.pemenang : false,
        }
      : { nama: "Pemenang SF 1", short: "F1", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    away: timLolosSF2
      ? {
          nama: timLolosSF2.nama,
          short: timLolosSF2.short,
          logo_url: timLolosSF2.logo_url,
          skor: finalSiap && rawFinal ? rawFinal.away.skor : 0,
          totalGol: finalSiap && rawFinal ? rawFinal.away.totalGol : 0,
          pemenang: finalSiap && rawFinal ? rawFinal.away.pemenang : false,
        }
      : { nama: "Pemenang SF 2", short: "F2", logo_url: null, skor: 0, totalGol: 0, pemenang: false },
    selesai: finalSiap && rawFinal ? rawFinal.selesai : false,
    juara: null,
  };

  if (fin.selesai) {
    const timJuara = fin.home.pemenang ? fin.home : fin.away.pemenang ? fin.away : null;
    if (timJuara) {
      fin.juara = {
        nama: timJuara.nama,
        short: timJuara.short,
        logo_url: timJuara.logo_url,
        trofi: "Peak Champions League Trophy 2026",
      };
    }
  }

  return {
    r32: r32List,
    r16: r16List,
    perempatFinal: qfList,
    semiFinal: sfList,
    final: fin,
    totalLagaAda: listKnockoutMatches.length,
  };
}

/**
 * Otomatis memasukkan pemenang laga knockout ke babak berikutnya via backend API.
 */
export async function majukanPemenangKnockoutSupabase(matchId, homeScore, awayScore) {
  try {
    const res = await api.advanceKnockout({
      match_id: matchId,
      home_score: Number(homeScore),
      away_score: Number(awayScore)
    })
    invalidateCache()
    return res
  } catch (err) {
    console.error('Gagal memajukan pemenang knockout:', err)
    return null
  }
}
