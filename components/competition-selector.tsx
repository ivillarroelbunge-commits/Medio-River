"use client"

import { useState } from "react"
import { competitionPanels } from "@/lib/data"
import { TeamCrest } from "@/components/team-crest"
import { cn } from "@/lib/utils"

export function CompetitionSelector() {
  const [active, setActive] = useState(competitionPanels[0].key)
  const panel = competitionPanels.find((item) => item.key === active) ?? competitionPanels[0]

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {competitionPanels.map((item) => (
          <button key={item.key} type="button" onClick={() => setActive(item.key)} className={`rounded-full px-4 py-2 text-sm font-semibold ${item.key === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <h3 className="font-display text-xl font-extrabold">{panel.title}</h3>
          <p className="text-sm text-muted-foreground">{panel.subtitle}</p>
        </header>
        {panel.key === "copa-argentina" ? <CopaArgentinaBracket /> : <Standings panel={panel} />}
        {panel.note && <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground">{panel.note}</p>}
      </section>
    </div>
  )
}

function Standings({ panel }: { panel: (typeof competitionPanels)[number] }) {
  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <th className="w-12 px-3 py-2">Pos</th>
            <th className="px-3 py-2">Equipo</th>
            <th className="px-3 py-2">PJ</th>
            <th className="px-3 py-2">PG</th>
            <th className="px-3 py-2">PE</th>
            <th className="px-3 py-2">PP</th>
            <th className="px-3 py-2">DG</th>
            <th className="px-3 py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {panel.standings.map((row, index) => (
            <tr key={row.team} className={row.team === "River Plate" ? "bg-primary/5" : "border-t border-border"}>
              <td className="px-3 py-3">
                <span
                  className={cn(
                    "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-extrabold",
                    row.team === "River Plate" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {index + 1}
                </span>
              </td>
              <td className="px-3 py-3 font-semibold">
                <div className="flex items-center gap-3">
                  <TeamCrest team={row.team} size="sm" />
                  {row.team}
                </div>
              </td>
              <td className="px-3 py-3">{row.played}</td>
              <td className="px-3 py-3">{row.won}</td>
              <td className="px-3 py-3">{row.drawn}</td>
              <td className="px-3 py-3">{row.lost}</td>
              <td className="px-3 py-3">{row.goalDifference}</td>
              <td className="px-3 py-3 font-extrabold text-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
