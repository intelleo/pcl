/**
 * Mock data komprehensif turnamen PCL 2026.
 * Format: 16 Klub Elit, 4 Grup (A, B, C, D), Babak Gugur: Perempat Final -> Semi Final -> Grand Final.
 * Dilengkapi metrik in-game: MVP, Gol, Assist, Pass, Defense, serta Berita & Liputan Pertandingan.
 */

export const mockTim = [
  // GRUP A
  {
    id: '1',
    name: 'Barcelona FC',
    short_name: 'BAR',
    manager_name: 'Coach Xavi',
    group_name: 'Grup A',
    rating: 93,
    stadium: 'Camp Nou Flash'
  },
  {
    id: '2',
    name: 'Real Madrid',
    short_name: 'RMA',
    manager_name: 'Coach Ancelotti',
    group_name: 'Grup A',
    rating: 94,
    stadium: 'Santiago Bernabeu Peak'
  },
  {
    id: '3',
    name: 'Manchester United',
    short_name: 'MUN',
    manager_name: 'Coach Ten Hag',
    group_name: 'Grup A',
    rating: 88,
    stadium: 'Old Trafford Arena'
  },
  {
    id: '4',
    name: 'Galatasaray SK',
    short_name: 'GAL',
    manager_name: 'Coach Buruk',
    group_name: 'Grup A',
    rating: 85,
    stadium: 'Rams Global Flash'
  },

  // GRUP B
  {
    id: '5',
    name: 'Bayern Munich',
    short_name: 'BAY',
    manager_name: 'Coach Kompany',
    group_name: 'Grup B',
    rating: 92,
    stadium: 'Allianz Peak Arena'
  },
  {
    id: '6',
    name: 'Borussia Dortmund',
    short_name: 'DOR',
    manager_name: 'Coach Sahin',
    group_name: 'Grup B',
    rating: 87,
    stadium: 'Signal Iduna Park'
  },
  {
    id: '7',
    name: 'Paris Saint-Germain',
    short_name: 'PSG',
    manager_name: 'Coach Enrique',
    group_name: 'Grup B',
    rating: 90,
    stadium: 'Parc des Princes'
  },
  {
    id: '8',
    name: 'Arsenal FC',
    short_name: 'ARS',
    manager_name: 'Coach Arteta',
    group_name: 'Grup B',
    rating: 91,
    stadium: 'Emirates Flash Ground'
  },

  // GRUP C
  {
    id: '9',
    name: 'Manchester City',
    short_name: 'MCI',
    manager_name: 'Coach Pep',
    group_name: 'Grup C',
    rating: 95,
    stadium: 'Etihad Flash Stadium'
  },
  {
    id: '10',
    name: 'Inter Milan',
    short_name: 'INT',
    manager_name: 'Coach Inzaghi',
    group_name: 'Grup C',
    rating: 89,
    stadium: 'San Siro Peak'
  },
  {
    id: '11',
    name: 'Atletico Madrid',
    short_name: 'ATM',
    manager_name: 'Coach Simeone',
    group_name: 'Grup C',
    rating: 88,
    stadium: 'Metropolitano Arena'
  },
  {
    id: '12',
    name: 'SL Benfica',
    short_name: 'BEN',
    manager_name: 'Coach Lage',
    group_name: 'Grup C',
    rating: 86,
    stadium: 'Estadio da Luz'
  },

  // GRUP D
  {
    id: '13',
    name: 'Liverpool FC',
    short_name: 'LIV',
    manager_name: 'Coach Slot',
    group_name: 'Grup D',
    rating: 92,
    stadium: 'Anfield Road Peak'
  },
  {
    id: '14',
    name: 'Juventus FC',
    short_name: 'JUV',
    manager_name: 'Coach Motta',
    group_name: 'Grup D',
    rating: 87,
    stadium: 'Allianz Turin Ground'
  },
  {
    id: '15',
    name: 'AC Milan',
    short_name: 'ACM',
    manager_name: 'Coach Fonseca',
    group_name: 'Grup D',
    rating: 87,
    stadium: 'San Siro Flash'
  },
  {
    id: '16',
    name: 'Bayer Leverkusen',
    short_name: 'B04',
    manager_name: 'Coach Alonso',
    group_name: 'Grup D',
    rating: 90,
    stadium: 'BayArena Peak'
  }
]

