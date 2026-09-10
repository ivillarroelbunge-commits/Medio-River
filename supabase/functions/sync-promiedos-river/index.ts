import { withSupabase } from "npm:@supabase/server@1.5.3"

const BASE = "https://api.promiedos.com.ar"
const XVER = "1.11.7.5"
const RIVER = "igi"
const BA = "America/Argentina/Buenos_Aires"
const SOURCE_TZ = "America/Los_Angeles"
const BACKFILL_FROM = Date.parse("2026-07-01T00:00:00-03:00")

const LEAGUES = [
  { id: "hc", competition: "league" as const },
  { id: "gea", competition: "Copa Argentina" as const },
  { id: "dij", competition: "Copa Sudamericana" as const },
]

type Competition =
  | "Torneo Apertura"
  | "Torneo Clausura"
  | "Copa Sudamericana"
  | "Copa Argentina"
  | "Amistoso"
type Mode = "fixtures" | "today" | "backfill_recent"
type Status = "upcoming" | "played"
type Side = "river" | "opponent"
type Team = { id?: string; name?: string; short_name?: string; url_name?: string }
type Game = {
  id?: string
  league?: { id?: string; name?: string }
  teams?: Team[]
  scores?: number[]
  penalties?: number[]
  status?: { enum?: number; name?: string }
  start_time?: string
  stage_round_name?: string
  tv_networks?: Array<{ name?: string }>
  game_info?: Array<{ name?: string; value?: string }>
  players?: any
  events?: any[]
}
type Filter = { key?: string; selected?: boolean; games?: Game[] }
type Existing = {
  id: string
  date: string
  opponent: string
  competition: Competition
  status: Status
  is_home: boolean
  stadium: string
  tv_channel: string | null
  river_score: number | null
  opponent_score: number | null
  referee: string | null
  detail: any
  updated_by: string | null
  promiedos_game_id: string | null
}
type Lineup = {
  coach: string
  starters: string[]
  substitutes: string[]
  numbers: Record<string, number>
}
type Detail = {
  sourceLabel: string
  referee?: string
  resultNote?: string
  penaltyShootout?: {
    river: number
    opponent: number
    winner: Side
    kicks?: {
      river: Array<{ player: string; scored: boolean }>
      opponent: Array<{ player: string; scored: boolean }>
    }
  }
  goals: Array<{ team: Side; player: string; minute: string; assist?: string; detail?: string }>
  cards: Array<{ team: Side; player: string; minute: string; card: "yellow" | "red" }>
  substitutions: Array<{ team: Side; minute: string; playerIn: string; playerOut: string }>
  lineups: { river: Lineup; opponent: Lineup }
}
type Normalized = {
  promiedosGameId: string
  date: string
  opponent: string
  competition: Competition
  status: Status
  isHome: boolean
  stadium?: string
  referee?: string | null
  tvChannel: string | null
  riverScore: number | null
  opponentScore: number | null
  detail?: Detail | null
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 })
    }

    let mode: Mode = "fixtures"
    try {
      const body = await req.json()
      if (body?.mode === "today" || body?.mode === "backfill_recent") {
        mode = body.mode
      } else if (body?.mode && body.mode !== "fixtures") {
        return Response.json({ ok: false, error: "Invalid sync mode" }, { status: 400 })
      }
    } catch {}

    try {
      const { data, error } = await ctx.supabaseAdmin
        .from("matches")
        .select(
          "id,date,opponent,competition,status,is_home,stadium,tv_channel,river_score,opponent_score,referee,detail,updated_by,promiedos_game_id",
        )
      if (error) throw error

      const existing = (data ?? []) as Existing[]
      let source: Normalized[]
      if (mode === "today") source = await today(true)
      else if (mode === "backfill_recent") source = await backfill(existing)
      else source = await fixtures()

      const games = dedupe(source)
      const summary = { mode, found: games.length, inserted: 0, updated: 0, unchanged: 0 }
      const changed: any[] = []

      for (const game of games) {
        const current = find(existing, game)
        const next = payload(game, current)

        if (current) {
          if (!diff(current, next)) {
            summary.unchanged += 1
            continue
          }

          const { error } = await ctx.supabaseAdmin.from("matches").update(next).eq("id", current.id)
          if (error) throw error
          Object.assign(current, next)
          summary.updated += 1
          changed.push(compact(current.id, game))
          continue
        }

        const row = { id: `promiedos-${game.promiedosGameId}`, ...next }
        const { error } = await ctx.supabaseAdmin.from("matches").insert(row)
        if (error) throw error
        existing.push(row as Existing)
        summary.inserted += 1
        changed.push(compact(row.id, game))
      }

      return Response.json({ ok: true, ...summary, games: changed })
    } catch (error) {
      console.error("Promiedos River sync failed", error)
      return Response.json(
        { ok: false, error: error instanceof Error ? error.message : "Unknown sync error" },
        { status: 500 },
      )
    }
  }),
}

