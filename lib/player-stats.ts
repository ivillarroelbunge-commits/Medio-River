import type { PlayerSeasonStats, PlayerStatLine, PlayerStatsCompetitionKey } from "@/lib/data/types"

export const playerStatsUpdatedAt = "2026-05-05"
export const playerStatsSourceUrl = "https://www.fotmob.com/teams/10076/stats/river-plate"

export const playerStatsCompetitionLabels: Record<PlayerStatsCompetitionKey | "total", string> = {
  total: "Total temporada",
  apertura: "Torneo Apertura",
  sudamericana: "Copa Sudamericana",
  copaArgentina: "Copa Argentina",
}

const emptyStatLine: PlayerStatLine = {
  matches: 0,
  minutes: 0,
  goals: 0,
  assists: 0,
  rating: null,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
}

export const playerSeasonStats: Record<string, PlayerSeasonStats> = {
  "player-armani": {
    sourceId: 206758,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 1, minutes: 45 },
    },
  },
  "player-beltran": {
    sourceId: 1652014,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 16, minutes: 1395, rating: 7.18, cleanSheets: 7 },
      sudamericana: { matches: 3, minutes: 270, rating: 7.05, cleanSheets: 2 },
      copaArgentina: { matches: 1, minutes: 90, rating: 7.3, cleanSheets: 1 },
    },
  },
  "player-montiel": {
    sourceId: 687008,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 14, minutes: 1259, goals: 4, assists: 1, rating: 7.51, yellowCards: 4 },
      sudamericana: { matches: 2, minutes: 135, rating: 6.98 },
      copaArgentina: { matches: 1, minutes: 90, rating: 7.53 },
    },
  },
  "player-martinez-quarta": {
    sourceId: 638771,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 16, minutes: 1431, goals: 1, rating: 7.32, yellowCards: 4 },
      sudamericana: { matches: 2, minutes: 95, goals: 1, redCards: 1 },
      copaArgentina: { matches: 1, minutes: 90, rating: 7.57 },
    },
  },
  "player-paulo-diaz": {
    sourceId: 447556,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 5, minutes: 194, yellowCards: 1 },
      copaArgentina: { matches: 1, minutes: 90, rating: 7.8 },
    },
  },
  "player-pezzella": {
    sourceId: 186991,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 1, minutes: 45 },
      sudamericana: { matches: 2, minutes: 165, rating: 6.89, yellowCards: 1 },
    },
  },
  "player-bustos": {
    sourceId: 798148,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 3, minutes: 136 },
      sudamericana: { matches: 2, minutes: 135, assists: 1, rating: 7.55 },
    },
  },
  "player-acuna": {
    sourceId: 561187,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 11, minutes: 839, assists: 1, rating: 7.36, yellowCards: 6 },
      sudamericana: { matches: 2, minutes: 104, rating: 6.92 },
    },
  },
  "player-rivero": {
    sourceId: 1649321,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 14, minutes: 1238, goals: 1, rating: 7.18, yellowCards: 6 },
      sudamericana: { matches: 3, minutes: 270, rating: 7.52 },
    },
  },
  "player-vina": {
    sourceId: 840184,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 8, minutes: 401, rating: 6.51, yellowCards: 4, redCards: 1 },
      sudamericana: { matches: 2, minutes: 166, rating: 7.49, yellowCards: 1 },
      copaArgentina: { matches: 1, minutes: 90, rating: 7.86 },
    },
  },
  "player-tobias-ramirez": {
    sourceId: 1607568,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 2, minutes: 135, yellowCards: 2 },
    },
  },
  "player-facundo-gonzalez": {
    sourceId: 1610373,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 2, minutes: 107 },
    },
  },
  "player-quintero": {
    sourceId: 207617,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 12, minutes: 550, goals: 2, assists: 2, rating: 6.97 },
      sudamericana: { matches: 1, minutes: 51, rating: 7.15 },
      copaArgentina: { matches: 1, minutes: 89, goals: 1, rating: 9.01 },
    },
  },
  "player-meza": {
    sourceId: 469616,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 1, minutes: 63, rating: 6.45 },
    },
  },
  "player-galoppo": {
    sourceId: 921603,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 9, minutes: 330, goals: 1, rating: 6.39, yellowCards: 1 },
      copaArgentina: { matches: 1, minutes: 1 },
    },
  },
  "player-castano": {
    sourceId: 1434853,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 5, minutes: 92 },
      sudamericana: { matches: 1, minutes: 45, rating: 7.32 },
    },
  },
  "player-lencina": {
    sourceId: 1666511,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 4, minutes: 63 },
      copaArgentina: { matches: 1, minutes: 7 },
    },
  },
  "player-portillo": {
    sourceId: 1201814,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 1, minutes: 7 },
    },
  },
  "player-galvan": {
    sourceId: 1256242,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 16, minutes: 1149, goals: 2, assists: 1, rating: 7.04 },
      sudamericana: { matches: 3, minutes: 211, rating: 7.18 },
      copaArgentina: { matches: 1, minutes: 83, rating: 7.34 },
    },
  },
  "player-vera": {
    sourceId: 981070,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 12, minutes: 995, rating: 7.3, yellowCards: 2, redCards: 1 },
      sudamericana: { matches: 2, minutes: 108, rating: 6.85 },
      copaArgentina: { matches: 1, minutes: 59, rating: 6.92 },
    },
  },
  "player-moreno": {
    sourceId: 1025557,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 16, minutes: 1392, assists: 2, rating: 7.24, yellowCards: 1 },
      sudamericana: { matches: 3, minutes: 252, rating: 7.39 },
      copaArgentina: { matches: 1, minutes: 90, rating: 8 },
    },
  },
  "player-juan-cruz-meza": {
    sourceId: 1783664,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 4, minutes: 135, assists: 2, yellowCards: 2 },
      sudamericana: { matches: 3, minutes: 194, rating: 6.72 },
    },
  },
  "player-lautaro-pereyra": {
    sourceId: 1946519,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 3, minutes: 43 },
    },
  },
  "player-kendry-paez": {
    sourceId: 1443464,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 8, minutes: 317, goals: 1, rating: 6.62 },
      sudamericana: { matches: 1, minutes: 39, assists: 1, rating: 7.99 },
    },
  },
  "player-ruberto": {
    sourceId: 1580546,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 4, minutes: 206, yellowCards: 1 },
      copaArgentina: { matches: 1, minutes: 59, rating: 6.32 },
    },
  },
  "player-colidio": {
    sourceId: 949735,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 12, minutes: 805, goals: 3, assists: 1, rating: 6.72, yellowCards: 1, redCards: 1 },
      sudamericana: { matches: 2, minutes: 180, rating: 7.16 },
      copaArgentina: { matches: 1, minutes: 31, rating: 6.64 },
    },
  },
  "player-subiabre": {
    sourceId: 1582679,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 16, minutes: 754, goals: 1, assists: 2, rating: 6.71, yellowCards: 2 },
      sudamericana: { matches: 3, minutes: 145, rating: 6.18 },
      copaArgentina: { matches: 1, minutes: 31, rating: 6.08 },
    },
  },
  "player-driussi": {
    sourceId: 510698,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 12, minutes: 863, goals: 4, rating: 7.18 },
      sudamericana: { matches: 2, minutes: 90, goals: 2, rating: 7.29 },
    },
  },
  "player-salas": {
    sourceId: 730647,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 12, minutes: 351, goals: 1, rating: 6.23, yellowCards: 2 },
      sudamericana: { matches: 1, minutes: 90, rating: 6.9 },
      copaArgentina: { matches: 1, minutes: 59, rating: 6.87 },
    },
  },
  "player-cristian-jaime": {
    sourceId: 1826548,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 1, minutes: 18 },
    },
  },
  "player-freitas": {
    sourceId: 1847899,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: { matches: 10, minutes: 490, goals: 1, assists: 1, rating: 6.67, yellowCards: 1 },
      sudamericana: { matches: 2, minutes: 135, rating: 6.75 },
      copaArgentina: { matches: 1, minutes: 31, rating: 7.04 },
    },
  },
}

