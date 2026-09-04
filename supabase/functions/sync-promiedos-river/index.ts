import { withSupabase } from "npm:@supabase/server@1.5.3"

const PROMIEDOS_BASE_URL = "https://api.promiedos.com.ar"
const PROMIEDOS_X_VER = "1.11.7.5"
const RIVER_TEAM_ID = "igi"
const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires"

const LEAGUES = [
  { id: "hc", competition: "league" as const },
  { id: "gea", competition: "Copa Argentina" as const },
  { id: "dij", competition: "Copa Sudamericana" as const },
]

type Competition = "Torneo Apertura" | "Torneo Clausura" | "Copa Sudamericana" | "Copa Argentina"
type SyncMode = "fixtures" | "today"

type PromiedosTeam = {
  id?: string
  name?: string
  short_name?: string
  url_name?: string
}

type PromiedosGame = {
  id?: string
  teams?: PromiedosTeam[]
  scores?: number[]
  status?: { enum?: number; name?: string }
  start_time?: string
  stage_round_name?: string
  tv_networks?: Array<{ name?: string }>
}

type ExistingMatch = {
  id: string
  date: string
  opponent: string
  competition: Competition
  status: "upcoming" | "played"
  is_home: boolean
  stadium: string
  tv_channel: string | null
  river_score: number | null
  opponent_score: number | null
  referee: string | null
  detail: unknown
  updated_by: string | null
  promiedos_game_id: string | null
}

type NormalizedGame = {
  promiedosGameId: string
  date: string
  opponent: string
  competition: Competition
  status: "upcoming" | "played"
  isHome: boolean
  tvChannel: string | null
  riverScore: number | null
  opponentScore: number | null
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if (request.method !== "POST") {
      return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 })
    }

    let mode: SyncMode = "fixtures"
    try {
      const body = await request.json()
      if (body?.mode === "today") mode = "today"
      if (body?.mode && body.mode !== "fixtures" && body.mode !== "today") {
        return Response.json({ ok: false, error: "Invalid sync mode" }, { status: 400 })
      }
    } catch {
      // An empty body defaults to the complete fixture sync.
    }

    try {
      const sourceGames = mode === "today" ? await fetchTodayGames() : await fetchFixtureGames()
      const normalizedGames = dedupeByGameId(sourceGames)

      const { data: existingData, error: existingError } = await ctx.supabaseAdmin
        .from("matches")
        .select("id,date,opponent,competition,status,is_home,stadium,tv_channel,river_score,opponent_score,referee,detail,updated_by,promiedos_game_id")

      if (existingError) throw existingError

      const existingMatches = (existingData ?? []) as ExistingMatch[]
      const summary = { mode, found: normalizedGames.length, inserted: 0, updated: 0, unchanged: 0 }

      for (const game of normalizedGames) {
        const existing = findExistingMatch(existingMatches, game)
        const payload = buildPayload(game, existing)

        if (existing) {
          if (!hasMeaningfulChange(existing, payload)) {
            summary.unchanged += 1
            continue
          }

          const { error } = await ctx.supabaseAdmin.from("matches").update(payload).eq("id", existing.id)
          if (error) throw error

          Object.assign(existing, payload)
          summary.updated += 1
        } else {
          const row = { id: `promiedos-${game.promiedosGameId}`, ...payload }
          const { error } = await ctx.supabaseAdmin.from("matches").insert(row)
          if (error) throw error

          existingMatches.push(row as ExistingMatch)
          summary.inserted += 1
        }
      }

      return Response.json({ ok: true, ...summary, games: normalizedGames })
    } catch (error) {
      console.error("Promiedos River sync failed", error)
      return Response.json(
        { ok: false, error: error instanceof Error ? error.message : "Unknown sync error" },
        { status: 500 },
      )
    }
  }),
}

async function fetchFixtureGames() {
  const games: NormalizedGame[] = []

  for (const league of LEAGUES) {
    const data = await fetchPromiedos(`/league/tables_and_fixtures/${league.id}`)
    const sourceGames = collectGames(data)

    for (const game of sourceGames) {
      if (!isRiverGame(game)) continue
      const normalized = normalizeGame(game, league.competition)
      if (normalized) games.push(normalized)
    }
  }

  return games
}

async function fetchTodayGames() {
  const date = formatArgentinaDate(new Date())
  const data = await fetchPromiedos(`/games/${date}`)
  const games: NormalizedGame[] = []
  const leagues = Array.isArray(data?.leagues) ? data.leagues : []

  for (const league of leagues) {
    const leagueId = String(league?.id ?? "")
    const configured = LEAGUES.find((item) => item.id === leagueId)
    if (!configured) continue

    const sourceGames = Array.isArray(league?.games) ? league.games : []
    for (const game of sourceGames) {
      if (!isRiverGame(game)) continue
      const normalized = normalizeGame(game, configured.competition)
      if (normalized) games.push(normalized)
    }
  }

  return games
}

