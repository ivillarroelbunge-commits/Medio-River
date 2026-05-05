import type { PlayerSeasonStats, PlayerStatLine, PlayerStatsCompetitionKey } from "@/lib/data/types"

export const playerStatsUpdatedAt = "2026-05-05"
export const playerStatsSourceUrl = "https://www.fotmob.com/teams/10076/stats/river-plate/players"

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
      apertura: {
        matches: 1,
        minutes: 45,
        goals: 0,
        assists: 0,
        rating: 5.47,
      },
    },
  },
  "player-centurion": {
    sourceId: 971901,
    updatedAt: playerStatsUpdatedAt,
    competitions: {},
  },
  "player-beltran": {
    sourceId: 1652014,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 16,
        minutes: 1395,
        goals: 0,
        assists: 0,
        rating: 7.19,
        cleanSheets: 7,
      },
      sudamericana: {
        matches: 3,
        minutes: 270,
        goals: 0,
        assists: 0,
        rating: 7.57,
        cleanSheets: 2,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 7.3,
        cleanSheets: 1,
      },
    },
  },
  "player-tobias-ramirez": {
    sourceId: 1607568,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 1,
        minutes: 135,
        goals: 0,
        assists: 0,
        rating: 7.3,
        yellowCards: 2,
      },
    },
  },
  "player-rivero": {
    sourceId: 1649321,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 14,
        minutes: 1238,
        goals: 1,
        assists: 0,
        rating: 7.24,
        yellowCards: 6,
      },
      sudamericana: {
        matches: 3,
        minutes: 270,
        goals: 0,
        assists: 0,
        rating: 7.4,
      },
    },
  },
  "player-bustos": {
    sourceId: 798148,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 3,
        minutes: 180,
        goals: 0,
        assists: 0,
        rating: 7.1,
      },
      sudamericana: {
        matches: 2,
        minutes: 135,
        goals: 0,
        assists: 1,
        rating: 7.54,
      },
    },
  },
  "player-paulo-diaz": {
    sourceId: 447556,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 5,
        minutes: 194,
        goals: 0,
        assists: 0,
        rating: 7.69,
        yellowCards: 1,
      },
      sudamericana: {
        matches: 1,
        goals: 0,
        assists: 0,
        rating: null,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 7.8,
      },
    },
  },
  "player-vina": {
    sourceId: 840184,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 8,
        minutes: 401,
        goals: 0,
        assists: 0,
        rating: 6.51,
        yellowCards: 4,
        redCards: 1,
      },
      sudamericana: {
        matches: 2,
        minutes: 166,
        goals: 0,
        assists: 0,
        rating: 7.49,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 7.86,
      },
    },
  },
  "player-pezzella": {
    sourceId: 186991,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 2,
        minutes: 135,
        goals: 0,
        assists: 0,
        rating: 6.77,
      },
      sudamericana: {
        matches: 2,
        minutes: 165,
        goals: 0,
        assists: 0,
        rating: 6.88,
      },
    },
  },
  "player-acuna": {
    sourceId: 561187,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 11,
        minutes: 839,
        goals: 0,
        assists: 1,
        rating: 7.39,
        yellowCards: 6,
      },
      sudamericana: {
        matches: 2,
        minutes: 104,
        goals: 0,
        assists: 0,
        rating: 6.94,
      },
    },
  },
  "player-martinez-quarta": {
    sourceId: 638771,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 15,
        minutes: 1341,
        goals: 1,
        assists: 0,
        rating: 7.35,
        yellowCards: 4,
      },
      sudamericana: {
        matches: 2,
        minutes: 95,
        goals: 1,
        assists: 0,
        rating: 7.95,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 7.57,
      },
    },
  },
  "player-montiel": {
    sourceId: 687008,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 14,
        minutes: 1259,
        goals: 4,
        assists: 1,
        rating: 7.51,
        yellowCards: 3,
      },
      sudamericana: {
        matches: 2,
        minutes: 135,
        goals: 0,
        assists: 0,
        rating: 6.9,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 7.53,
      },
    },
  },
  "player-facundo-gonzalez": {
    sourceId: 1610373,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 2,
        minutes: 107,
        goals: 0,
        assists: 0,
        rating: 6.83,
      },
    },
  },
  "player-portillo": {
    sourceId: 1201814,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 1,
        minutes: 7,
        goals: 0,
        assists: 0,
        rating: null,
      },
    },
  },
  "player-moreno": {
    sourceId: 1025557,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 16,
        minutes: 1392,
        goals: 0,
        assists: 2,
        rating: 7.28,
        yellowCards: 2,
      },
      sudamericana: {
        matches: 3,
        minutes: 252,
        goals: 0,
        assists: 0,
        rating: 7.47,
      },
      copaArgentina: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 8,
      },
    },
  },
  "player-quintero": {
    sourceId: 207617,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 12,
        minutes: 548,
        goals: 2,
        assists: 2,
        rating: 6.97,
      },
      sudamericana: {
        matches: 1,
        minutes: 51,
        goals: 0,
        assists: 0,
        rating: 7.15,
      },
      copaArgentina: {
        matches: 1,
        minutes: 89,
        goals: 1,
        assists: 0,
        rating: 9.01,
      },
    },
  },
  "player-vera": {
    sourceId: 981070,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 12,
        minutes: 995,
        goals: 0,
        assists: 0,
        rating: 7.3,
        yellowCards: 2,
        redCards: 1,
      },
      sudamericana: {
        matches: 2,
        minutes: 108,
        goals: 0,
        assists: 0,
        rating: 6.85,
      },
      copaArgentina: {
        matches: 1,
        minutes: 59,
        goals: 0,
        assists: 0,
        rating: 6.92,
      },
    },
  },
  "player-castano": {
    sourceId: 1434853,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 5,
        minutes: 92,
        goals: 0,
        assists: 0,
        rating: 6.51,
      },
      sudamericana: {
        matches: 1,
        minutes: 45,
        goals: 0,
        assists: 0,
        rating: 7.32,
      },
    },
  },
  "player-juan-cruz-meza": {
    sourceId: 1783664,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 4,
        minutes: 135,
        goals: 0,
        assists: 2,
        rating: 7.02,
        yellowCards: 2,
      },
      sudamericana: {
        matches: 3,
        minutes: 194,
        goals: 0,
        assists: 0,
        rating: 6.49,
      },
    },
  },
  "player-galvan": {
    sourceId: 1256242,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 16,
        minutes: 1151,
        goals: 2,
        assists: 1,
        rating: 7.12,
      },
      sudamericana: {
        matches: 3,
        minutes: 211,
        goals: 0,
        assists: 0,
        rating: 7.23,
      },
      copaArgentina: {
        matches: 1,
        minutes: 83,
        goals: 0,
        assists: 0,
        rating: 7.34,
      },
    },
  },
  "player-galoppo": {
    sourceId: 921603,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 9,
        minutes: 330,
        goals: 1,
        assists: 0,
        rating: 6.39,
        yellowCards: 1,
      },
      sudamericana: {
        matches: 1,
        goals: 0,
        assists: 0,
        rating: 6.73,
      },
      copaArgentina: {
        matches: 1,
        minutes: 1,
        goals: 0,
        assists: 0,
        rating: null,
      },
    },
  },
  "player-salas": {
    sourceId: 730647,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 12,
        minutes: 388,
        goals: 1,
        assists: 0,
        rating: 6.3,
        yellowCards: 2,
      },
      sudamericana: {
        matches: 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        rating: 6.91,
      },
      copaArgentina: {
        matches: 1,
        minutes: 59,
        goals: 0,
        assists: 0,
        rating: 6.87,
      },
    },
  },
  "player-meza": {
    sourceId: 469616,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 1,
        minutes: 45,
        goals: 0,
        assists: 0,
        rating: 6.52,
      },
    },
  },
  "player-driussi": {
    sourceId: 510698,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 12,
        minutes: 863,
        goals: 4,
        assists: 0,
        rating: 7.18,
      },
      sudamericana: {
        matches: 2,
        minutes: 90,
        goals: 2,
        assists: 0,
        rating: 7.29,
      },
    },
  },
  "player-colidio": {
    sourceId: 949735,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 12,
        minutes: 805,
        goals: 3,
        assists: 1,
        rating: 6.74,
        yellowCards: 1,
        redCards: 1,
      },
      sudamericana: {
        matches: 2,
        minutes: 180,
        goals: 0,
        assists: 0,
        rating: 7.06,
      },
      copaArgentina: {
        matches: 1,
        minutes: 31,
        goals: 0,
        assists: 0,
        rating: 6.64,
      },
    },
  },
  "player-kendry-paez": {
    sourceId: 1443464,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 8,
        minutes: 317,
        goals: 1,
        assists: 0,
        rating: 6.62,
        yellowCards: 1,
      },
      sudamericana: {
        matches: 2,
        minutes: 39,
        goals: 0,
        assists: 1,
        rating: 7.31,
      },
    },
  },
  "player-lautaro-pereyra": {
    sourceId: 1946519,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 3,
        minutes: 61,
        goals: 0,
        assists: 0,
        rating: 7.04,
      },
    },
  },
  "player-cristian-jaime": {
    sourceId: 1826548,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 1,
        minutes: 18,
        goals: 0,
        assists: 0,
        rating: 6.2,
      },
    },
  },
  "player-ruberto": {
    sourceId: 1580546,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 4,
        minutes: 169,
        goals: 0,
        assists: 0,
        rating: 6.01,
        yellowCards: 1,
      },
      sudamericana: {
        matches: 1,
        goals: 0,
        assists: 0,
        rating: null,
      },
      copaArgentina: {
        matches: 1,
        minutes: 59,
        goals: 0,
        assists: 0,
        rating: 6.32,
      },
    },
  },
  "player-freitas": {
    sourceId: 1847899,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 10,
        minutes: 446,
        goals: 1,
        assists: 1,
        rating: 6.71,
        yellowCards: 1,
      },
      sudamericana: {
        matches: 3,
        minutes: 135,
        goals: 0,
        assists: 0,
        rating: 6.75,
      },
      copaArgentina: {
        matches: 1,
        minutes: 31,
        goals: 0,
        assists: 0,
        rating: 7.04,
      },
    },
  },
  "player-subiabre": {
    sourceId: 1582679,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 16,
        minutes: 754,
        goals: 1,
        assists: 2,
        rating: 6.67,
        yellowCards: 2,
      },
      sudamericana: {
        matches: 3,
        minutes: 145,
        goals: 0,
        assists: 0,
        rating: 6.09,
      },
      copaArgentina: {
        matches: 1,
        minutes: 31,
        goals: 0,
        assists: 0,
        rating: 6.08,
      },
    },
  },
  "player-lencina": {
    sourceId: 1666511,
    updatedAt: playerStatsUpdatedAt,
    competitions: {
      apertura: {
        matches: 4,
        minutes: 63,
        goals: 0,
        assists: 0,
        rating: 6.42,
      },
      copaArgentina: {
        matches: 1,
        minutes: 7,
        goals: 0,
        assists: 0,
        rating: null,
      },
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
