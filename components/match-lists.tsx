"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Tv } from "lucide-react"
import type { Competition, Match } from "@/lib/data/types"
import { formatTime, formatWeekdayDate } from "@/lib/format"
import { TeamCrest } from "@/components/team-crest"
import { cn } from "@/lib/utils"

const filters: Array<Competition | "Todas"> = ["Todas", "Torneo Apertura", "Copa Sudamericana", "Copa Argentina"]

const competitionStyle: Record<Competition, string> = {
  "Torneo Apertura": "border-l-border bg-card",
  "Copa Sudamericana": "border-l-primary bg-primary/5",
  "Copa Argentina": "border-l-black bg-black/5",
}

const resultStyle = {
  win: {
    label: "G",
    article: "border-l-emerald-600 bg-emerald-50/70",
    badge: "bg-emerald-600 text-white",
    score: "text-emerald-700",
  },
  draw: {
    label: "E",
    article: "border-l-zinc-500 bg-zinc-100/70",
    badge: "bg-zinc-700 text-white",
    score: "text-zinc-700",
  },
  loss: {
    label: "P",
    article: "border-l-primary bg-primary/5",
    badge: "bg-primary text-primary-foreground",
    score: "text-primary",
  },
} as const

export function UpcomingMatches({ matches }: { matches: Match[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("Todas")
  const visible = useMemo(() => matches.filter((match) => active === "Todas" || match.competition === active), [active, matches])

  return (
    <section className="space-y-3 md:space-y-4">
      <FilterBar active={active} onChange={setActive} />
      <div className="space-y-2.5 md:space-y-3">
        {visible.map((match) => (
          <article key={match.id} className={cn("grid gap-2.5 rounded-[1.15rem] border border-l-4 p-2.5 shadow-sm md:flex md:items-center md:justify-between md:rounded-2xl md:p-4", competitionStyle[match.competition])}>
            <div className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-2.5 md:gap-3">
              <MatchCrests match={match} />
              <div className="min-w-0">
                <p className="font-display text-[0.9rem] font-bold leading-tight md:text-lg">{formatMatchTitle(match)}</p>
                <p className="mt-0.5 text-[0.62rem] uppercase tracking-wider text-muted-foreground md:mt-1 md:text-xs">{match.competition} · {match.isHome ? "Local" : "Visitante"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.66rem] md:text-xs">
              <InfoMini icon={<Calendar className="h-3.5 w-3.5" />} value={formatWeekdayDate(match.date)} />
              <InfoMini icon={<Clock className="h-3.5 w-3.5" />} value={`${formatTime(match.date)} hs`} />
              {match.tvChannel && <InfoMini icon={<Tv className="h-3.5 w-3.5" />} value={match.tvChannel} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function PreviousResults({ matches }: { matches: Match[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("Todas")
  const visible = useMemo(() => matches.filter((match) => active === "Todas" || match.competition === active), [active, matches])

  return (
    <section className="space-y-3 md:space-y-4">
      <FilterBar active={active} onChange={setActive} />
      <div className="space-y-2.5 md:space-y-3">
        {visible.map((match) => {
          const outcome = getRiverOutcome(match)
          const style = resultStyle[outcome]

          return (
            <Link key={match.id} href={`/fixture/${match.id}?from=resultados`} className={cn("group grid gap-2 rounded-[1.15rem] border border-l-4 p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex md:items-center md:justify-between md:rounded-2xl md:p-4", style.article)}>
              <div className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-2.5 md:flex md:gap-3">
                <span className={cn("hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold md:inline-flex", style.badge)}>
                  {style.label}
                </span>
                <MatchCrests match={match} />
                <div className="min-w-0">
                  <p className="font-display text-[0.92rem] font-bold leading-tight md:text-lg">
                    <span>{formatResultLine(match, style.score)}</span>
                  </p>
                  <p className="mt-0.5 text-[0.62rem] uppercase tracking-wider text-muted-foreground md:mt-1 md:text-xs">{match.competition} · {match.isHome ? "Local" : "Visitante"}</p>
                </div>
              </div>
              <div className="hidden flex-wrap items-center gap-3 md:flex md:pl-0">
                <InfoMini icon={<Calendar className="h-3.5 w-3.5" />} value={formatWeekdayDate(match.date)} />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary md:opacity-0 md:transition md:group-hover:opacity-100">
                  Ver ficha
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function formatMatchTitle(match: Match) {
  return match.isHome ? `River Plate vs. ${match.opponent}` : `${match.opponent} vs. River Plate`
}

function formatResultLine(match: Match, scoreClassName: string) {
  const riverScore = match.riverScore ?? 0
  const opponentScore = match.opponentScore ?? 0
  const score = match.isHome ? `${riverScore} - ${opponentScore}` : `${opponentScore} - ${riverScore}`
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <>
      <span>{homeTeam}</span>
      <span className={cn("mx-1 inline-flex rounded-full bg-background/80 px-2 py-0.5 font-extrabold tabular-nums ring-1 ring-border/60 md:mx-1.5 md:bg-transparent md:px-0 md:py-0 md:ring-0", scoreClassName)}>{score}</span>
      <span>{awayTeam}</span>
    </>
  )
}

function getRiverOutcome(match: Match): keyof typeof resultStyle {
  const riverScore = match.riverScore ?? 0
  const opponentScore = match.opponentScore ?? 0

  if (riverScore > opponentScore) return "win"
  if (riverScore < opponentScore) return "loss"
  return "draw"
}

function MatchCrests({ match }: { match: Match }) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-background/75 px-1.5 py-1 ring-1 ring-border/60 md:gap-1.5 md:bg-transparent md:p-0 md:ring-0">
      <TeamCrest team={homeTeam} size="sm" className="h-7 w-7 md:h-12 md:w-12" />
      <span className="text-[0.6rem] font-extrabold text-muted-foreground md:text-xs">vs</span>
      <TeamCrest team={awayTeam} size="sm" className="h-7 w-7 md:h-12 md:w-12" />
    </div>
  )
}

function FilterBar({ active, onChange }: { active: (typeof filters)[number]; onChange: (value: (typeof filters)[number]) => void }) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-sm md:mx-0 md:inline-flex md:flex-wrap md:overflow-visible md:rounded-full">
      {filters.map((filter) => (
        <button key={filter} type="button" onClick={() => onChange(filter)} className={`shrink-0 rounded-xl px-3 py-1.5 text-[0.68rem] font-bold md:rounded-full md:text-xs ${filter === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {filter}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-1 w-8 rounded-full bg-primary" />
      <h3 className="font-display text-lg font-extrabold uppercase tracking-wider text-foreground">{title}</h3>
    </div>
  )
}

function InfoMini({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {icon}
      <span className="text-foreground/75">{value}</span>
    </span>
  )
}