async function fetchPromiedos(path: string) {
  const response = await fetch(`${PROMIEDOS_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "X-VER": PROMIEDOS_X_VER,
      "User-Agent": "Mozilla/5.0 (MedioRiverSync/1.0)",
      Referer: "https://www.promiedos.com.ar/",
    },
  })

  if (!response.ok) {
    throw new Error(`Promiedos ${path} returned HTTP ${response.status}`)
  }

  const data = await response.json()
  if (!data || typeof data !== "object") {
    throw new Error(`Promiedos ${path} returned an invalid response`)
  }

  return data
}

function collectGames(value: unknown, output: PromiedosGame[] = []): PromiedosGame[] {
  if (!value || typeof value !== "object") return output

  if (Array.isArray(value)) {
    for (const item of value) collectGames(item, output)
    return output
  }

  const object = value as Record<string, unknown>
  if (
    typeof object.id === "string" &&
    typeof object.start_time === "string" &&
    Array.isArray(object.teams) &&
    object.teams.length >= 2
  ) {
    output.push(object as PromiedosGame)
    return output
  }

  for (const nested of Object.values(object)) collectGames(nested, output)
  return output
}

function isRiverGame(game: PromiedosGame) {
  return game.teams?.some((team) => isRiverTeam(team)) ?? false
}

function isRiverTeam(team: PromiedosTeam) {
  if (team.id === RIVER_TEAM_ID) return true
  if (team.url_name === "river-plate") return true
  return normalizeText(team.name ?? team.short_name ?? "") === "river plate"
}

function normalizeGame(game: PromiedosGame, configuredCompetition: (typeof LEAGUES)[number]["competition"]): NormalizedGame | null {
  if (!game.id || !game.start_time || !game.teams || game.teams.length < 2) return null

  const kickoff = parseArgentinaKickoff(game.start_time)
  if (!kickoff) return null

  const home = game.teams[0]
  const away = game.teams[1]
  const riverIsHome = isRiverTeam(home)
  const riverIsAway = isRiverTeam(away)
  if (!riverIsHome && !riverIsAway) return null

  const opponent = riverIsHome ? away : home
  const opponentName = cleanTeamName(opponent.name ?? opponent.short_name ?? "")
  if (!opponentName) return null

  const competition = configuredCompetition === "league"
    ? inferLeagueCompetition(game, kickoff)
    : configuredCompetition

  const isFinal = game.status?.enum === 3
  const scores = Array.isArray(game.scores) ? game.scores : []
  const homeScore = isFiniteNumber(scores[0]) ? Math.trunc(scores[0]) : null
  const awayScore = isFiniteNumber(scores[1]) ? Math.trunc(scores[1]) : null

  return {
    promiedosGameId: game.id,
    date: kickoff.toISOString(),
    opponent: opponentName,
    competition,
    status: isFinal ? "played" : "upcoming",
    isHome: riverIsHome,
    tvChannel: game.tv_networks?.map((network) => network.name?.trim()).filter(Boolean).join(" / ") || null,
    riverScore: isFinal ? (riverIsHome ? homeScore : awayScore) : null,
    opponentScore: isFinal ? (riverIsHome ? awayScore : homeScore) : null,
  }
}

function inferLeagueCompetition(game: PromiedosGame, kickoff: Date): Competition {
  const descriptor = normalizeText(game.stage_round_name ?? "")
  if (descriptor.includes("apertura")) return "Torneo Apertura"
  if (descriptor.includes("clausura")) return "Torneo Clausura"

  const argentinaMonth = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    month: "numeric",
  }).format(kickoff))

  return argentinaMonth <= 6 ? "Torneo Apertura" : "Torneo Clausura"
}

function parseArgentinaKickoff(value: string) {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!match) return null

  const [, day, month, year, hour, minute] = match
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatArgentinaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ARGENTINA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${byType.day}-${byType.month}-${byType.year}`
}

function findExistingMatch(existingMatches: ExistingMatch[], game: NormalizedGame) {
  const bySourceId = existingMatches.find((match) => match.promiedos_game_id === game.promiedosGameId)
  if (bySourceId) return bySourceId

  const gameTime = new Date(game.date).getTime()
  const maxDistance = 72 * 60 * 60 * 1000

  return existingMatches.find((match) => {
    if (match.competition !== game.competition) return false
    if (normalizeText(match.opponent) !== normalizeText(game.opponent)) return false
    const distance = Math.abs(new Date(match.date).getTime() - gameTime)
    return Number.isFinite(distance) && distance <= maxDistance
  })
}

function buildPayload(game: NormalizedGame, existing?: ExistingMatch) {
  return {
    date: game.date,
    opponent: game.opponent,
    competition: game.competition,
    status: game.status,
    is_home: game.isHome,
    stadium: existing?.stadium || "A confirmar",
    tv_channel: game.tvChannel ?? existing?.tv_channel ?? null,
    river_score: game.status === "played" ? game.riverScore : null,
    opponent_score: game.status === "played" ? game.opponentScore : null,
    referee: existing?.referee ?? null,
    detail: existing?.detail ?? null,
    updated_by: existing?.updated_by ?? null,
    promiedos_game_id: game.promiedosGameId,
  }
}

function hasMeaningfulChange(existing: ExistingMatch, payload: ReturnType<typeof buildPayload>) {
  return existing.date !== payload.date ||
    existing.opponent !== payload.opponent ||
    existing.competition !== payload.competition ||
    existing.status !== payload.status ||
    existing.is_home !== payload.is_home ||
    existing.stadium !== payload.stadium ||
    existing.tv_channel !== payload.tv_channel ||
    existing.river_score !== payload.river_score ||
    existing.opponent_score !== payload.opponent_score ||
    existing.promiedos_game_id !== payload.promiedos_game_id
}

function dedupeByGameId(games: NormalizedGame[]) {
  return Array.from(new Map(games.map((game) => [game.promiedosGameId, game])).values())
}

function cleanTeamName(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}