async function fixtures() {
  const out: Normalized[] = []
  for (const league of LEAGUES) {
    for (const game of await leagueGames(league.id)) {
      if (!riverGame(game)) continue
      const normalized = basic(game, league.competition)
      if (normalized) out.push(normalized)
    }
  }
  return out
}

async function leagueGames(id: string) {
  const data = await api(`/league/tables_and_fixtures/${id}`)
  const games = collect(data)
  const filters = (Array.isArray(data?.games?.filters) ? data.games.filters : []) as Filter[]

  let index = filters.findIndex((filter) => filter.selected === true)
  if (index < 0) index = filters.findIndex((filter) => Array.isArray(filter.games) && filter.games.length > 0)
  if (index < 0) index = 0

  const remaining = filters.slice(index).filter((filter) => filter.key && filter.key !== "latest")
  const responses = await Promise.allSettled(
    remaining.map((filter) => api(`/league/games/${id}/${encodeURIComponent(filter.key!)}`)),
  )
  for (const response of responses) {
    if (response.status === "fulfilled") games.push(...collect(response.value))
  }
  return games
}

async function today(enrich: boolean) {
  const data = await api(`/games/${dateBA(new Date())}`)
  const out: Normalized[] = []

  for (const league of Array.isArray(data?.leagues) ? data.leagues : []) {
    const configured = LEAGUES.find((candidate) => candidate.id === String(league?.id ?? ""))
    if (!configured) continue

    for (const game of Array.isArray(league?.games) ? league.games : []) {
      if (!riverGame(game)) continue
      const normalized = basic(game, configured.competition)
      if (!normalized) continue
      if (enrich && normalized.status === "played") {
        out.push((await detailed(normalized.promiedosGameId)) ?? normalized)
      } else {
        out.push(normalized)
      }
    }
  }

  return out
}

async function backfill(existing: Existing[]) {
  const team = await api(`/team/${RIVER}`)
  const rows = Array.isArray(team?.games?.last?.rows) ? team.games.last.rows : []
  const ids = new Set<string>()

  for (const row of rows) {
    const game = row?.game as Game | undefined
    if (!game?.id || game.status?.enum !== 3 || !game.start_time) continue
    const kickoffAt = kickoff(game.start_time)
    if (kickoffAt && kickoffAt.getTime() >= BACKFILL_FROM) ids.add(game.id)
  }

  for (const match of existing) {
    if (match.status !== "played" || !match.promiedos_game_id) continue
    if (
      !match.detail ||
      !match.referee ||
      placeholder(match.stadium) ||
      !hasLineupNumbers(match.detail)
    ) {
      ids.add(match.promiedos_game_id)
    }
  }

  const details = await mapLimit([...ids], 4, detailed)
  return details.filter((value): value is Normalized => Boolean(value))
}

