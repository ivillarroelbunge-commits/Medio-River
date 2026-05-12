import { NextResponse } from "next/server"
import type { PlayerSeasonStats, PlayerStatLine } from "@/lib/data/types"
import { playerSeasonStats, playerStatsSourceUrl } from "@/lib/player-stats"

const fotMobHeaders = {
  accept: "application/json,text/html;q=0.9,*/*;q=0.8",
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
}

export async function POST() {
  const updatedAt = new Date().toISOString().slice(0, 10)
  const { stats, parsedPlayers } = await fetchFotMobPlayerStats(updatedAt)
  const updatedPlayers = Object.keys(stats).length

  return NextResponse.json({
    ok: true,
    source: parsedPlayers > 0 ? "fotmob" : "fotmob-cache",
    sourceUrl: playerStatsSourceUrl,
    updatedAt,
    updatedPlayers,
    stats,
    warning: parsedPlayers > 0
      ? undefined
      : "FotMob no entregó estadísticas parseables en este intento; se cargó la base cacheada del proyecto con fuente FotMob.",
  })
}

async function fetchFotMobPlayerStats(updatedAt: string) {
  const entries = Object.entries(playerSeasonStats)
  const stats = withUpdatedAt(playerSeasonStats, updatedAt)
  let parsedPlayers = 0

  await runWithConcurrency(entries, 10, async ([playerId, playerStats]) => {
    const aperturaStats = await fetchPlayerAperturaStats(playerStats.sourceId)
    if (!aperturaStats) return

    parsedPlayers += 1
    stats[playerId] = {
      ...stats[playerId],
      updatedAt,
      competitions: {
        ...stats[playerId].competitions,
        apertura: {
          ...stats[playerId].competitions.apertura,
          ...aperturaStats,
        },
      },
    }
  })

  return { stats, parsedPlayers }
}

async function fetchPlayerAperturaStats(sourceId: number): Promise<Partial<PlayerStatLine> | null> {
  try {
    const response = await fetch(`https://www.fotmob.com/players/${sourceId}`, {
      headers: fotMobHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })

    if (!response.ok) return null

    const html = await response.text()
    const text = htmlToText(html)
    return parseCompetitionStats(text, "Liga Profesional Apertura 2026")
  } catch {
    return null
  }
}

function parseCompetitionStats(text: string, competitionLabel: string): Partial<PlayerStatLine> | null {
  const start = text.indexOf(competitionLabel)
  if (start === -1) return null

  const segment = text.slice(start, start + 900)
  const matches = readNumberBeforeLabel(segment, "Matches")
  const minutes = readNumberBeforeLabel(segment, "Minutes played")
  const goals = readNumberBeforeLabel(segment, "Goals", ["conceded", "prevented", "against", "per", "outside", "inside"])
  const assists = readNumberBeforeLabel(segment, "Assists")
  const rating = readNumberBeforeLabel(segment, "Rating")
  const yellowCards = readNumberBeforeLabel(segment, "Yellow cards")
  const redCards = readNumberBeforeLabel(segment, "Red cards")

  if (matches === null && minutes === null && goals === null && assists === null) return null

  return {
    matches: matches ?? 0,
    minutes: minutes ?? 0,
    goals: goals ?? 0,
    assists: assists ?? 0,
    rating,
    yellowCards: yellowCards ?? 0,
    redCards: redCards ?? 0,
  }
}

function readNumberBeforeLabel(segment: string, label: string, blockedNextWords: string[] = []) {
  const blockedWordsPattern = blockedNextWords.length > 0
    ? `(?!\\s+(?:${blockedNextWords.map(escapeRegExp).join("|")})(?:\\s|$))`
    : ""
  const match = new RegExp(`(?:^|\\s)(\\d+(?:[.,]\\d+)*|-)\\s+${escapeRegExp(label)}${blockedWordsPattern}(?:\\s|$)`, "i").exec(segment)
  if (!match || match[1] === "-") return null

  return parseFotMobNumber(match[1])
}

function parseFotMobNumber(value: string) {
  const trimmedValue = value.trim()
  if (trimmedValue.includes(",") && trimmedValue.includes(".")) {
    return Number(trimmedValue.replace(/,/g, ""))
  }

  if (trimmedValue.includes(",")) {
    const commaParts = trimmedValue.split(",")
    const looksLikeThousands = commaParts.slice(1).every((part) => part.length === 3)
    return Number(looksLikeThousands ? commaParts.join("") : trimmedValue.replace(",", "."))
  }

  return Number(trimmedValue)
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let index = 0
  const runners = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const item = items[index]
      index += 1
      await worker(item)
    }
  })

  await Promise.all(runners)
}

function withUpdatedAt(stats: Record<string, PlayerSeasonStats>, updatedAt: string): Record<string, PlayerSeasonStats> {
  return Object.fromEntries(
    Object.entries(stats).map(([playerId, playerStats]) => [
      playerId,
      {
        ...playerStats,
        updatedAt,
      },
    ]),
  )
}
