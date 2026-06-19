"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { competitionPanels } from "@/lib/data"
import type { CompetitionPanelData } from "@/lib/data/types"
import { TeamCrest } from "@/components/team-crest"
import { cn } from "@/lib/utils"

const panelShortLabels: Record<string, string> = {
  clausura: "Clausura",
  anual: "Anual",
  sudamericana: "Sudamericana",
  "copa-argentina": "Copa Arg.",
  apertura: "Apertura",
}

const shortTeamNames: Record<string, string> = {
  "River Plate": "River Plate",
  "Independiente Rivadavia": "Ind. Rivadavia",
  "Argentinos Juniors": "Argentinos",
  "Rosario Central": "Rosario Central",
  "Racing Club": "Racing",
  "Barracas Central": "Barracas",
  "Atlético Tucumán": "Atl. Tucumán",
  "Estudiantes de Río Cuarto": "Estudiantes RC",
  "Estudiantes de La Plata": "Estudiantes LP",
  "Red Bull Bragantino": "Bragantino",
  "Boca Juniors": "Boca",
  "Belgrano (Córdoba)": "Belgrano",
  "Gimnasia La Plata": "Gimnasia",
  "Sarmiento (Junín)": "Sarmiento",
  "Talleres (Córdoba)": "Talleres",
  "Unión (Santa Fe)": "Unión",
  "Instituto (Córdoba)": "Instituto",
  "Gimnasia (Mendoza)": "Gimnasia Mza.",
  "Central Córdoba (Santiago del Estero)": "Central Cba.",
  "Newell's Old Boys": "Newell's",
  "Deportivo Riestra": "Riestra",
}

type RiverBracketMatch = {
  round: string
  date: string
  home: string
  away: string
  homeScore?: number | string
  awayScore?: number | string
  href?: string
  note?: string
  result?: "advanced" | "lost" | "pending"
}

const aperturaRiverPlayoffs = [
  {
    round: "Octavos",
    date: "10 de mayo",
    href: "/fixture/match-25",
    home: "River Plate",
    away: "San Lorenzo",
    homeScore: 2,
    awayScore: 2,
    note: "River 4-3 en penales",
    result: "advanced",
  },
  {
    round: "Cuartos",
    date: "13 de mayo",
    href: "/fixture/match-26",
    home: "River Plate",
    away: "Gimnasia y Esgrima La Plata",
    homeScore: 2,
    awayScore: 0,
    result: "advanced",
  },
  {
    round: "Semifinal",
    date: "16 de mayo",
    href: "/fixture/match-27",
    home: "River Plate",
    away: "Rosario Central",
    homeScore: 1,
    awayScore: 0,
    result: "advanced",
  },
  {
    round: "Final",
    date: "24 de mayo",
    href: "/fixture/match-28",
    home: "River Plate",
    away: "Belgrano",
    homeScore: 2,
    awayScore: 3,
    result: "lost",
  },
] satisfies RiverBracketMatch[]

const sudamericanaRiverKnockouts = [
  {
    round: "Octavos",
    date: "Por definir",
    home: "River Plate",
    away: "Independiente Santa Fe o Caracas",
    homeScore: "-",
    awayScore: "-",
    note: "Rival definido por el cruce Santa Fe-Caracas",
    result: "pending",
  },
] satisfies RiverBracketMatch[]