function hasLineupNumbers(detail: any) {
  const river = detail?.lineups?.river
  const opponent = detail?.lineups?.opponent
  if (!river || !opponent) return false

  const riverPlayers = [...(Array.isArray(river.starters) ? river.starters : []), ...(Array.isArray(river.substitutes) ? river.substitutes : [])]
  const opponentPlayers = [...(Array.isArray(opponent.starters) ? opponent.starters : []), ...(Array.isArray(opponent.substitutes) ? opponent.substitutes : [])]
  const riverNumbers = river.numbers && typeof river.numbers === "object" ? river.numbers : {}
  const opponentNumbers = opponent.numbers && typeof opponent.numbers === "object" ? opponent.numbers : {}

  return (
    riverPlayers.length > 0 &&
    opponentPlayers.length > 0 &&
    riverPlayers.every((player) => validJerseyNumber(riverNumbers[player])) &&
    opponentPlayers.every((player) => validJerseyNumber(opponentNumbers[player]))
  )
}

async function detailed(id: string) {
  const data = await api(`/gamecenter/${encodeURIComponent(id)}`)
  const game = data?.game as Game | undefined
  if (!game || !riverGame(game)) return null
  return normalizeDetail(game)
}

function normalizeDetail(game: Game): Normalized | null {
  if (!game.id || !game.start_time || !game.teams || game.teams.length < 2) return null
  const kickoffAt = kickoff(game.start_time)
  if (!kickoffAt) return null
  const selectedCompetition = competition(game, kickoffAt)
  const normalized = basic(game, selectedCompetition)
  if (!normalized) return null
  const info = gameInfo(game)

  return {
    ...normalized,
    stadium: info.stadium || "A confirmar",
    referee: info.referee,
    tvChannel: info.tv ?? normalized.tvChannel,
    detail: detail(game, normalized.isHome, normalized.opponent, info.referee),
  }
}

function basic(game: Game, selectedCompetition: "league" | Competition): Normalized | null {
  if (!game.id || !game.start_time || !game.teams || game.teams.length < 2) return null
  const kickoffAt = kickoff(game.start_time)
  if (!kickoffAt) return null

  const home = game.teams[0]
  const away = game.teams[1]
  const riverHome = riverTeam(home)
  const riverAway = riverTeam(away)
  if (!riverHome && !riverAway) return null

  const opponentTeam = riverHome ? away : home
  const opponent = clean(opponentTeam.name ?? opponentTeam.short_name ?? "")
  if (!opponent) return null

  const selected = selectedCompetition === "league" ? infer(game, kickoffAt) : selectedCompetition
  const finished = game.status?.enum === 3
  const scores = Array.isArray(game.scores) ? game.scores : []
  const homeScore = num(scores[0]) ? Math.trunc(scores[0]) : null
  const awayScore = num(scores[1]) ? Math.trunc(scores[1]) : null

  return {
    promiedosGameId: game.id,
    date: kickoffAt.toISOString(),
    opponent,
    competition: selected,
    status: finished ? "played" : "upcoming",
    isHome: riverHome,
    tvChannel:
      game.tv_networks
        ?.map((network) => network.name?.trim())
        .filter(Boolean)
        .join(" / ") || null,
    riverScore: finished ? (riverHome ? homeScore : awayScore) : null,
    opponentScore: finished ? (riverHome ? awayScore : homeScore) : null,
  }
}

function competition(game: Game, kickoffAt: Date): Competition {
  const id = game.league?.id
  const name = norm(game.league?.name ?? "")
  if (id === "hc") return infer(game, kickoffAt)
  if (id === "dij" || name.includes("sudamericana")) return "Copa Sudamericana"
  if (id === "gea" || name.includes("copa argentina")) return "Copa Argentina"
  if (id === "dcb" || name.includes("amistoso")) return "Amistoso"
  return infer(game, kickoffAt)
}

