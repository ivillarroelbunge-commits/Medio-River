import { competitionPanels } from "@/lib/data/matches"
import type { CompetitionPanelData, StandingRow } from "@/lib/data/types"

const ESPN_CORE_BASE_URL = "https://sports.core.api.espn.com"
const STANDINGS_REVALIDATE_SECONDS = 60 * 30
const DEFAULT_SEASON = "2026"

type PanelKey = CompetitionPanelData["key"]

interface EspnRef {
  $ref?: string
}

interface EspnStat {
  name?: string
  value?: number
}

interface EspnRecord {
  type?: string
  stats?: EspnStat[]
}

interface EspnStandingEntry {
  team?: EspnRef
  records?: EspnRecord[]
}

interface EspnStanding {
  standings?: EspnStandingEntry[]
}

interface EspnStandingsCollection {
  $ref?: string
  items?: Array<EspnRef & { id?: string }>
}

interface EspnGroupCollection {
  items?: EspnRef[]
}

interface EspnTeam {
  displayName?: string
  name?: string
  location?: string
}

interface EspnSourceConfig {
  league: string
  type: string
  group: string | "auto"
  standingId?: string
}

const espnSources: Partial<Record<PanelKey, EspnSourceConfig>> = {
  clausura: {
    league: "arg.1",
    type: "6",
    group: "auto",
    standingId: "0",
  },
  apertura: {
    league: "arg.1",
    type: "1",
    group: "auto",
    standingId: "0",
  },
  sudamericana: {
    league: "conmebol.sudamericana",
    type: "2",
    group: "auto",
    standingId: "0",
  },
}

export async function getCompetitionPanelsWithLiveStandings() {
  const season = process.env.STANDINGS_SEASON ?? DEFAULT_SEASON
  const panels = await Promise.all(
    competitionPanels.map(async (panel) => {
      const standings = await getLiveStandingsForPanel(panel.key, season)
      if (standings.length === 0) return panel

      return {
        ...panel,
        standings,
        subtitle: `Tabla ESPN actualizada automáticamente · temporada ${season}`,
      }
    }),
  )
  const hasLiveStandings = panels.some((panel, index) => panel.standings !== competitionPanels[index].standings)

  return {
    panels,
    source: hasLiveStandings ? "espn" as const : "static" as const,
    warning: hasLiveStandings ? undefined : "No se pudieron leer tablas externas; se muestran datos locales.",
  }
}

async function getLiveStandingsForPanel(panelKey: PanelKey, season: string) {
  if (panelKey === "anual") {
    return getAnnualStandings(season)
  }

  const source = espnSources[panelKey]
  if (!source) return []

  const candidateRows = await fetchCandidateRows(source, season)
  const riverRows = candidateRows.find((rows) => rows.some((row) => row.team === "River Plate"))

  return (riverRows ?? candidateRows[0] ?? [])
    .filter((row): row is StandingRow => Boolean(row))
}

async function getAnnualStandings(season: string) {
  const annualSources: EspnSourceConfig[] = [
    {
      league: "arg.1",
      type: "1",
      group: "auto",
      standingId: "0",
    },
    {
      league: "arg.1",
      type: "6",
      group: "auto",
      standingId: "0",
    },
  ]
  const rowsBySource = await Promise.all(annualSources.map((source) => fetchCandidateRows(source, season)))
  const accumulated = new Map<string, StandingRow>()

  for (const rows of rowsBySource.flat()) {
    for (const row of rows) {
      const current = accumulated.get(row.team)
      if (!current) {
        accumulated.set(row.team, { ...row })
        continue
      }

      current.played += row.played
      current.won += row.won
      current.drawn += row.drawn
      current.lost += row.lost
      current.goalDifference += row.goalDifference
      current.points += row.points
    }
  }

  return [...accumulated.values()].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.won - a.won)
}

async function fetchCandidateRows(source: EspnSourceConfig, season: string) {
  const candidateStandings = await fetchCandidateStandings(source, season)
  return Promise.all(
    candidateStandings.map(async (standing) => {
      const rows = await Promise.all((standing?.standings ?? []).map(mapEspnStandingEntry))
      return rows
        .filter((row): row is StandingRow => Boolean(row))
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.won - a.won)
    }),
  )
}

