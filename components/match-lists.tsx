"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Tv } from "lucide-react"
import type { Competition, Match } from "@/lib/data/types"
import { formatTime, formatWeekdayDate } from "@/lib/format"
import { TeamCrest } from "@/components/team-crest"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const filters: Array<Competition | "Todas"> = ["Todas", "Torneo Clausura", "Copa Sudamericana", "Copa Argentina", "Amistoso", "Torneo Apertura"]

const shortTeamNames: Record<string, string> = {
  "River Plate": "River Plate",
  "A definir": "A definir",
  "Gimnasia La Plata": "Gimnasia LP",
  "Gimnasia y Esgrima La Plata": "Gimnasia LP",
  "Independiente Rivadavia": "Ind. Rivadavia",
  "Independiente Santa Fe": "Ind. Santa Fe",
  "Argentinos Juniors": "Argentinos",
  "Rosario Central": "Rosario C.",
  "Barracas Central": "Barracas",
  "Ciudad de Bolívar": "C. Bolívar",
  "Vélez Sarsfield": "Vélez",
  "Estudiantes de Río Cuarto": "Estudiantes RC",
  "Sarmiento Junín": "Sarmiento Junín",
  Flamengo: "Flamengo",
  "Racing Club": "Racing",
  "Red Bull Bragantino": "Bragantino",
  "Atlético Tucumán": "Atl. Tucumán",
  "Boca Juniors": "Boca",
}

const competitionStyle: Record<Competition, string> = {
  "Torneo Clausura": "border-l-border bg-card",
  "Copa Sudamericana": "border-l-primary bg-primary/5",
  "Copa Argentina": "border-l-black bg-black/5",
  Amistoso: "border-l-zinc-500 bg-zinc-100/70",
  "Torneo Apertura": "border-l-border bg-card",
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
      <div className="space-y-2 md:space-y-3">
        {visible.map((match) => (
          <article key={match.id} className={cn("rounded-[1.15rem] border border-l-4 px-3 py-2.5 shadow-sm md:flex md:min-h-0 md:items-center md:justify-between md:rounded-2xl md:p-4", competitionStyle[match.competition])}>
            <div className="md:hidden">
              <div className="mb-2 flex items-start justify-between gap-3 text-[0.43rem] font-bold uppercase tracking-[0.08em] text-muted-foreground/80 min-[390px]:text-[0.47rem]">
                <span>{match.dateTbd ? "Fecha a confirmar" : formatWeekdayDate(match.date)}</span>
                <span className="text-right">{match.competition}</span>
              </div>
              <UpcomingMatchup match={match} />
            </div>
            <div className="hidden min-w-0 grid-cols-[auto_1fr] items-center gap-2.5 md:grid md:gap-3">
              <MatchCrests match={match} />
              <div className="min-w-0">
                <p className="font-display text-[0.86rem] font-bold leading-tight md:text-lg">
                  <MatchTitle match={match} />
                </p>
                <p className="mt-0.5 text-[0.62rem] uppercase tracking-wider text-muted-foreground md:mt-1 md:text-xs">{match.competition} · {match.isHome ? "Local" : "Visitante"}</p>
              </div>
            </div>
            <div className="mt-3 hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.66rem] md:mt-0 md:flex md:justify-start md:pl-0 md:text-xs">
              <InfoMini icon={<Calendar className="h-3.5 w-3.5" />} value={match.dateTbd ? "Fecha a confirmar" : formatWeekdayDate(match.date)} />
              {!match.dateTbd && (
                <span className="hidden md:inline-flex">
                  <InfoMini icon={<Clock className="h-3.5 w-3.5" />} value={match.timeTbd ? "--:--" : `${formatTime(match.date)} hs`} />
                </span>
              )}
              {match.tvChannel && (
                <>
                  <span className="text-muted-foreground/60 md:hidden">|</span>
                  <InfoMini icon={<Tv className="h-3.5 w-3.5" />} value={match.tvChannel} />
                </>
              )}
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
      <div className="space-y-2 md:space-y-3">
        {visible.map((match) => {
          const outcome = getRiverOutcome(match)
          const style = resultStyle[outcome]

          return (
            <Link key={match.id} href={`/fixture/${match.id}?from=resultados`} className={cn("group block rounded-[1.15rem] border border-l-4 px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex md:min-h-0 md:items-center md:justify-between md:rounded-2xl md:p-4", style.article)}>
              <div className="md:hidden">
                <div className="mb-2 flex items-start justify-between gap-3 text-[0.43rem] font-bold uppercase tracking-[0.08em] text-muted-foreground/80 min-[390px]:text-[0.47rem]">
                  <span>{formatWeekdayDate(match.date)}</span>
                  <span className="text-right">{match.competition}</span>
                </div>
                <PreviousMatchup match={match} scoreClassName={style.score} />
              </div>
              <div className="hidden min-w-0 grid-cols-[auto_1fr] items-center gap-2.5 md:flex md:gap-3">
                <span className={cn("hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold md:inline-flex", style.badge)}>
                  {style.label}
                </span>
                <MatchCrests match={match} />
                <div className="min-w-0">
                  <p className="font-display text-[0.78rem] font-bold leading-tight md:text-lg">
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

function MatchTitle({ match }: { match: Match }) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <span className="inline-flex max-w-full items-center gap-1 whitespace-nowrap">
      <TeamName team={homeTeam} className="truncate" />
      <span className="shrink-0 text-muted-foreground">vs.</span>
      <TeamName team={awayTeam} className="truncate" />
    </span>
  )
}

function UpcomingMatchup({ match }: { match: Match }) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"
  const kickoff = match.dateTbd ? "A confirmar" : match.timeTbd ? "--:--" : formatTime(match.date)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] items-center gap-1.5 md:gap-3">
      <TeamName team={homeTeam} className="text-right font-display text-[0.72rem] font-extrabold leading-tight md:text-lg" />
      <TeamCrest team={homeTeam} size="sm" className="h-7 w-7 md:h-12 md:w-12" />
      <span className="mx-1.5 text-center text-[0.62rem] font-extrabold tabular-nums text-foreground md:mx-0 md:rounded-full md:bg-background/85 md:px-4 md:py-1.5 md:text-sm md:shadow-sm md:ring-1 md:ring-border/70">
        {kickoff}
      </span>
      <TeamCrest team={awayTeam} size="sm" className="h-7 w-7 md:h-12 md:w-12" />
      <TeamName team={awayTeam} className="text-left font-display text-[0.72rem] font-extrabold leading-tight md:text-lg" />
    </div>
  )
}

function PreviousMatchup({ match, scoreClassName }: { match: Match; scoreClassName: string }) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_1.75rem_3.7rem_1.75rem_minmax(0,1fr)] items-center gap-1.5">
      <MobileTeamName team={homeTeam} className="text-right" />
      <TeamCrest team={homeTeam} size="sm" className="h-7 w-7" />
      <PreviousScore match={match} scoreClassName={scoreClassName} />
      <TeamCrest team={awayTeam} size="sm" className="h-7 w-7" />
      <MobileTeamName team={awayTeam} className="text-left" />
    </div>
  )
}

