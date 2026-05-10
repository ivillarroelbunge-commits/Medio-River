"use client"

import { useState } from "react"
import { competitionPanels } from "@/lib/data"
import { TeamCrest } from "@/components/team-crest"
import { cn } from "@/lib/utils"

const panelShortLabels: Record<string, string> = {
  apertura: "Apertura",
  sudamericana: "Sudamericana",
  "copa-argentina": "Copa Arg.",
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
  "Red Bull Bragantino": "Bragantino",
  "Boca Juniors": "Boca",
}

export function CompetitionSelector() {
  const [active, setActive] = useState(competitionPanels[0].key)
  const panel = competitionPanels.find((item) => item.key === active) ?? competitionPanels[0]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm md:inline-flex md:flex-wrap md:rounded-full">
        {competitionPanels.map((item) => (
          <button key={item.key} type="button" onClick={() => setActive(item.key)} className={`min-w-0 rounded-xl px-1 py-2 text-[0.58rem] font-bold leading-tight md:rounded-full md:px-4 md:text-sm md:font-semibold ${item.key === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="md:hidden">{panelShortLabels[item.key] ?? item.label}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="border-b border-border px-3 py-3 md:px-5 md:py-4">
          <h3 className="font-display text-base font-extrabold md:text-xl">{panel.title}</h3>
          <p className="text-xs text-muted-foreground md:text-sm">{panel.subtitle}</p>
        </header>
        {panel.key === "copa-argentina" ? <CopaArgentinaBracket /> : <Standings panel={panel} />}
        {panel.note && <p className="border-t border-border px-3 py-3 text-xs text-muted-foreground md:px-5 md:text-sm">{panel.note}</p>}
      </section>
    </div>
  )
}

function Standings({ panel }: { panel: (typeof competitionPanels)[number] }) {
  return (
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
            const highlight = getQualificationHighlight(panel.key, row.team, index)

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
  )
}

function getQualificationHighlight(panelKey: string, team: string, index: number) {
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

function CopaArgentinaBracket() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">16avos de final</p>
        <BracketMatch home="River Plate" away="Aldosivi" date="7 de junio" active />
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