async function fetchCandidateStandings(source: EspnSourceConfig, season: string) {
  if (source.group !== "auto") {
    const data = await fetchEspnJson<EspnStanding | EspnStandingsCollection>(buildEspnStandingsUrl(source, season, source.group))
    const standing = isStanding(data) ? data : await fetchFirstStandingFromCollection(data)
    return standing ? [standing] : []
  }

  const groups = await fetchEspnGroups(source, season)
  const standings = await Promise.all(
    groups.map(async (group) => {
      const data = await fetchEspnJson<EspnStanding | EspnStandingsCollection>(buildEspnStandingsUrl(source, season, group))
      return isStanding(data) ? data : fetchFirstStandingFromCollection(data)
    }),
  )

  return standings.filter((standing): standing is EspnStanding => Boolean(standing))
}

async function fetchEspnGroups(source: EspnSourceConfig, season: string) {
  const url = new URL(`/v2/sports/soccer/leagues/${source.league}/seasons/${season}/types/${source.type}/groups`, ESPN_CORE_BASE_URL)
  url.searchParams.set("lang", "es")
  url.searchParams.set("region", "ar")

  const data = await fetchEspnJson<EspnGroupCollection>(url.toString())
  const groupIds = data?.items
    ?.map((group) => group.$ref?.match(/\/groups\/([^/?]+)/)?.[1])
    .filter((groupId): groupId is string => Boolean(groupId))

  return groupIds?.length ? groupIds : ["1"]
}

function buildEspnStandingsUrl(source: EspnSourceConfig, season: string, group: string) {
  const basePath = `/v2/sports/soccer/leagues/${source.league}/seasons/${season}/types/${source.type}/groups/${group}/standings`
  const path = source.standingId ? `${basePath}/${source.standingId}` : basePath
  const url = new URL(path, ESPN_CORE_BASE_URL)
  url.searchParams.set("lang", "es")
  url.searchParams.set("region", "ar")
  return url.toString()
}

async function fetchFirstStandingFromCollection(collection: EspnStandingsCollection | null) {
  const firstStandingUrl = collection?.items?.[0]?.$ref
  if (!firstStandingUrl) return null
  return fetchEspnJson<EspnStanding>(firstStandingUrl)
}

function isStanding(value: EspnStanding | EspnStandingsCollection | null): value is EspnStanding {
  return Array.isArray(value?.standings)
}

async function mapEspnStandingEntry(entry: EspnStandingEntry): Promise<StandingRow | null> {
  const record = entry.records?.find((candidate) => candidate.type === "total") ?? entry.records?.[0]
  const stats = record?.stats ?? []
  const teamName = entry.team?.$ref ? await fetchEspnTeamName(entry.team.$ref) : null

  if (!teamName) return null

  return {
    team: normalizeTeamName(teamName),
    played: readStat(stats, "gamesPlayed"),
    won: readStat(stats, "wins"),
    drawn: readStat(stats, "ties"),
    lost: readStat(stats, "losses"),
    goalDifference: readStat(stats, "pointDifferential"),
    points: readStat(stats, "points"),
  }
}

async function fetchEspnTeamName(teamUrl: string) {
  const team = await fetchEspnJson<EspnTeam>(teamUrl)
  return team?.displayName ?? team?.name ?? team?.location ?? null
}

async function fetchEspnJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url.replace("http://", "https://"), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: STANDINGS_REVALIDATE_SECONDS },
    })

    if (!response.ok) return null

    return (await response.json()) as T
  } catch {
    return null
  }
}

function readStat(stats: EspnStat[], name: string) {
  return Math.trunc(stats.find((stat) => stat.name === name)?.value ?? 0)
}

function normalizeTeamName(team: string) {
  const aliases: Record<string, string> = {
    "CA River Plate": "River Plate",
    "River Plate": "River Plate",
    "RB Bragantino": "Red Bull Bragantino",
    Bragantino: "Red Bull Bragantino",
  }

  return aliases[team] ?? team
}