export const mockPemain = [
  // Barcelona (id: 1)
  { id: 'p101', team_id: '1', name: 'Marc Ter Stegen', squad_number: 1, position: 'GK', overall: 89, stats: { goal: 0, assist: 0, pass: 42, def: 18, mvp: 0 } },
  { id: 'p102', team_id: '1', name: 'Ronald Araujo', squad_number: 4, position: 'DF', overall: 88, stats: { goal: 0, assist: 0, pass: 58, def: 34, mvp: 0 } },
  { id: 'p103', team_id: '1', name: 'Pedri Gonzalez', squad_number: 8, position: 'MF', overall: 91, stats: { goal: 1, assist: 3, pass: 112, def: 19, mvp: 1 } },
  { id: 'p104', team_id: '1', name: 'L. Messi (Prime)', squad_number: 10, position: 'FW', overall: 99, stats: { goal: 5, assist: 2, pass: 98, def: 8, mvp: 3 } },
  { id: 'p105', team_id: '1', name: 'Lamine Yamal', squad_number: 19, position: 'FW', overall: 89, stats: { goal: 1, assist: 2, pass: 64, def: 12, mvp: 0 } },

  // Real Madrid (id: 2)
  { id: 'p201', team_id: '2', name: 'Thibaut Courtois', squad_number: 1, position: 'GK', overall: 90, stats: { goal: 0, assist: 0, pass: 38, def: 15, mvp: 0 } },
  { id: 'p202', team_id: '2', name: 'Antonio Rudiger', squad_number: 22, position: 'DF', overall: 88, stats: { goal: 0, assist: 0, pass: 52, def: 38, mvp: 0 } },
  { id: 'p203', team_id: '2', name: 'Jude Bellingham', squad_number: 5, position: 'MF', overall: 92, stats: { goal: 1, assist: 2, pass: 94, def: 28, mvp: 1 } },
  { id: 'p204', team_id: '2', name: 'C. Ronaldo (Prime)', squad_number: 7, position: 'FW', overall: 98, stats: { goal: 4, assist: 1, pass: 55, def: 6, mvp: 2 } },
  { id: 'p205', team_id: '2', name: 'Vinicius Jr', squad_number: 11, position: 'FW', overall: 92, stats: { goal: 2, assist: 1, pass: 60, def: 9, mvp: 1 } },

  // Man United (id: 3)
  { id: 'p301', team_id: '3', name: 'Andre Onana', squad_number: 24, position: 'GK', overall: 85, stats: { goal: 0, assist: 0, pass: 40, def: 14, mvp: 0 } },
  { id: 'p302', team_id: '3', name: 'Lisandro Martinez', squad_number: 6, position: 'DF', overall: 87, stats: { goal: 0, assist: 0, pass: 62, def: 31, mvp: 0 } },
  { id: 'p303', team_id: '3', name: 'Bruno Fernandes', squad_number: 8, position: 'MF', overall: 89, stats: { goal: 1, assist: 1, pass: 88, def: 18, mvp: 1 } },
  { id: 'p304', team_id: '3', name: 'Rasmus Hojlund', squad_number: 9, position: 'FW', overall: 86, stats: { goal: 1, assist: 0, pass: 28, def: 5, mvp: 0 } },

  // Bayern Munich (id: 5)
  { id: 'p501', team_id: '5', name: 'Manuel Neuer', squad_number: 1, position: 'GK', overall: 89, stats: { goal: 0, assist: 0, pass: 48, def: 16, mvp: 0 } },
  { id: 'p502', team_id: '5', name: 'Alphonso Davies', squad_number: 19, position: 'DF', overall: 87, stats: { goal: 0, assist: 1, pass: 72, def: 29, mvp: 0 } },
  { id: 'p503', team_id: '5', name: 'Jamal Musiala', squad_number: 42, position: 'MF', overall: 90, stats: { goal: 1, assist: 2, pass: 85, def: 15, mvp: 1 } },
  { id: 'p504', team_id: '5', name: 'Harry Kane', squad_number: 9, position: 'FW', overall: 93, stats: { goal: 3, assist: 1, pass: 48, def: 7, mvp: 1 } },

  // Arsenal (id: 8)
  { id: 'p801', team_id: '8', name: 'David Raya', squad_number: 22, position: 'GK', overall: 87, stats: { goal: 0, assist: 0, pass: 45, def: 17, mvp: 0 } },
  { id: 'p802', team_id: '8', name: 'William Saliba', squad_number: 2, position: 'DF', overall: 89, stats: { goal: 0, assist: 0, pass: 78, def: 41, mvp: 1 } },
  { id: 'p803', team_id: '8', name: 'Martin Odegaard', squad_number: 8, position: 'MF', overall: 90, stats: { goal: 0, assist: 3, pass: 104, def: 21, mvp: 1 } },
  { id: 'p804', team_id: '8', name: 'Bukayo Saka', squad_number: 7, position: 'FW', overall: 91, stats: { goal: 2, assist: 1, pass: 62, def: 14, mvp: 1 } },

  // Man City (id: 9)
  { id: 'p901', team_id: '9', name: 'Ederson Moraes', squad_number: 31, position: 'GK', overall: 88, stats: { goal: 0, assist: 0, pass: 50, def: 14, mvp: 0 } },
  { id: 'p902', team_id: '9', name: 'Ruben Dias', squad_number: 3, position: 'DF', overall: 89, stats: { goal: 0, assist: 0, pass: 82, def: 39, mvp: 0 } },
  { id: 'p903', team_id: '9', name: 'Kevin De Bruyne', squad_number: 17, position: 'MF', overall: 93, stats: { goal: 1, assist: 4, pass: 128, def: 16, mvp: 2 } },
  { id: 'p904', team_id: '9', name: 'Erling Haaland', squad_number: 9, position: 'FW', overall: 95, stats: { goal: 4, assist: 0, pass: 31, def: 4, mvp: 2 } },

  // Liverpool (id: 13)
  { id: 'p1301', team_id: '13', name: 'Alisson Becker', squad_number: 1, position: 'GK', overall: 90, stats: { goal: 0, assist: 0, pass: 44, def: 15, mvp: 0 } },
  { id: 'p1302', team_id: '13', name: 'Virgil van Dijk', squad_number: 4, position: 'DF', overall: 91, stats: { goal: 0, assist: 0, pass: 86, def: 44, mvp: 1 } },
  { id: 'p1303', team_id: '13', name: 'Alexis Mac Allister', squad_number: 10, position: 'MF', overall: 88, stats: { goal: 0, assist: 2, pass: 92, def: 27, mvp: 0 } },
  { id: 'p1304', team_id: '13', name: 'Mohamed Salah', squad_number: 11, position: 'FW', overall: 92, stats: { goal: 3, assist: 1, pass: 58, def: 10, mvp: 1 } },

  // Leverkusen (id: 16)
  { id: 'p1601', team_id: '16', name: 'Lukas Hradecky', squad_number: 1, position: 'GK', overall: 86, stats: { goal: 0, assist: 0, pass: 36, def: 12, mvp: 0 } },
  { id: 'p1602', team_id: '16', name: 'Jeremie Frimpong', squad_number: 30, position: 'DF', overall: 87, stats: { goal: 1, assist: 1, pass: 66, def: 26, mvp: 0 } },
  { id: 'p1603', team_id: '16', name: 'Florian Wirtz', squad_number: 10, position: 'MF', overall: 91, stats: { goal: 2, assist: 2, pass: 96, def: 18, mvp: 1 } },
  { id: 'p1604', team_id: '16', name: 'Victor Boniface', squad_number: 22, position: 'FW', overall: 88, stats: { goal: 1, assist: 0, pass: 32, def: 6, mvp: 0 } }
]

