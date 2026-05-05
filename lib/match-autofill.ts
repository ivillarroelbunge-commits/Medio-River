import type { Match } from "@/lib/data/types"

export function getAutomaticMatchUpdate(match: Match): Match | null {
  const isBragantinoAway =
    match.opponent.toLowerCase().includes("bragantino") &&
    match.competition === "Copa Sudamericana" &&
    !match.isHome

  if (!isBragantinoAway) return null

  return {
    ...match,
    status: "played",
    date: "2026-04-30T21:30:00-03:00",
    stadium: "Cícero de Souza Marques",
    tvChannel: match.tvChannel ?? "DSports",
    riverScore: 1,
    opponentScore: 0,
    referee: "Sin dato confirmado",
    detail: {
      sourceLabel: "Carga automática Medio River",
      sourceUrl: "https://www.rionegro.com.ar/deportes/futbol/river-vs-bragantino-por-la-copa-sudamericana-a-que-hora-juegan-y-donde-ver-el-partido-4140829/",
      referee: "Sin dato confirmado",
      goals: [
        {
          team: "river",
          player: "Lucas Martínez Quarta",
          minute: "90+3",
          detail: "Gol agónico para el triunfo de River",
        },
      ],
      cards: [
        {
          team: "opponent",
          player: "Alix Vinicius",
          minute: "59",
          card: "red",
          detail: "Expulsado en Red Bull Bragantino",
        },
      ],
      substitutions: [],
      lineups: {
        river: {
          coach: "Marcelo Gallardo",
          starters: [],
          substitutes: [],
        },
        opponent: {
          coach: "Sin dato confirmado",
          starters: [],
          substitutes: [],
        },
      },
    },
  }
}