function detail(game: Game, homeRiver: boolean, opponent: string, referee: string | null): Detail {
  const home: Side = homeRiver ? "river" : "opponent"
  const away: Side = homeRiver ? "opponent" : "river"
  const side = (teamNumber: number): Side => (teamNumber === 1 ? home : away)
  const events: any[] = []
  const penaltyStages: any[] = []

  for (const stage of Array.isArray(game.events) ? game.events : []) {
    if (stage?.is_penalties_stage) {
      penaltyStages.push(stage)
      continue
    }
    for (const row of Array.isArray(stage?.rows) ? stage.rows : []) {
      for (const event of Array.isArray(row?.events) ? row.events : []) events.push(event)
    }
  }

  const goals: Detail["goals"] = []
  for (const event of events) {
    const type = Number(event?.type)
    if (![1, 2, 3].includes(type)) continue
    const player = clean(String(event?.texts?.[0] ?? ""))
    if (!player) continue
    const assist = type === 1 ? clean(String(event?.texts?.[1] ?? "")) || undefined : undefined
    goals.push({
      team: side(Number(event?.team)),
      player,
      minute: minute(String(event?.time ?? "")),
      ...(assist ? { assist } : {}),
      ...(type === 2 ? { detail: "Gol en contra" } : type === 3 ? { detail: "Penal" } : {}),
    })
  }

  const cards: Detail["cards"] = []
  for (const event of events) {
    const type = Number(event?.type)
    if (![4, 5, 6].includes(type)) continue
    const player = clean(String(event?.texts?.[0] ?? ""))
    if (player) {
      cards.push({
        team: side(Number(event?.team)),
        player,
        minute: minute(String(event?.time ?? "")),
        card: type === 4 ? "yellow" : "red",
      })
    }
  }

  const substitutions: Detail["substitutions"] = []
  for (const event of events) {
    if (Number(event?.type) !== 15) continue
    const playerIn = clean(String(event?.texts?.[0] ?? ""))
    const playerOut = clean(String(event?.texts?.[1] ?? ""))
    if (playerIn && playerOut) {
      substitutions.push({
        team: side(Number(event?.team)),
        minute: minute(String(event?.time ?? "")),
        playerIn,
        playerOut,
      })
    }
  }

  const lineups = Array.isArray(game.players?.lineups?.teams) ? game.players.lineups.teams : []
  const homeLineup = lineups.find((value: any) => Number(value?.team_num) === 1) ?? lineups[0]
  const awayLineup = lineups.find((value: any) => Number(value?.team_num) === 2) ?? lineups[1]
  const riverLineup = homeRiver ? homeLineup : awayLineup
  const opponentLineup = homeRiver ? awayLineup : homeLineup

  const result: Detail = {
    sourceLabel: "Promiedos",
    ...(referee ? { referee } : {}),
    goals,
    cards,
    substitutions,
    lineups: {
      river: lineup(riverLineup, true),
      opponent: lineup(opponentLineup),
    },
  }

  if (Array.isArray(game.penalties) && num(game.penalties[0]) && num(game.penalties[1])) {
    const homePenalties = Math.trunc(game.penalties[0])
    const awayPenalties = Math.trunc(game.penalties[1])
    const riverPenalties = homeRiver ? homePenalties : awayPenalties
    const opponentPenalties = homeRiver ? awayPenalties : homePenalties
    const kicks = {
      river: [] as Array<{ player: string; scored: boolean }>,
      opponent: [] as Array<{ player: string; scored: boolean }>,
    }

    for (const stage of penaltyStages) {
      for (const row of Array.isArray(stage?.rows) ? stage.rows : []) {
        for (const event of Array.isArray(row?.events) ? row.events : []) {
          const type = Number(event?.type)
          if (![3, 17].includes(type)) continue
          const player = clean(String(event?.texts?.[0] ?? ""))
          if (player) kicks[side(Number(event?.team))].push({ player, scored: type === 3 })
        }
      }
    }

    result.penaltyShootout = {
      river: riverPenalties,
      opponent: opponentPenalties,
      winner: riverPenalties > opponentPenalties ? "river" : "opponent",
      kicks,
    }
    result.resultNote =
      riverPenalties > opponentPenalties
        ? "River ganó por penales"
        : `${opponent} ganó por penales`
  }

  return result
}

