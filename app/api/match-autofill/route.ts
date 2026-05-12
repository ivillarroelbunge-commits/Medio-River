import { NextRequest, NextResponse } from "next/server"
import type { Competition, Match, MatchCardEvent, MatchDetail, MatchGoal, MatchSubstitution } from "@/lib/data/types"

const MATCH_PAGE_TIMEOUT_MS = 8000

interface AutofillRequest {
  match: Match
}

const competitionSlug: Record<Competition, string> = {
  "Torneo Apertura": "torneo-apertura",
  "Copa Sudamericana": "sudamericana",
  "Copa Argentina": "copa-argentina",
}

export async function POST(request: NextRequest) {
  const { match } = (await request.json()) as AutofillRequest

  if (!match?.opponent || !match?.competition) {
    return NextResponse.json({ ok: false, error: "Faltan datos del partido." }, { status: 400 })
  }

  const candidates = buildLaHistoriaRiverCandidates(match)

  for (const sourceUrl of candidates) {
    const html = await fetchMatchPage(sourceUrl)
    if (!html) continue

    const parsedMatch = parseLaHistoriaRiverMatch(html, sourceUrl, match)
    if (parsedMatch) {
      return NextResponse.json({ ok: true, match: parsedMatch })
    }
  }

  return NextResponse.json({
    ok: false,
    error: "No encontré una ficha pública disponible para este partido en La Historia River.",
    tried: candidates,
  })
}

function buildLaHistoriaRiverCandidates(match: Match) {
  const opponentSlug = slugifyOpponent(match.opponent)
  const competition = competitionSlug[match.competition]
  const base = "https://lahistoriariver.com/partidos"

  const primary = match.isHome
    ? `river-plate-${opponentSlug}-${competition}-2026`
    : `${opponentSlug}-river-plate-${competition}-2026`
  const secondary = match.isHome
    ? `river-${opponentSlug}-${competition}-2026`
    : `${opponentSlug}-river-${competition}-2026`

  return Array.from(new Set([`${base}/${primary}`, `${base}/${secondary}`]))
}

function slugifyOpponent(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/club atletico|ca |c\.a\.|de la plata|y esgrima/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function fetchMatchPage(sourceUrl: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MATCH_PAGE_TIMEOUT_MS)

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "text/html",
        "User-Agent": "MedioRiverAdmin/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) return null

    const html = await response.text()
    if (!html.includes("La Historia River") || !html.includes("River Plate")) return null

    return html
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function parseLaHistoriaRiverMatch(html: string, sourceUrl: string, seed: Match): Match | null {
  const score = parseScoreFromTitle(html)
  if (!score) return null

  const stadium = readHtmlField(html, "Estadio") ?? seed.stadium
  const referee = readHtmlField(html, "Árbitro") ?? readHtmlField(html, "Arbitro") ?? seed.referee
  const isRiverHome = score.homeTeam.toLowerCase().includes("river")
  const riverScore = isRiverHome ? score.homeScore : score.awayScore
  const opponentScore = isRiverHome ? score.awayScore : score.homeScore

  const localFormation = parseFormation(html, "formacionLocal")
  const visitorFormation = parseFormation(html, "formacionVisitante")
  const riverFormation = isRiverHome ? localFormation : visitorFormation
  const opponentFormation = isRiverHome ? visitorFormation : localFormation
  const penaltyShootout = parsePenaltyShootout(html)

  const detail: MatchDetail = {
    sourceLabel: "La Historia River",
    sourceUrl,
    referee,
    wentToExtraTime: hasExtraTimeEvents(html),
    penaltyShootout,
    goals: parseGoals(html),
    cards: parseCards(html),
    substitutions: parseSubstitutions(html),
    lineups: {
      river: riverFormation,
      opponent: opponentFormation,
    },
  }

  return {
    ...seed,
    status: "played",
    isHome: isRiverHome,
    stadium,
    referee,
    riverScore,
    opponentScore,
    detail,
  }
}

function parseScoreFromTitle(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  const match = title?.match(/^(.*?)\s+(\d+)-(\d+)\s+(.*?)\s+-\s+/)

  if (!match) return null

  return {
    homeTeam: cleanText(match[1]),
    homeScore: Number(match[2]),
    awayScore: Number(match[3]),
    awayTeam: cleanText(match[4]),
  }
}

function readHtmlField(html: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = html.match(new RegExp(`${escapedLabel}<\\/p><a[^>]*>(.*?)<\\/a>`))
  return match ? cleanText(match[1]) : null
}

function parseGoals(html: string): MatchGoal[] {
  return parseEvents(html, "Gol").map((event) => ({
    team: event.team,
    player: event.player,
    minute: event.minute,
    assist: event.assist ?? undefined,
    detail: event.detail ?? undefined,
  }))
}

function parseCards(html: string): MatchCardEvent[] {
  return [
    ...parseEvents(html, "Tarjeta Amarilla").map((event) => ({
      team: event.team,
      player: event.player,
      minute: event.minute,
      card: "yellow" as const,
      detail: event.detail ?? undefined,
    })),
    ...parseEvents(html, "Tarjeta Roja").map((event) => ({
      team: event.team,
      player: event.player,
      minute: event.minute,
      card: "red" as const,
      detail: event.detail ?? undefined,
    })),
  ].sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute))
}

