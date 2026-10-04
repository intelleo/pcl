/**
 * Klien API RESTful PCL (Peak Champions League)
 * Menghubungkan Frontend Vue 3 dengan Backend Express + MySQL
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  try {
    const res = await fetch(url, config)
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      const err = new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`)
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  } catch (error) {
    console.error(`API Error on [${config.method || 'GET'} ${endpoint}]:`, error.message)
    throw error
  }
}

export const api = {
  // === TOURNAMENTS / SEASONS ===
  getTournaments: () => request('/tournaments'),
  createTournament: (payload) => request('/tournaments', { method: 'POST', body: payload }),
  updateTournament: (id, payload) => request(`/tournaments/${id}`, { method: 'PUT', body: payload }),
  deleteTournament: (id) => request(`/tournaments/${id}`, { method: 'DELETE' }),
  drawGroups: (payload) => request('/tournaments/draw-groups', { method: 'POST', body: payload }),
  resetDrawing: (payload = {}) => request('/tournaments/reset-drawing', { method: 'POST', body: payload }),

  // === TEAMS ===
  getTeams: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/teams${query ? `?${query}` : ''}`)
  },
  getTeam: (id) => request(`/teams/${id}`),
  getTeamDetail: (id) => request(`/teams/${id}`),
  createTeam: (payload) => request('/teams', { method: 'POST', body: payload }),
  updateTeam: (id, payload) => request(`/teams/${id}`, { method: 'PUT', body: payload }),
  deleteTeam: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
  copyTeamsFromSeason: (payload) => request('/teams/copy-from-season', { method: 'POST', body: payload }),

  // === PLAYERS ===
  getPlayers: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/players${query ? `?${query}` : ''}`)
  },
  createPlayer: (payload) => request('/players', { method: 'POST', body: payload }),
  updatePlayer: (id, payload) => request(`/players/${id}`, { method: 'PUT', body: payload }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),

  // === MATCHES ===
  getMatches: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/matches${query ? `?${query}` : ''}`)
  },
  getMatchDetail: (id) => request(`/matches/${id}`),
  updateMatch: (id, payload) => request(`/matches/${id}`, { method: 'PUT', body: payload }),
  updateMatchScore: (id, payload) => request(`/matches/${id}`, { method: 'PUT', body: payload }),

  // === MATCH EVENTS (GOL/KARTU) ===
  addMatchEvent: (payload) => request('/match-events', { method: 'POST', body: payload }),
  deleteMatchEvent: (id) => request(`/match-events/${id}`, { method: 'DELETE' }),

  // === KNOCKOUT & BRACKET ===
  generateKnockout: (payload) => request('/knockout/generate', { method: 'POST', body: payload }),
  advanceKnockout: (payload) => request('/knockout/advance', { method: 'POST', body: payload }),

  // === STANDINGS ===
  getStandings: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/standings${query ? `?${query}` : ''}`)
  },

  // === STATISTICS ===
  getStatistics: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/statistics${query ? `?${query}` : ''}`)
  },

  // === TEAM REGISTRATIONS ===
  getRegistrations: () => request('/registrations'),
  createRegistration: (payload) => request('/registrations', { method: 'POST', body: payload }),
  updateRegistrationStatus: (id, status) => request(`/registrations/${id}/status`, { method: 'PUT', body: { status } }),

  // === CHAMPIONS / HALL OF FAME ===
  getChampions: () => request('/champions'),
  createChampion: (payload) => request('/champions', { method: 'POST', body: payload }),
  deleteChampion: (id) => request(`/champions/${id}`, { method: 'DELETE' }),

  // === NEWS ===
  getNews: () => request('/news'),
  getNewsDetail: (id) => request(`/news/${id}`),
  createNews: (payload) => request('/news', { method: 'POST', body: payload }),
  updateNews: (id, payload) => request(`/news/${id}`, { method: 'PUT', body: payload }),
  deleteNews: (id) => request(`/news/${id}`, { method: 'DELETE' }),
  likeNews: (id, delta = 1) => request(`/news/${id}/like`, { method: 'POST', body: { delta } }),

  // === SETTINGS ===
  getSettings: () => request('/settings'),
  getSetting: (key) => request(`/settings/${key}`),
  updateSetting: (key, value) => request(`/settings/${key}`, { method: 'PUT', body: { value } }),

  // === AUTH ===
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } })
}

export default api