export function CompetitionSelector() {
  const [panels, setPanels] = useState<CompetitionPanelData[]>(competitionPanels)
  const [active, setActive] = useState(competitionPanels[0].key)
  const panel = panels.find((item) => item.key === active) ?? panels[0]

  useEffect(() => {
    let ignore = false

    async function loadLiveStandings() {
      try {
        const response = await fetch("/api/competition-standings")
        if (!response.ok) return

        const data = (await response.json()) as { panels?: CompetitionPanelData[] }
        if (!ignore && data.panels?.length) {
          setPanels(data.panels)
        }
      } catch {
        // Keep static standings if the live source is unavailable.
      }
    }

    loadLiveStandings()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex w-fit max-w-full flex-nowrap gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-sm md:rounded-full">
        {panels.map((item) => (
          <button key={item.key} type="button" onClick={() => setActive(item.key)} className={`mx-0.5 w-max shrink-0 rounded-xl px-2 py-1.5 text-[0.52rem] font-bold leading-tight md:rounded-full md:px-3 md:text-xs ${item.key === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="md:hidden">{panelShortLabels[item.key] ?? item.label}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {panel.key === "apertura" ? (
        <>
          <RiverBracket
            eyebrow="Playoffs"
            title="Camino en el Torneo Apertura"
            matches={aperturaRiverPlayoffs}
          />
          <CompetitionPanelCard panel={panel}>
            <Standings panel={panel} />
          </CompetitionPanelCard>
        </>
      ) : panel.key === "sudamericana" ? (
        <>
          <RiverBracket
            eyebrow="Fase Eliminatoria"
            title="Camino en la Copa Sudamericana"
            matches={sudamericanaRiverKnockouts}
          />
          <CompetitionPanelCard panel={panel}>
            <Standings panel={panel} />
          </CompetitionPanelCard>
        </>
      ) : (
        <CompetitionPanelCard panel={panel}>
          {panel.key === "copa-argentina" ? <CopaArgentinaBracket /> : <Standings panel={panel} />}
        </CompetitionPanelCard>
      )}
    </div>
  )
}

function CompetitionPanelCard({ panel, children }: { panel: CompetitionPanelData; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-3 py-3 md:px-5 md:py-4">
        <h3 className="font-display text-base font-extrabold md:text-xl">{panel.title}</h3>
      </header>
      {children}
      {panel.note && <p className="border-t border-border px-3 py-3 text-xs text-muted-foreground md:px-5 md:text-sm">{panel.note}</p>}
    </section>
  )
}

function RiverBracket({ eyebrow, title, matches }: { eyebrow: string; title: string; matches: RiverBracketMatch[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card px-3 py-3 shadow-sm md:px-4 md:py-4">
      <div className="mb-2 flex flex-col gap-1 md:mb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-primary md:text-[0.7rem]">{eyebrow}</p>
          <h4 className="font-display text-sm font-extrabold md:text-base">{title}</h4>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(8.75rem,1fr))]">
        {matches.map((match, index) => (
          <div key={match.round} className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <BracketMatchCard match={match} />
            {index < matches.length - 1 && (
              <div className="hidden h-px w-5 bg-border md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function BracketMatchCard({ match }: { match: RiverBracketMatch }) {
  const cardClassName = cn(
    "block overflow-hidden rounded-lg border bg-card shadow-sm transition",
    match.href && "hover:-translate-y-0.5 hover:shadow-md",
    match.result === "lost" ? "border-red-200" : match.result === "pending" ? "border-border" : "border-primary/30",
  )

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-2.5 py-1.5">
        <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:text-[0.64rem]">{match.round}</span>
        <span className="text-[0.62rem] font-semibold text-muted-foreground md:text-[0.7rem]">{match.date}</span>
      </div>
      <div className="space-y-1 p-2">
        <PlayoffTeamLine team={match.home} score={match.homeScore ?? "-"} highlighted={match.home === "River Plate"} />
        <PlayoffTeamLine team={match.away} score={match.awayScore ?? "-"} highlighted={match.away === "River Plate"} />
        {match.note && <p className="pt-0.5 text-[0.62rem] font-semibold text-primary md:text-[0.7rem]">{match.note}</p>}
      </div>
    </>
  )

  if (!match.href) {
    return <div className={cardClassName}>{content}</div>
  }

  return (
    <Link href={match.href} className={cardClassName}>
      {content}
    </Link>
  )
}

function PlayoffTeamLine({ team, score, highlighted }: { team: string; score: number | string; highlighted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md px-1.5 py-1", highlighted && "bg-primary/5")}>
      <TeamCrest team={team} size="sm" className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
      <span className={cn("min-w-0 flex-1 truncate text-[0.72rem] font-bold md:text-xs", highlighted && "text-primary")}>{team}</span>
      <span className={cn("font-display text-sm font-extrabold tabular-nums md:text-base", highlighted ? "text-primary" : "text-foreground")}>{score}</span>
    </div>
  )
}

function Standings({ panel }: { panel: CompetitionPanelData }) {
  return (
    <div>
      <div className="p-2 md:overflow-x-auto md:p-4">
        <table className="w-full table-fixed text-[0.58rem] md:min-w-full md:table-auto md:text-sm">
          <thead>
            <tr className="text-left text-[0.52rem] uppercase tracking-[0.08em] text-muted-foreground md:text-xs md:tracking-[0.18em]">
              <th className="w-[2rem] px-0.5 py-2 md:w-12 md:px-3">Pos</th>
              <th className="px-0.5 py-2 md:px-3">Equipo</th>
              <th className="w-[1.45rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">PJ</th>
              <th className="w-[1.45rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">PG</th>
              <th className="w-[1.45rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">PE</th>
              <th className="w-[1.45rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">PP</th>
              <th className="w-[1.45rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">DG</th>
              <th className="w-[1.65rem] px-0.5 py-2 text-center md:w-auto md:px-3 md:text-left">Pts</th>
            </tr>
          </thead>
          <tbody>
            {panel.standings.map((row, index) => {
              const highlight = getQualificationHighlight(panel.key, row.team, index, panel.standings.length)

              return (
              <tr key={row.team} className={cn("border-t border-border", highlight.row)}>
                <td className="px-0.5 py-2 md:px-3 md:py-3">
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[0.58rem] font-extrabold md:h-7 md:min-w-7 md:px-2 md:text-xs",
                      highlight.position,
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="min-w-0 px-0.5 py-2 font-semibold md:px-3 md:py-3">
                  <div className="flex min-w-0 items-center gap-1 md:gap-3">
                    <TeamCrest team={row.team} size="sm" className="h-4 w-4 shrink-0 md:h-8 md:w-8" />
                    <span className="truncate">
                      <span className="md:hidden">{shortTeamNames[row.team] ?? row.team}</span>
                      <span className="hidden md:inline">{row.team}</span>
                    </span>
                  </div>
                </td>
                <td className="px-0.5 py-2 text-center md:px-3 md:py-3 md:text-left">{row.played}</td>
                <td className="px-0.5 py-2 text-center md:px-3 md:py-3 md:text-left">{row.won}</td>
                <td className="px-0.5 py-2 text-center md:px-3 md:py-3 md:text-left">{row.drawn}</td>
                <td className="px-0.5 py-2 text-center md:px-3 md:py-3 md:text-left">{row.lost}</td>
                <td className="px-0.5 py-2 text-center md:px-3 md:py-3 md:text-left">{row.goalDifference}</td>
                <td className="px-0.5 py-2 text-center font-extrabold text-primary md:px-3 md:py-3 md:text-left">{row.points}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {panel.key === "anual" && <AnnualQualificationLegend />}
    </div>
  )
}

function getQualificationHighlight(panelKey: string, team: string, index: number, totalRows: number) {
  const isAperturaChampion = team === "Belgrano" || team === "Belgrano (Córdoba)"

  if (panelKey === "anual" && (index < 3 || isAperturaChampion)) {
    return {
      row: "bg-emerald-50/90",
      position: "bg-emerald-600 text-white",
    }
  }

  if (panelKey === "anual" && index < 10) {
    return {
      row: "bg-sky-50/90",
      position: "bg-sky-600 text-white",
    }
  }

  if (panelKey === "anual" && index === totalRows - 1) {
    return {
      row: "bg-red-50/90",
      position: "bg-red-600 text-white",
    }
  }

  if (team === "River Plate") {
    return {
      row: "bg-primary/5",
      position: "bg-primary text-primary-foreground",
    }
  }

  if (panelKey === "apertura" && index < 8) {
    return {
      row: "bg-emerald-50/80",
      position: "bg-emerald-600 text-white",
    }
  }

  if (panelKey === "sudamericana" && index === 0) {
    return {
      row: "bg-emerald-50/90",
      position: "bg-emerald-600 text-white",
    }
  }

  if (panelKey === "sudamericana" && index === 1) {
    return {
      row: "bg-amber-50/90",
      position: "bg-amber-500 text-white",
    }
  }

  return {
    row: "",
    position: "bg-muted text-foreground",
  }
}

function AnnualQualificationLegend() {
  return (
    <div className="border-t border-border px-3 py-3 md:px-5">
      <div className="flex flex-wrap gap-2 text-[0.68rem] font-semibold md:text-xs">
        <LegendItem colorClassName="bg-emerald-600" label="Copa Libertadores" />
        <LegendItem colorClassName="bg-sky-600" label="Copa Sudamericana" />
        <LegendItem colorClassName="bg-red-600" label="Descenso" />
      </div>
      <p className="mt-2 text-[0.68rem] leading-5 text-muted-foreground md:text-xs">
        Belgrano figura en Libertadores por ser campeón del Apertura. Si un campeón ya ocupa zona de copa por la anual, ese cupo se corre hacia abajo.
      </p>
    </div>
  )
}

function LegendItem({ colorClassName, label }: { colorClassName: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1">
      <span className={cn("h-2.5 w-2.5 rounded-full", colorClassName)} />
      {label}
    </span>
  )
}

function CopaArgentinaBracket() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">16avos de final</p>
        <BracketMatch home="River Plate" away="Aldosivi" date="17 de julio" active />
      </div>

      <div className="hidden h-px w-16 bg-border md:block" />

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Posible cruce</p>
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-xs font-extrabold text-muted-foreground ring-1 ring-border">
              8vos
            </span>
            <div>
              <p className="font-display text-base font-extrabold">Ganador del lado de River</p>
              <p className="text-sm text-muted-foreground">Rival a confirmar según avance la llave.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BracketMatch({ home, away, date, active }: { home: string; away: string; date: string; active?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", active ? "border-primary/40" : "border-border")}>
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {date}
      </div>
      <BracketTeam team={home} highlighted={home === "River Plate"} />
      <div className="border-t border-border" />
      <BracketTeam team={away} highlighted={away === "River Plate"} />
    </div>
  )
}

function BracketTeam({ team, highlighted }: { team: string; highlighted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", highlighted && "bg-primary/5")}>
      <TeamCrest team={team} size="sm" />
      <span className={cn("font-display text-base font-extrabold", highlighted && "text-primary")}>{team}</span>
    </div>
  )
}