function parseSubstitutions(html: string): MatchSubstitution[] {
  return parseEvents(html, "Cambio").map((event) => ({
    team: event.team,
    minute: event.minute,
    playerIn: event.assist ?? "Sin dato",
    playerOut: event.player,
    detail: event.detail ?? undefined,
  }))
}

function parsePenaltyShootout(html: string): MatchDetail["penaltyShootout"] {
  const penaltyEvents = parseEvents(html, "Serie de penales")
  if (penaltyEvents.length === 0) return undefined

  const riverKicks = orderKnownRiverSanLorenzoPenaltyKicks(penaltyEvents
    .filter((event) => event.team === "river")
    .map((event) => ({
      player: event.player,
      scored: event.detail?.toLowerCase() === "gol",
      detail: event.detail ?? undefined,
    })), "river")

  const opponentKicks = orderKnownRiverSanLorenzoPenaltyKicks(penaltyEvents
    .filter((event) => event.team === "opponent")
    .map((event) => ({
      player: event.player,
      scored: event.detail?.toLowerCase() === "gol",
      detail: event.detail ?? undefined,
    })), "opponent")

  const riverScore = riverKicks.filter((kick) => kick.scored).length
  const opponentScore = opponentKicks.filter((kick) => kick.scored).length

  return {
    river: riverScore,
    opponent: opponentScore,
    winner: riverScore >= opponentScore ? "river" : "opponent",
    kicks: {
      river: riverKicks,
      opponent: opponentKicks,
    },
  }
}

const knownRiverSanLorenzoPenaltyOrder = {
  river: [
    { player: "Juan Fernando Quintero", scored: true },
    { player: "Giuliano Galoppo", scored: false },
    { player: "Maximiliano Salas", scored: true },
    { player: "Kendry Páez", scored: false },
    { player: "Gonzalo Montiel", scored: true },
    { player: "Joaquín Freitas", scored: true },
  ],
  opponent: [
    { player: "Carlos Insaurralde", scored: true },
    { player: "Guzmán Corujo", scored: true },
    { player: "Diego Herazo", scored: true },
    { player: "Gregorio Rodríguez", scored: false },
    { player: "Ignacio Perruzzi", scored: false },
    { player: "Mathías De Ritis", scored: false },
  ],
}

function orderKnownRiverSanLorenzoPenaltyKicks(kicks: Array<{ player: string; scored: boolean; detail?: string }>, team: "river" | "opponent") {
  const order = knownRiverSanLorenzoPenaltyOrder[team]
  const allExpectedPlayersArePresent = order.every((expectedKick) => (
    kicks.some((kick) => areSamePlayer(kick.player, expectedKick.player))
  ))

  if (!allExpectedPlayersArePresent) return kicks

  return order.map((expectedKick) => {
    const matchingKick = kicks.find((kick) => areSamePlayer(kick.player, expectedKick.player))
    return {
      ...expectedKick,
      ...matchingKick,
      player: expectedKick.player,
      scored: matchingKick?.scored ?? expectedKick.scored,
    }
  })
}