export const mockPertandingan = [
  // Grup A - MD1
  {
    id: 'm1',
    tournament_id: 'sample-tournament-id',
    group_id: 'g1',
    group: { id: 'g1', name: 'Grup A' },
    home_team_id: '1',
    away_team_id: '2',
    home_team: { id: '1', name: 'Barcelona FC', short_name: 'BAR' },
    away_team: { id: '2', name: 'Real Madrid', short_name: 'RMA' },
    home_score: 3,
    away_score: 1,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p104',
      name: 'L. Messi (Prime)',
      team_short: 'BAR',
      rating: 9.8,
      contribution: '2 Gol • 1 Assist • 4 Dribel Sukses'
    },
    team_stats: {
      possession: { home: 58, away: 42 },
      shots: { home: 14, away: 8 },
      shots_on_target: { home: 8, away: 4 },
      passes: { home: 540, away: 395 },
      defense_tackles: { home: 24, away: 19 },
      fouls: { home: 7, away: 11 },
      saves: { home: 3, away: 5 }
    },
    player_ratings: [
      { id: 'p104', name: 'L. Messi (Prime)', team: 'BAR', pos: 'FW', goal: 2, assist: 1, pass: 45, def: 2, rating: 9.8, mvp: true },
      { id: 'p103', name: 'Pedri Gonzalez', team: 'BAR', pos: 'MF', goal: 1, assist: 1, pass: 68, def: 8, rating: 8.9 },
      { id: 'p105', name: 'Lamine Yamal', team: 'BAR', pos: 'FW', goal: 0, assist: 1, pass: 34, def: 4, rating: 8.2 },
      { id: 'p204', name: 'C. Ronaldo (Prime)', team: 'RMA', pos: 'FW', goal: 1, assist: 0, pass: 22, def: 1, rating: 8.4 },
      { id: 'p203', name: 'Jude Bellingham', team: 'RMA', pos: 'MF', goal: 0, assist: 1, pass: 48, def: 12, rating: 7.8 }
    ],
    events: [
      { id: 'e1', minute: 14, event_type: 'goal', player: { name: 'L. Messi (Prime)' }, assist_player: { name: 'Pedri Gonzalez' }, team: { short_name: 'BAR' } },
      { id: 'e2', minute: 38, event_type: 'yellow_card', player: { name: 'Antonio Rudiger' }, assist_player: null, team: { short_name: 'RMA' } },
      { id: 'e3', minute: 52, event_type: 'goal', player: { name: 'C. Ronaldo (Prime)' }, assist_player: { name: 'Jude Bellingham' }, team: { short_name: 'RMA' } },
      { id: 'e4', minute: 67, event_type: 'goal', player: { name: 'L. Messi (Prime)' }, assist_player: { name: 'Lamine Yamal' }, team: { short_name: 'BAR' } },
      { id: 'e5', minute: 88, event_type: 'goal', player: { name: 'Pedri Gonzalez' }, assist_player: { name: 'L. Messi (Prime)' }, team: { short_name: 'BAR' } }
    ]
  },
  {
    id: 'm2',
    tournament_id: 'sample-tournament-id',
    group_id: 'g1',
    group: { id: 'g1', name: 'Grup A' },
    home_team_id: '3',
    away_team_id: '4',
    home_team: { id: '3', name: 'Manchester United', short_name: 'MUN' },
    away_team: { id: '4', name: 'Galatasaray SK', short_name: 'GAL' },
    home_score: 2,
    away_score: 0,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p303',
      name: 'Bruno Fernandes',
      team_short: 'MUN',
      rating: 9.1,
      contribution: '1 Gol • 1 Assist • 5 Peluang Emas'
    },
    team_stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 11, away: 6 },
      shots_on_target: { home: 6, away: 2 },
      passes: { home: 480, away: 410 },
      defense_tackles: { home: 21, away: 16 },
      fouls: { home: 9, away: 8 },
      saves: { home: 2, away: 4 }
    },
    player_ratings: [
      { id: 'p303', name: 'Bruno Fernandes', team: 'MUN', pos: 'MF', goal: 1, assist: 1, pass: 58, def: 7, rating: 9.1, mvp: true },
      { id: 'p304', name: 'Rasmus Hojlund', team: 'MUN', pos: 'FW', goal: 1, assist: 0, pass: 18, def: 2, rating: 8.3 }
    ],
    events: [
      { id: 'e201', minute: 32, event_type: 'goal', player: { name: 'Bruno Fernandes' }, assist_player: null, team: { short_name: 'MUN' } },
      { id: 'e202', minute: 74, event_type: 'goal', player: { name: 'Rasmus Hojlund' }, assist_player: { name: 'Bruno Fernandes' }, team: { short_name: 'MUN' } }
    ]
  },

  // Grup B - MD1
  {
    id: 'm3',
    tournament_id: 'sample-tournament-id',
    group_id: 'g2',
    group: { id: 'g2', name: 'Grup B' },
    home_team_id: '5',
    away_team_id: '6',
    home_team: { id: '5', name: 'Bayern Munich', short_name: 'BAY' },
    away_team: { id: '6', name: 'Borussia Dortmund', short_name: 'DOR' },
    home_score: 2,
    away_score: 1,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p504',
      name: 'Harry Kane',
      team_short: 'BAY',
      rating: 9.3,
      contribution: '2 Gol • 3 Tembakan Akurat'
    },
    team_stats: {
      possession: { home: 61, away: 39 },
      shots: { home: 16, away: 7 },
      shots_on_target: { home: 9, away: 3 },
      passes: { home: 560, away: 340 },
      defense_tackles: { home: 18, away: 26 },
      fouls: { home: 6, away: 12 },
      saves: { home: 2, away: 7 }
    },
    player_ratings: [
      { id: 'p504', name: 'Harry Kane', team: 'BAY', pos: 'FW', goal: 2, assist: 0, pass: 28, def: 3, rating: 9.3, mvp: true },
      { id: 'p503', name: 'Jamal Musiala', team: 'BAY', pos: 'MF', goal: 0, assist: 1, pass: 54, def: 6, rating: 8.5 }
    ],
    events: [
      { id: 'e6', minute: 23, event_type: 'goal', player: { name: 'Harry Kane' }, assist_player: { name: 'Jamal Musiala' }, team: { short_name: 'BAY' } },
      { id: 'e7', minute: 76, event_type: 'goal', player: { name: 'Harry Kane' }, assist_player: null, team: { short_name: 'BAY' } }
    ]
  },
  {
    id: 'm4',
    tournament_id: 'sample-tournament-id',
    group_id: 'g2',
    group: { id: 'g2', name: 'Grup B' },
    home_team_id: '7',
    away_team_id: '8',
    home_team: { id: '7', name: 'Paris Saint-Germain', short_name: 'PSG' },
    away_team: { id: '8', name: 'Arsenal FC', short_name: 'ARS' },
    home_score: 1,
    away_score: 2,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p802',
      name: 'William Saliba',
      team_short: 'ARS',
      rating: 9.2,
      contribution: '8 Tekel Sukses • 100% Duel Udara'
    },
    team_stats: {
      possession: { home: 52, away: 48 },
      shots: { home: 10, away: 11 },
      shots_on_target: { home: 4, away: 6 },
      passes: { home: 490, away: 460 },
      defense_tackles: { home: 17, away: 28 },
      fouls: { home: 10, away: 9 },
      saves: { home: 4, away: 3 }
    },
    player_ratings: [
      { id: 'p802', name: 'William Saliba', team: 'ARS', pos: 'DF', goal: 0, assist: 0, pass: 52, def: 18, rating: 9.2, mvp: true },
      { id: 'p804', name: 'Bukayo Saka', team: 'ARS', pos: 'FW', goal: 1, assist: 0, pass: 36, def: 5, rating: 8.6 },
      { id: 'p803', name: 'Martin Odegaard', team: 'ARS', pos: 'MF', goal: 0, assist: 1, pass: 64, def: 6, rating: 8.4 }
    ],
    events: [
      { id: 'e8', minute: 31, event_type: 'goal', player: { name: 'Bukayo Saka' }, assist_player: { name: 'Martin Odegaard' }, team: { short_name: 'ARS' } },
      { id: 'e8b', minute: 70, event_type: 'goal', player: { name: 'Bukayo Saka' }, assist_player: null, team: { short_name: 'ARS' } }
    ]
  },

  // Grup C - MD1
  {
    id: 'm5',
    tournament_id: 'sample-tournament-id',
    group_id: 'g3',
    group: { id: 'g3', name: 'Grup C' },
    home_team_id: '9',
    away_team_id: '10',
    home_team: { id: '9', name: 'Manchester City', short_name: 'MCI' },
    away_team: { id: '10', name: 'Inter Milan', short_name: 'INT' },
    home_score: 3,
    away_score: 0,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p903',
      name: 'Kevin De Bruyne',
      team_short: 'MCI',
      rating: 9.6,
      contribution: '2 Assist • 84 Umpan Akurat • 1 Gol'
    },
    team_stats: {
      possession: { home: 67, away: 33 },
      shots: { home: 18, away: 4 },
      shots_on_target: { home: 10, away: 1 },
      passes: { home: 680, away: 280 },
      defense_tackles: { home: 14, away: 22 },
      fouls: { home: 5, away: 13 },
      saves: { home: 1, away: 7 }
    },
    player_ratings: [
      { id: 'p903', name: 'Kevin De Bruyne', team: 'MCI', pos: 'MF', goal: 1, assist: 2, pass: 84, def: 5, rating: 9.6, mvp: true },
      { id: 'p904', name: 'Erling Haaland', team: 'MCI', pos: 'FW', goal: 2, assist: 0, pass: 16, def: 1, rating: 9.2 }
    ],
    events: [
      { id: 'e9', minute: 18, event_type: 'goal', player: { name: 'Erling Haaland' }, assist_player: { name: 'Kevin De Bruyne' }, team: { short_name: 'MCI' } },
      { id: 'e10', minute: 62, event_type: 'goal', player: { name: 'Erling Haaland' }, assist_player: { name: 'Kevin De Bruyne' }, team: { short_name: 'MCI' } },
      { id: 'e10b', minute: 81, event_type: 'goal', player: { name: 'Kevin De Bruyne' }, assist_player: null, team: { short_name: 'MCI' } }
    ]
  },
  {
    id: 'm6',
    tournament_id: 'sample-tournament-id',
    group_id: 'g3',
    group: { id: 'g3', name: 'Grup C' },
    home_team_id: '11',
    away_team_id: '12',
    home_team: { id: '11', name: 'Atletico Madrid', short_name: 'ATM' },
    away_team: { id: '12', name: 'SL Benfica', short_name: 'BEN' },
    home_score: 1,
    away_score: 1,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p1101',
      name: 'Jan Oblak',
      team_short: 'ATM',
      rating: 8.8,
      contribution: '6 Penyelamatan Krusial'
    },
    team_stats: {
      possession: { home: 49, away: 51 },
      shots: { home: 8, away: 9 },
      shots_on_target: { home: 4, away: 5 },
      passes: { home: 410, away: 430 },
      defense_tackles: { home: 25, away: 20 },
      fouls: { home: 14, away: 11 },
      saves: { home: 4, away: 3 }
    },
    player_ratings: [],
    events: []
  },

  // Grup D - MD1
  {
    id: 'm7',
    tournament_id: 'sample-tournament-id',
    group_id: 'g4',
    group: { id: 'g4', name: 'Grup D' },
    home_team_id: '13',
    away_team_id: '14',
    home_team: { id: '13', name: 'Liverpool FC', short_name: 'LIV' },
    away_team: { id: '14', name: 'Juventus FC', short_name: 'JUV' },
    home_score: 2,
    away_score: 1,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p1302',
      name: 'Virgil van Dijk',
      team_short: 'LIV',
      rating: 9.4,
      contribution: '9 Tekel/Intersep • 74 Umpan'
    },
    team_stats: {
      possession: { home: 56, away: 44 },
      shots: { home: 13, away: 7 },
      shots_on_target: { home: 7, away: 3 },
      passes: { home: 510, away: 380 },
      defense_tackles: { home: 26, away: 18 },
      fouls: { home: 8, away: 10 },
      saves: { home: 2, away: 5 }
    },
    player_ratings: [
      { id: 'p1302', name: 'Virgil van Dijk', team: 'LIV', pos: 'DF', goal: 0, assist: 0, pass: 74, def: 20, rating: 9.4, mvp: true },
      { id: 'p1304', name: 'Mohamed Salah', team: 'LIV', pos: 'FW', goal: 1, assist: 0, pass: 32, def: 2, rating: 8.7 }
    ],
    events: [
      { id: 'e11', minute: 40, event_type: 'goal', player: { name: 'Mohamed Salah' }, assist_player: { name: 'Alexis Mac Allister' }, team: { short_name: 'LIV' } }
    ]
  },
  {
    id: 'm8',
    tournament_id: 'sample-tournament-id',
    group_id: 'g4',
    group: { id: 'g4', name: 'Grup D' },
    home_team_id: '15',
    away_team_id: '16',
    home_team: { id: '15', name: 'AC Milan', short_name: 'ACM' },
    away_team: { id: '16', name: 'Bayer Leverkusen', short_name: 'B04' },
    home_score: 1,
    away_score: 2,
    home_penalty_score: null,
    away_penalty_score: null,
    stage: 'group',
    matchday: 1,
    status: 'finished',
    mvp: {
      player_id: 'p1603',
      name: 'Florian Wirtz',
      team_short: 'B04',
      rating: 9.3,
      contribution: '1 Gol • 1 Assist • 6 Umpan Kunci'
    },
    team_stats: {
      possession: { home: 47, away: 53 },
      shots: { home: 9, away: 12 },
      shots_on_target: { home: 4, away: 7 },
      passes: { home: 430, away: 500 },
      defense_tackles: { home: 19, away: 23 },
      fouls: { home: 11, away: 8 },
      saves: { home: 5, away: 3 }
    },
    player_ratings: [
      { id: 'p1603', name: 'Florian Wirtz', team: 'B04', pos: 'MF', goal: 1, assist: 1, pass: 62, def: 7, rating: 9.3, mvp: true }
    ],
    events: [
      { id: 'e12', minute: 55, event_type: 'goal', player: { name: 'Florian Wirtz' }, assist_player: null, team: { short_name: 'B04' } }
    ]
  }
]