function lineup(value: any, defendersRightToLeft = false): Lineup {
  const staff = Array.isArray(value?.staff) ? value.staff : []
  const coach =
    clean(
      String(
        (
          staff.find((person: any) =>
            norm(String(person?.formation_position ?? "")).includes("entrenador"),
          ) ?? staff[0]
        )?.name ?? "",
      ),
    ) || "Sin dato"

  const starting = Array.isArray(value?.starting) ? value.starting : []
  const orderedStarting = defendersRightToLeft ? orderDefendersRightToLeft(starting) : starting
  const bench = Array.isArray(value?.bench) ? value.bench : []
  const numbers: Record<string, number> = {}

  const names = (players: any[]) =>
    players
      .map((player) => {
        const name = clean(String(player?.name ?? ""))
        const jerseyNumber = Number(player?.jersey_num)
        if (name && validJerseyNumber(jerseyNumber)) numbers[name] = Math.trunc(jerseyNumber)
        return name
      })
      .filter(Boolean)

  return {
    coach,
    starters: names(orderedStarting),
    substitutes: names(bench),
    numbers,
  }
}

function orderDefendersRightToLeft(players: any[]) {
  const defenders = players
    .filter(isDefender)
    .map((player, index) => ({ player, index, y: pitchY(player) }))
    .sort((a, b) => b.y - a.y || a.index - b.index)
    .map(({ player }) => player)

  if (defenders.length < 2) return players

  let defenderIndex = 0
  return players.map((player) => {
    if (!isDefender(player)) return player
    return defenders[defenderIndex++] ?? player
  })
}

function isDefender(player: any) {
  const position = norm(String(player?.position ?? ""))
  const formationPosition = norm(String(player?.formation_position ?? ""))
  return position === "defensor" || formationPosition.startsWith("defensa ")
}

function pitchY(player: any) {
  const value = Number(player?.pitch_location?.y)
  return Number.isFinite(value) ? value : 50
}

function gameInfo(game: Game) {
  let stadium = ""
  let referee = ""
  let tv = ""

  for (const item of Array.isArray(game.game_info) ? game.game_info : []) {
    const key = norm(String(item?.name ?? ""))
    const value = clean(String(item?.value ?? ""))
    if (!value) continue
    if (key === "estadio") stadium = value
    else if (key.includes("arbitro")) referee = value
    else if (key.includes("tv")) tv = value.replace(/,\s*/g, " / ")
  }

  return { stadium, referee: referee || null, tv: tv || null }
}

async function api(path: string) {
  const response = await fetch(BASE + path, {
    headers: {
      Accept: "application/json",
      "X-VER": XVER,
      "User-Agent": "Mozilla/5.0 (MedioRiverSync/1.0)",
      Referer: "https://www.promiedos.com.ar/",
    },
  })
  if (!response.ok) throw new Error(`Promiedos ${path} returned HTTP ${response.status}`)
  const data = await response.json()
  if (!data || typeof data !== "object") {
    throw new Error(`Promiedos ${path} returned invalid data`)
  }
  return data
}

function collect(value: unknown, out: Game[] = []): Game[] {
  if (!value || typeof value !== "object") return out
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out)
    return out
  }

  const object = value as Record<string, unknown>
  if (
    typeof object.id === "string" &&
    typeof object.start_time === "string" &&
    Array.isArray(object.teams) &&
    object.teams.length >= 2
  ) {
    out.push(object as Game)
    return out
  }

  for (const nested of Object.values(object)) collect(nested, out)
  return out
}

function riverGame(game: Game) {
  return game.teams?.some(riverTeam) ?? false
}

function riverTeam(team: Team) {
  return (
    team.id === RIVER ||
    team.url_name === "river-plate" ||
    norm(team.name ?? team.short_name ?? "") === "river plate"
  )
}