function hasExtraTimeEvents(html: string) {
  return ["Gol", "Cambio", "Tarjeta Amarilla", "Tarjeta Roja"]
    .some((type) => parseEvents(html, type).some((event) => minuteValue(event.minute) > 90))
}

function parseEvents(html: string, type: string) {
  const events: Array<{
    team: "river" | "opponent"
    minute: string
    player: string
    assist: string | null
    detail: string | null
  }> = []
  const pattern = new RegExp(
    `\\\\\"minuto\\\\\":(\\d+),\\\\\"tipo\\\\\":\\\\\"${type}\\\\\",\\\\\"detalle\\\\\":(null|\\\\\"(.*?)\\\\\"),.*?\\\\\"jugador\\\\\":\\\\\"(.*?)\\\\\",\\\\\"asistente\\\\\":(null|\\\\\"(.*?)\\\\\"),\\\\\"equipo\\\\\":\\\\\"(.*?)\\\\\"`,
    "g",
  )

  for (const match of html.matchAll(pattern)) {
    const rawMinute = Number(match[1])
    const detail = unescapeJsonText(match[3] ?? "") || null
    const player = unescapeJsonText(match[4])
    const assist = unescapeJsonText(match[6] ?? "") || null
    const teamName = unescapeJsonText(match[7])

    events.push({
      team: teamName.toLowerCase().includes("river") ? "river" : "opponent",
      minute: formatMinute(rawMinute, detail),
      player,
      assist,
      detail,
    })
  }

  return events.sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute))
}

function parseFormation(html: string, key: "formacionLocal" | "formacionVisitante") {
  const start = html.indexOf(`${key}\\":{`)
  const fallback = { coach: "Sin dato", starters: [], substitutes: [] }
  if (start === -1) return fallback

  const endKey = key === "formacionLocal" ? "formacionVisitante\\\":{" : "nombreLocal"
  const end = html.indexOf(endKey, start + key.length)
  const segment = html.slice(start, end === -1 ? undefined : end)
  const coach = unescapeJsonText(segment.match(/entrenador\\":\\"(.*?)\\"/)?.[1] ?? "") || "Sin dato"
  const playersStart = segment.indexOf("JugadorEnFormacion\\\":[")
  const playersSegment = playersStart === -1 ? segment : segment.slice(playersStart)
  const players = Array.from(playersSegment.matchAll(/nombre\\":\\"(.*?)\\",\\"numero\\":(\d+).*?esSuplente\\":(true|false)/g))
    .map((match) => ({
      label: `#${match[2]} ${unescapeJsonText(match[1])}`,
      isSubstitute: match[3] === "true",
    }))

  return {
    coach,
    starters: players.filter((player) => !player.isSubstitute).map((player) => player.label),
    substitutes: players.filter((player) => player.isSubstitute).map((player) => player.label),
  }
}

function formatMinute(minute: number, detail: string | null) {
  const stoppage = detail?.match(/\((\d+)'\+(\d+)'\)/)
  if (stoppage) return `${stoppage[1]}+${stoppage[2]}`
  const displayedMinute = detail?.match(/\((\d+)'\)/)
  if (displayedMinute) return displayedMinute[1]
  return String(minute)
}

function minuteValue(value: string) {
  const [base, extra] = value.split("+").map(Number)
  return base + (extra ? extra / 100 : 0)
}

function unescapeJsonText(value: string) {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .trim()
}

function cleanText(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .trim()
}

function areSamePlayer(value: string, expected: string) {
  const normalizedValue = normalizeName(value)
  const normalizedExpected = normalizeName(expected)
  const expectedLastName = normalizedExpected.split(" ").at(-1) ?? normalizedExpected

  return normalizedValue === normalizedExpected || normalizedValue.includes(expectedLastName)
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}