export const mockBaganData = {
  perempatFinal: [
    {
      id: 'qf1',
      label: 'QF 1',
      home: { nama: 'Barcelona FC', short: 'BAR', skor: 3, pemenang: true },
      away: { nama: 'Borussia Dortmund', short: 'DOR', skor: 1, pemenang: false },
      selesai: true
    },
    {
      id: 'qf2',
      label: 'QF 2',
      home: { nama: 'Bayern Munich', short: 'BAY', skor: 2, pemenang: false },
      away: { nama: 'Real Madrid', short: 'RMA', skor: 3, pemenang: true },
      selesai: true
    },
    {
      id: 'qf3',
      label: 'QF 3',
      home: { nama: 'Manchester City', short: 'MCI', skor: 3, pemenang: true },
      away: { nama: 'Juventus FC', short: 'JUV', skor: 1, pemenang: false },
      selesai: true
    },
    {
      id: 'qf4',
      label: 'QF 4',
      home: { nama: 'Liverpool FC', short: 'LIV', skor: 2, pemenang: true },
      away: { nama: 'Arsenal FC', short: 'ARS', skor: 1, pemenang: false },
      selesai: true
    }
  ],
  semiFinal: [
    {
      id: 'sf1',
      label: 'Semi Final 1 (El Clasico)',
      home: { nama: 'Barcelona FC', short: 'BAR', skor: 3, pemenang: true },
      away: { nama: 'Real Madrid', short: 'RMA', skor: 2, pemenang: false },
      selesai: true
    },
    {
      id: 'sf2',
      label: 'Semi Final 2',
      home: { nama: 'Manchester City', short: 'MCI', skor: 2, pemenang: true },
      away: { nama: 'Liverpool FC', short: 'LIV', skor: 1, pemenang: false },
      selesai: true
    }
  ],
  final: {
    id: 'fin',
    label: 'Grand Final PCL 2026',
    home: { nama: 'Barcelona FC', short: 'BAR', skor: 3, pemenang: true },
    away: { nama: 'Manchester City', short: 'MCI', skor: 2, pemenang: false },
    selesai: true,
    juara: {
      nama: 'Barcelona FC',
      short: 'BAR',
      trofi: 'Peak Champions League Trophy 2026',
      runnerUp: 'Manchester City'
    }
  }
}