function infer(game: Game, kickoffAt: Date): Competition {
  const round = norm(game.stage_round_name ?? "")
  if (round.includes("apertura")) return "Torneo Apertura"
  if (round.includes("clausura")) return "Torneo Clausura"
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: BA, month: "numeric" }).format(kickoffAt)) <= 6
    ? "Torneo Apertura"
    : "Torneo Clausura"
}

function kickoff(value: string) {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!match) return null
  return wall(+match[3], +match[2], +match[1], +match[4], +match[5], SOURCE_TZ)
}

function wall(year: number, month: number, day: number, hour: number, minuteValue: number, timeZone: string) {
  const base = Date.UTC(year, month - 1, day, hour, minuteValue)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(base)).map((part) => [part.type, part.value]),
  )
  const represented = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  )
  const result = new Date(base - (represented - base))
  return Number.isNaN(result.getTime()) ? null : result
}

function dateBA(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: BA,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${parts.day}-${parts.month}-${parts.year}`
}

function find(existing: Existing[], game: Normalized) {
  const byId = existing.find((match) => match.promiedos_game_id === game.promiedosGameId)
  if (byId) return byId

  const target = +new Date(game.date)
  const maxDifference = 72 * 3600e3
  return existing.find(
    (match) =>
      norm(match.opponent) === norm(game.opponent) &&
      Number.isFinite(+new Date(match.date)) &&
      Math.abs(+new Date(match.date) - target) <= maxDifference,
  )
}

function payload(game: Normalized, existing?: Existing) {
  return {
    date: game.date,
    opponent: game.opponent,
    competition: game.competition,
    status: game.status,
    is_home: game.isHome,
    stadium:
      game.stadium || (existing && !placeholder(existing.stadium) ? existing.stadium : "A confirmar"),
    tv_channel: game.tvChannel ?? existing?.tv_channel ?? null,
    river_score: game.status === "played" ? game.riverScore : null,
    opponent_score: game.status === "played" ? game.opponentScore : null,
    referee: game.referee ?? existing?.referee ?? null,
    detail: game.detail ?? existing?.detail ?? null,
    updated_by: existing?.updated_by ?? null,
    promiedos_game_id: game.promiedosGameId,
  }
}

function diff(existing: Existing, next: ReturnType<typeof payload>) {
  return (
    existing.date !== next.date ||
    existing.opponent !== next.opponent ||
    existing.competition !== next.competition ||
    existing.status !== next.status ||
    existing.is_home !== next.is_home ||
    existing.stadium !== next.stadium ||
    existing.tv_channel !== next.tv_channel ||
    existing.river_score !== next.river_score ||
    existing.opponent_score !== next.opponent_score ||
    existing.referee !== next.referee ||
    JSON.stringify(existing.detail ?? null) !== JSON.stringify(next.detail ?? null) ||
    existing.promiedos_game_id !== next.promiedos_game_id
  )
}

function placeholder(value: string | null | undefined) {
  const normalized = norm(value ?? "")
  return !normalized || normalized === "a confirmar" || normalized.includes("sede a confirmar")
}

function dedupe(games: Normalized[]) {
  return [...new Map(games.map((game) => [game.promiedosGameId, game])).values()]
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function minute(value: string) {
  return value.replace(/'/g, "").replace(/\s+/g, "").trim()
}

function num(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function validJerseyNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}

function compact(id: string, game: Normalized) {
  return {
    id,
    promiedosGameId: game.promiedosGameId,
    date: game.date,
    opponent: game.opponent,
    competition: game.competition,
    score: game.status === "played" ? `${game.riverScore}-${game.opponentScore}` : null,
    detail: Boolean(game.detail),
    stadium: game.stadium ?? null,
    referee: game.referee ?? null,
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const out = new Array<R>(items.length)
  let index = 0

  async function worker() {
    for (;;) {
      const current = index++
      if (current >= items.length) break
      out[current] = await fn(items[current])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}