function PreviousScore({ match, scoreClassName }: { match: Match; scoreClassName: string }) {
  const riverScore = match.riverScore ?? 0
  const opponentScore = match.opponentScore ?? 0
  const homeScore = match.isHome ? riverScore : opponentScore
  const awayScore = match.isHome ? opponentScore : riverScore
  const penaltyScore = getPenaltyScoreParts(match)

  return (
    <span className={cn("w-[3.7rem] text-center font-black tabular-nums", scoreClassName)}>
      <span className="block text-[0.72rem] leading-none">{homeScore}-{awayScore}</span>
      {penaltyScore && (
        <span className="mt-0.5 block text-[0.44rem] font-extrabold uppercase leading-none tracking-[0.06em]">
          Pen {penaltyScore.home}-{penaltyScore.away}
        </span>
      )}
    </span>
  )
}

function formatResultLine(match: Match, scoreClassName: string) {
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"

  return (
    <span className="inline-flex max-w-full items-center whitespace-nowrap">
      <TeamName team={homeTeam} className="min-w-0 truncate" />
      <span className={cn("mx-1 inline-flex rounded-full bg-background/80 px-2 py-0.5 font-extrabold tabular-nums ring-1 ring-border/60 md:mx-1.5 md:bg-transparent md:px-0 md:py-0 md:ring-0", scoreClassName)}>{getMatchScoreText(match)}</span>
      <TeamName team={awayTeam} className="min-w-0 truncate" />
    </span>
  )
}

function getMatchScoreText(match: Match) {
  const riverScore = match.riverScore ?? 0
  const opponentScore = match.opponentScore ?? 0
  const homeScore = match.isHome ? riverScore : opponentScore
  const awayScore = match.isHome ? opponentScore : riverScore
  const penaltyScore = getPenaltyScoreParts(match)

  return penaltyScore
    ? `(${penaltyScore.home}) ${homeScore}-${awayScore} (${penaltyScore.away})`
    : `${homeScore}-${awayScore}`
}

function getPenaltyScoreParts(match: Match) {
  const shootout = match.detail?.penaltyShootout
  if (!shootout) return null

  return {
    home: match.isHome ? shootout.river : shootout.opponent,
    away: match.isHome ? shootout.opponent : shootout.river,
  }
}

function getRiverOutcome(match: Match): keyof typeof resultStyle {
  if (match.detail?.penaltyShootout?.winner === "river") return "win"
  if (match.detail?.penaltyShootout?.winner === "opponent") return "loss"

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

function TeamName({ team, className }: { team: string; className?: string }) {
  const shortName = shortTeamNames[team] ?? team

  return (
    <span className={cn("min-w-0", className)}>
      <span className="md:hidden">{shortName}</span>
      <span className="hidden md:inline">{team}</span>
    </span>
  )
}

function MobileTeamName({ team, className }: { team: string; className?: string }) {
  return (
    <span className={cn("block min-w-0 overflow-hidden font-display text-[0.7rem] font-extrabold leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]", className)}>
      {shortTeamNames[team] ?? team}
    </span>
  )
}

function FilterBar({ active, onChange }: { active: (typeof filters)[number]; onChange: (value: (typeof filters)[number]) => void }) {
  return (
    <Select value={active} onValueChange={(value) => onChange(value as (typeof filters)[number])}>
      <SelectTrigger
        aria-label="Competencia"
        className="h-9 w-full rounded-xl border-border bg-card px-3 text-xs font-bold shadow-sm hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20 md:h-11 md:max-w-xs md:rounded-2xl md:px-4 md:text-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="overflow-hidden rounded-2xl border-border bg-card p-1.5 shadow-xl">
        {filters.map((filter) => (
          <SelectItem
            key={filter}
            value={filter}
            className="rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground md:text-sm"
          >
            {filter === "Todas" ? "Todas las competencias" : filter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