export const mockBerita = [
  {
    id: 'n1',
    tag: 'MATCH RECAP',
    judul: 'Barcelona Tundukkan Real Madrid 3-1 di El Clasico Sengit Matchday 1',
    ringkasan: 'Performa magis Messi dengan 2 gol dan 1 assist membawa Blaugrana mengamankan 3 poin penuh di Grup A.',
    isi: [
      'Pertandingan akbar bertajuk El Clasico pada Matchday 1 Peak Champions League 2026 menyajikan drama intens sejak menit awal. Barcelona yang bertindak sebagai tuan rumah di Camp Nou Flash langsung mengambil inisiatif serangan cepat.',
      'Lionel Messi membuka keunggulan pada menit ke-14 setelah menerima umpan terobosan akurat dari Pedri Gonzalez. Real Madrid sempat menyamakan kedudukan lewat sepakan keras Cristiano Ronaldo di menit 52 memanfaatkan assist Jude Bellingham.',
      'Namun kejeniusan Messi kembali menjadi pembeda. Di menit ke-67, kombinasi umpan satu-dua bersama Lamine Yamal berbuah gol kedua. Pesta kemenangan Barcelona ditutup oleh gol Pedri di menit 88 lewat assist matang dari Messi.',
      'Dengan rating 9.8 dan kontribusi 2 gol plus 1 assist, Messi dinobatkan sebagai MVP pertandingan. Kemenangan ini mengokohkan Barcelona di puncak klasemen sementara Grup A.'
    ],
    kutipan: 'Kami mengontrol tempo permainan dan mengeksekusi rencana dengan disiplin penuh. Ini modal sempurna untuk melangkah ke babak gugur.',
    narasumber: 'Coach Xavi (Pelatih Barcelona)',
    tanggal: '24 Agu 2026',
    penulis: 'PCL Editorial',
    terkait_match_id: 'm1',
    badge_color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'n2',
    tag: 'TACTICAL REVIEW',
    judul: 'Dominasi Mutlak Man City: Kevin De Bruyne Ciptakan Rekor 84 Passes Akurat',
    ringkasan: 'The Citizens menghajar Inter Milan 3-0 tanpa ampun berkat duet maut KDB dan sang monster gol Haaland.',
    isi: [
      'Manchester City menunjukkan kelasnya sebagai salah satu kandidat terkuat juara PCL 2026 dengan melibas Inter Milan 3-0 di Etihad Flash Stadium.',
      'Sorotan utama tertuju pada Kevin De Bruyne yang mencatatkan 84 umpan akurat, 2 assist brilian, dan 1 gol penutup di menit ke-81. Erling Haaland memborong dua gol pembuka di menit 18 dan 62.',
      'Statistik penguasaan bola 67% berbanding 33% membuktikan taktik possession play Pep Guardiola berjalan sempurna membongkar compact defense lawan.',
      'De Bruyne membawa pulang gelar MVP dengan rating 9.6, menegaskan statusnya sebagai raja playmaker di turnamen musim ini.'
    ],
    kutipan: 'Koneksi Kevin dan Erling bekerja otomatis. Ketika kami menemukan celah di lini tengah, ruang tembak terbuka lebar.',
    narasumber: 'Coach Pep (Pelatih Man City)',
    tanggal: '24 Agu 2026',
    penulis: 'Analisis Flash',
    terkait_match_id: 'm5',
    badge_color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'n3',
    tag: 'DEFENSIVE MASTERCLASS',
    judul: 'Tembok Saliba Kokoh, Arsenal Bungkam PSG di Kandang 2-1',
    ringkasan: 'William Saliba dinobatkan sebagai MVP setelah memenangkan 100% duel udara dan 8 tekel krusial.',
    isi: [
      'Arsenal sukses mencuri poin penuh di kandang Paris Saint-Germain lewat pertarungan taktis ketat yang berakhir dengan skor 2-1.',
      'Dua gol The Gunners diborong oleh Bukayo Saka di menit 31 dan 70. Namun bintang sejati di laga ini adalah sang palang pintu pertahanan, William Saliba.',
      'Saliba mencatatkan 8 tekel sukses, 18 aksi bertahan, dan tingkat kemenangan duel udara 100%, membuat lini serang PSG frustrasi sepanjang 90 menit penuh.',
      'Gelar MVP untuk bek tengah membuktikan betapa krusialnya peran lini pertahanan dalam perebutan poin krusial di fase grup PCL.'
    ],
    kutipan: 'Bertahan bukan hanya soal menyapu bola, tapi memenangkan momen dan ketenangan di kotak penalti.',
    narasumber: 'William Saliba (MVP & Bek Arsenal)',
    tanggal: '24 Agu 2026',
    penulis: 'PCL Newsroom',
    terkait_match_id: 'm4',
    badge_color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'n4',
    tag: 'TOURNAMENT PREVIEW',
    judul: 'Persaingan Menuju 8 Besar: Siapa yang Akan Mengunci Tiket Perempat Final?',
    ringkasan: 'Dengan 16 klub bertarung di 4 grup, setiap selisih gol menjadi penentu nasib menuju panggung juara.',
    isi: [
      'Format turnamen PCL 2026 menuntut konsistensi tinggi. Hanya dua tim teratas dari masing-masing grup (Grup A, B, C, D) yang berhak melaju ke fase knockout perempat final.',
      'Grup A langsung menyajikan persaingan panas antara Barcelona dan Real Madrid, sementara di Grup B Bayern Munich dan Arsenal saling menempel ketat.',
      'Di Grup C, Manchester City memimpin selisih gol, sedangkan Grup D menyajikan duel sengit antara Liverpool dan Bayer Leverkusen.',
      'Babak perempat final dijadwalkan berlangsung dengan tensi tinggi sebelum puncak Grand Final PCL 2026.'
    ],
    kutipan: 'Tidak ada ruang untuk kesalahan di fase grup. Setiap poin dan selisih gol akan menentukan posisi seeding di bagan gugur.',
    narasumber: 'Komite Turnamen PCL',
    tanggal: '24 Agu 2026',
    penulis: 'PCL Official',
    terkait_match_id: null,
    badge_color: 'bg-amber-50 text-amber-700 border-amber-200'
  }
]

