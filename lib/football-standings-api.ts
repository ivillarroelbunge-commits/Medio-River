import { competitionPanels } from "@/lib/data/matches"
import type { CompetitionPanelData, StandingRow } from "@/lib/data/types"

const PROMIEDOS_BASE_URL = "https://api.promiedos.com.ar"
const PROMIEDOS_XVER = process.env.PROMIEDOS_XVER ?? "1.11.7.5"
const STANDINGS_REVALIDATE_SECONDS = 60 * 5

type PanelKey = CompetitionPanelData["key"]

type PromiedosValue = {
  key?: string
  value?: unknown
}

type PromiedosEntity = {
  object?: {
    id?: string
    name?: string
    short_name?: string
  }
}

type PromiedosStandingRow = {
  entity?: PromiedosEntity
  values?: PromiedosValue[]
}

type PromiedosTable = {
  name?: string
  table?: {
    rows?: PromiedosStandingRow[]
  }
}

type PromiedosTableGroup = {
  name?: string
  tables?: PromiedosTable[]
}

type PromiedosLeaguePayload = {
  tables_groups?: PromiedosTableGroup[]
}

export async function getCompetitionPanelsWithLiveStandings() {
  const [argentina, sudamericana] = await Promise.all([
    fetchPromiedosLeague("hc"),
    fetchPromiedosLeague("dij"),
  ])

  let livePanels = 0

  const panels = competitionPanels.map((panel) => {
    const standings = getLiveStandingsForPanel(panel.key, argentina, sudamericana)
    if (standings.length === 0) return panel

    livePanels += 1

    return {
      ...panel,
      standings,
      subtitle: "Tabla Promiedos actualizada automáticamente",
    }
  })

  return {
    panels,
    source: livePanels > 0 ? "promiedos" as const : "static" as const,
    warning: livePanels > 0 ? undefined : "No se pudieron leer las tablas de Promiedos; se muestran datos locales.",
  }
}

function getLiveStandingsForPanel(
  panelKey: PanelKey,
  argentina: PromiedosLeaguePayload | null,
  sudamericana: PromiedosLeaguePayload | null,
) {
  if (panelKey === "clausura") {
    return getRiverGroupStandings(argentina, "clausura")
  }

  if (panelKey === "apertura") {
    return getRiverGroupStandings(argentina, "apertura")
  }

  if (panelKey === "anual") {
    return getNamedTableStandings(argentina, "tabla anual")
  }

  if (panelKey === "sudamericana") {
    return getRiverGroupStandings(sudamericana, "fase de grupos")
  }

  return []
}

function getRiverGroupStandings(payload: PromiedosLeaguePayload | null, groupName: string) {
  const group = payload?.tables_groups?.find((candidate) =>
    normalizeLabel(candidate.name ?? "").includes(normalizeLabel(groupName)),
  )

  if (!group?.tables?.length) return []

  const riverTable = group.tables.find((table) =>
    (table.table?.rows ?? []).some((row) => normalizeTeamName(readTeamName(row)) === "River Plate"),
  )

  return mapPromiedosTable(riverTable)
}

function getNamedTableStandings(payload: PromiedosLeaguePayload | null, tableName: string) {
  const normalizedTarget = normalizeLabel(tableName)

  for (const group of payload?.tables_groups ?? []) {
    const table = group.tables?.find((candidate) =>
      normalizeLabel(candidate.name ?? "").includes(normalizedTarget),
    )

    if (table) return mapPromiedosTable(table)
  }

  return []
}

function mapPromiedosTable(table: PromiedosTable | undefined) {
  return (table?.table?.rows ?? [])
    .map(mapPromiedosStandingRow)
    .filter((row): row is StandingRow => Boolean(row))
}

function mapPromiedosStandingRow(row: PromiedosStandingRow): StandingRow | null {
  const team = normalizeTeamName(readTeamName(row))
  if (!team) return null

  const values = new Map((row.values ?? []).map((item) => [item.key ?? "", item.value]))

  return {
    team,
    played: readNumber(values.get("GamePlayed")),
    won: readNumber(values.get("GamesWon")),
    drawn: readNumber(values.get("GamesEven")),
    lost: readNumber(values.get("GamesLost")),
    goalDifference: readNumber(values.get("Ratio")),
    points: readNumber(values.get("Points")),
  }
}

function readTeamName(row: PromiedosStandingRow) {
  return row.entity?.object?.name ?? row.entity?.object?.short_name ?? ""
}

function readNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"))
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0
}

async function fetchPromiedosLeague(leagueId: string): Promise<PromiedosLeaguePayload | null> {
  try {
    const response = await fetch(`${PROMIEDOS_BASE_URL}/league/tables_and_fixtures/${leagueId}`, {
      headers: {
        Accept: "application/json",
        "X-VER": PROMIEDOS_XVER,
        "User-Agent": "Mozilla/5.0 (MedioRiver/1.0)",
        Referer: "https://www.promiedos.com.ar/",
      },
      next: { revalidate: STANDINGS_REVALIDATE_SECONDS },
    })

    if (!response.ok) return null

    const data = (await response.json()) as PromiedosLeaguePayload
    return Array.isArray(data?.tables_groups) ? data : null
  } catch {
    return null
  }
}

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function normalizeTeamName(team: string) {
  const normalized = team.trim()
  const aliases: Record<string, string> = {
    "CA River Plate": "River Plate",
    "River Plate": "River Plate",
    "Argentinos Jrs.": "Argentinos Juniors",
    "Atlético Tucumán": "Atlético Tucumán",
    "Estudiantes (RC)": "Estudiantes de Río Cuarto",
    "Gimnasia (LP)": "Gimnasia La Plata",
    "Independiente Rivadavia": "Independiente Rivadavia",
    "Newell's": "Newell's Old Boys",
    "Rosario Central": "Rosario Central",
  }

  return aliases[normalized] ?? normalized
}