export function normalizeStatLine(line?: Partial<PlayerStatLine>): PlayerStatLine {
  return {
    ...emptyStatLine,
    ...line,
    rating: line?.rating ?? null,
  }
}

export function getCompetitionStatLine(playerId: string, competition: PlayerStatsCompetitionKey) {
  return normalizeStatLine(playerSeasonStats[playerId]?.competitions[competition])
}

export function getPlayerTotalStats(playerId: string): PlayerStatLine {
  const stats = playerSeasonStats[playerId]
  if (!stats) return emptyStatLine

  const total = { ...emptyStatLine }
  let ratingWeight = 0
  let weightedRating = 0

  for (const line of Object.values(stats.competitions)) {
    const normalized = normalizeStatLine(line)
    total.matches += normalized.matches
    total.minutes += normalized.minutes
    total.goals += normalized.goals
    total.assists += normalized.assists
    total.yellowCards += normalized.yellowCards
    total.redCards += normalized.redCards
    total.cleanSheets += normalized.cleanSheets

    if (normalized.rating !== null) {
      const weight = Math.max(normalized.minutes, 1)
      ratingWeight += weight
      weightedRating += normalized.rating * weight
    }
  }

  return {
    ...total,
    rating: ratingWeight > 0 ? Number((weightedRating / ratingWeight).toFixed(2)) : null,
  }
}

export function formatPlayerRating(rating: number | null) {
  return rating === null ? "-" : rating.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