export const mockRiwayatJuara = [
  {
    id: 's2026',
    musim: '2026',
    label_musim: 'PCL 2026 (Season 3)',
    status: 'Selesai',
    juara: {
      id: '1',
      name: 'Barcelona FC',
      short_name: 'BAR',
      manager_name: 'Coach Xavi',
      rating: 93
    },
    runner_up: {
      id: '9',
      name: 'Manchester City',
      short_name: 'MCI',
      manager_name: 'Coach Pep',
      rating: 95
    },
    peringkat_3: {
      id: '2',
      name: 'Real Madrid',
      short_name: 'RMA'
    },
    skor_final: '3 – 2',
    lokasi_final: 'Camp Nou Flash Arena',
    top_scorer: {
      nama: 'L. Messi (Prime)',
      klub: 'BAR',
      total: 8
    },
    top_assist: {
      nama: 'Pedri Gonzalez',
      klub: 'BAR',
      total: 5
    },
    mvp_turnamen: {
      nama: 'L. Messi (Prime)',
      klub: 'BAR',
      rating: 9.8
    },
    total_peserta: 16,
    total_gol: 54
  },
  {
    id: 's2025',
    musim: '2025',
    label_musim: 'PCL 2025 (Season 2)',
    status: 'Selesai',
    juara: {
      id: '2',
      name: 'Real Madrid',
      short_name: 'RMA',
      manager_name: 'Coach Ancelotti',
      rating: 94
    },
    runner_up: {
      id: '5',
      name: 'Bayern Munich',
      short_name: 'BAY',
      manager_name: 'Coach Tuchel',
      rating: 92
    },
    peringkat_3: {
      id: '13',
      name: 'Liverpool FC',
      short_name: 'LIV'
    },
    skor_final: '2 – 1',
    lokasi_final: 'Santiago Bernabeu Peak',
    top_scorer: {
      nama: 'C. Ronaldo (Prime)',
      klub: 'RMA',
      total: 9
    },
    top_assist: {
      nama: 'Kevin De Bruyne',
      klub: 'MCI',
      total: 6
    },
    mvp_turnamen: {
      nama: 'C. Ronaldo (Prime)',
      klub: 'RMA',
      rating: 9.6
    },
    total_peserta: 16,
    total_gol: 62
  },
  {
    id: 's2024',
    musim: '2024',
    label_musim: 'PCL 2024 (Season 1)',
    status: 'Selesai',
    juara: {
      id: '9',
      name: 'Manchester City',
      short_name: 'MCI',
      manager_name: 'Coach Pep',
      rating: 95
    },
    runner_up: {
      id: '7',
      name: 'Paris Saint-Germain',
      short_name: 'PSG',
      manager_name: 'Coach Enrique',
      rating: 90
    },
    peringkat_3: {
      id: '1',
      name: 'Barcelona FC',
      short_name: 'BAR'
    },
    skor_final: '1 – 0',
    lokasi_final: 'Etihad Flash Stadium',
    top_scorer: {
      nama: 'Erling Haaland',
      klub: 'MCI',
      total: 10
    },
    top_assist: {
      nama: 'Kylian Mbappe',
      klub: 'PSG',
      total: 4
    },
    mvp_turnamen: {
      nama: 'Rodri Hernandez',
      klub: 'MCI',
      rating: 9.4
    },
    total_peserta: 8,
    total_gol: 41
  }
]

export const mockPendaftaranTim = [
  {
    id: 'reg1',
    nama_tim: 'Inter Miami FC',
    short_name: 'MIA',
    manager_name: 'Coach Martino',
    kontak: '081234567890',
    email: 'admin@intermiami.com',
    status: 'pending', // 'pending' | 'diterima' | 'ditolak'
    tanggal_daftar: '24 Agu 2026',
    catatan: 'Skuad inti lengkap 11 pemain Flash'
  },
  {
    id: 'reg2',
    nama_tim: 'Al Nassr FC',
    short_name: 'NAS',
    manager_name: 'Coach Castro',
    kontak: '081987654321',
    email: 'cr7@alnassr.sa',
    status: 'pending',
    tanggal_daftar: '24 Agu 2026',
    catatan: 'Klub siap bertanding sistem turnamen penuh'
  },
  {
    id: 'reg3',
    nama_tim: 'Bayer Leverkusen',
    short_name: 'B04',
    manager_name: 'Coach Alonso',
    kontak: '085566778899',
    email: 'alonso@bayer.de',
    status: 'diterima',
    tanggal_daftar: '23 Agu 2026',
    catatan: 'Lolos verifikasi panitia'
  }
]


