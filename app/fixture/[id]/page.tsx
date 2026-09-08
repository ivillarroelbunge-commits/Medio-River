"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ArrowLeft, Calendar, Check, Flag, MapPin, RefreshCw, Square, Trophy, X } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TeamCrest } from "@/components/team-crest"
import { useAppState } from "@/components/app-state-provider"
import type { Match, MatchCardEvent, MatchGoal, MatchLineup, MatchPenaltyKick, MatchSubstitution, MatchTeamSide } from "@/lib/data/types"
import { formatDateLong, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const detailTabs = ["Detalles", "Formaciones"] as const

type TimelineEvent =
  | { type: "goal"; minute: string; team: MatchTeamSide; payload: MatchGoal }
  | { type: "card"; minute: string; team: MatchTeamSide; payload: MatchCardEvent }
  | { type: "substitution"; minute: string; team: MatchTeamSide; payload: MatchSubstitution }
  | { type: "halftime"; minute: string; homeScore: number; awayScore: number }
  | { type: "fulltime"; minute: string; homeScore: number; awayScore: number }
type MatchTimelineEvent = Exclude<TimelineEvent, { type: "halftime" } | { type: "fulltime" }>

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const { matches } = useAppState()
  const match = matches.find((item) => item.id === params.id)
  const [activeDetailTab, setActiveDetailTab] = useState<(typeof detailTabs)[number]>("Detalles")
  const [activeLineupSide, setActiveLineupSide] = useState<"home" | "away">("home")

  if (!match) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="container-prose flex-1 py-6 md:py-10">
          <Link href="/fixture?tab=resultados#resultados-previos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            Volver al fixture
          </Link>
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:mt-8 md:rounded-3xl md:p-8">
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">Partido no encontrado</h1>
            <p className="mt-2 text-muted-foreground">Ese resultado no está cargado en el fixture.</p>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const detail = match.detail
  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"
  const homeScore = match.isHome ? match.riverScore : match.opponentScore
  const awayScore = match.isHome ? match.opponentScore : match.riverScore
  const homeGoals = (detail?.goals ?? []).filter((goal) => (goal.team === "river") === match.isHome)
  const awayGoals = (detail?.goals ?? []).filter((goal) => (goal.team === "river") !== match.isHome)
  const homeLineup = match.isHome ? detail?.lineups.river : detail?.lineups.opponent
  const awayLineup = match.isHome ? detail?.lineups.opponent : detail?.lineups.river
  const homeLineupTone = homeTeam === "River Plate" ? "river" : "opponent"
  const awayLineupTone = awayTeam === "River Plate" ? "river" : "opponent"
  const activeLineupTeam = activeLineupSide === "home" ? homeTeam : awayTeam
  const activeLineup = activeLineupSide === "home" ? homeLineup : awayLineup
  const activeLineupTone = activeLineupTeam === "River Plate" ? "river" : "opponent"

  return (
    <div className="flex min-h-dvh flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-4 py-4 md:space-y-6 md:py-10">
          <Link href="/fixture?tab=resultados#resultados-previos" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary md:text-sm md:normal-case md:tracking-normal">
            <ArrowLeft className="h-4 w-4" />
            Volver al fixture
          </Link>

          <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
            <div className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary px-3 py-4 text-white md:px-8 md:py-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1.5 md:gap-8">
                <TeamBlock team={homeTeam} />
                <div className="rounded-2xl border border-white/15 bg-white/10 px-2.5 py-2.5 text-center shadow-2xl backdrop-blur sm:px-3 sm:py-3 md:rounded-3xl md:px-7 md:py-5">
                  <p className="font-display text-[1.55rem] font-black leading-none sm:text-3xl md:text-6xl">
                    {homeScore ?? "-"} <span className="text-white/40">-</span> {awayScore ?? "-"}
                  </p>
                  <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/65">Final</p>
                  {detail?.penaltyShootout && (
                    <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white md:text-xs">
                      Penales {getPenaltyScore(match)}
                    </p>
                  )}
                </div>
                <TeamBlock team={awayTeam} />
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1.5 md:mt-4 md:gap-8">
                <GoalList goals={homeGoals} />
                <span className="w-[4.75rem] sm:w-[5.4rem] md:w-[9rem]" aria-hidden="true" />
                <GoalList goals={awayGoals} />
              </div>

            </div>
          </section>

          {detail?.penaltyShootout && <PenaltyShootoutCard match={match} />}

          <div className="grid grid-cols-2 rounded-2xl border border-border bg-card p-1 shadow-sm" role="tablist" aria-label="Vista del partido">
            {detailTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeDetailTab === tab}
                onClick={() => setActiveDetailTab(tab)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-extrabold transition md:text-base",
                  activeDetailTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeDetailTab === "Detalles" ? (
            <section className="space-y-4 md:space-y-6">
              <MatchCard>
                {detail && (detail.goals.length > 0 || detail.cards.length > 0 || detail.substitutions.length > 0) ? (
                  <Timeline goals={detail.goals} cards={detail.cards} substitutions={detail.substitutions} match={match} />
                ) : (
                  <EmptyState text="No hay minuto a minuto cargado para este partido." />
                )}
              </MatchCard>
              <MatchCard>
                <MatchFacts match={match} />
              </MatchCard>
            </section>
          ) : (
            <section className="rounded-[1.35rem] border border-border bg-card p-3.5 shadow-sm md:rounded-[1.75rem] md:p-5">
              <div className="md:hidden">
                <div className="mb-4 grid grid-cols-2 rounded-xl border border-border bg-background p-1 shadow-sm" role="tablist" aria-label="Equipo de la formación">
                  {(["home", "away"] as const).map((side) => {
                    const team = side === "home" ? homeTeam : awayTeam

                    return (
                      <button
                        key={side}
                        type="button"
                        role="tab"
                        aria-label={team}
                        aria-selected={activeLineupSide === side}
                        onClick={() => setActiveLineupSide(side)}
                        className={cn(
                          "flex items-center justify-center rounded-lg px-2 py-1.5 transition",
                          activeLineupSide === side
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <TeamCrest team={team} size="sm" className="h-6 w-6" />
                      </button>
                    )
                  })}
                </div>
                <LineupPanel title={activeLineupTeam} lineup={activeLineup} tone={activeLineupTone} />
              </div>
              <div className="hidden gap-5 md:grid md:grid-cols-2">
                <LineupPanel title={homeTeam} lineup={homeLineup} tone={homeLineupTone} />
                <LineupPanel title={awayTeam} lineup={awayLineup} tone={awayLineupTone} />
              </div>
            </section>
          )}

          {detail?.sourceUrl && (
            <p className="text-xs text-muted-foreground">
              Fuente de datos:{" "}
              <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                {detail.sourceLabel ?? "Fuente externa"}
              </a>
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function TeamBlock({ team }: { team: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center md:gap-2">
      <TeamCrest team={team} size="md" className="h-12 w-12 md:h-20 md:w-20" />
      <h1 className="line-clamp-2 font-display text-[0.82rem] font-extrabold leading-tight md:text-2xl">{team}</h1>
    </div>
  )
}

function GoalList({ goals }: { goals: MatchGoal[] }) {
  return (
    <div className="min-h-7 space-y-1 text-center text-[0.56rem] font-semibold leading-tight text-white/80 md:min-h-10 md:text-xs">
      {goals.length > 0 ? (
        goals.map((goal, index) => <GoalMini key={`${goal.minute}-${goal.player}-${index}`} goal={goal} />)
      ) : (
        <span className="text-white/35">Sin goles</span>
      )}
    </div>
  )
}

function MatchFacts({ match }: { match: Match }) {
  const referee = match.detail?.referee ?? match.referee ?? "Sin dato"

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5 md:space-y-0">
      <FactItem icon={<Trophy className="h-4 w-4" />} value={match.competition} />
      <FactItem icon={<Calendar className="h-4 w-4" />} value={`${formatDateLong(match.date)} · ${formatTime(match.date)} hs`} />
      <FactItem icon={<MapPin className="h-4 w-4" />} value={match.stadium} />
      <FactItem icon={<Flag className="h-4 w-4" />} value={referee} />
    </div>
  )
}

function FactItem({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 text-primary">{icon}</span>
      <p className="min-w-0 break-words text-sm font-medium leading-tight text-foreground md:text-base">{value}</p>
    </div>
  )
}

function MatchCard({
  title,
  icon,
  children,
  className,
  bodyClassName,
  style,
  ref,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  style?: React.CSSProperties
  ref?: React.Ref<HTMLElement>
}) {
  return (
    <section ref={ref} style={style} className={cn("rounded-[1.35rem] border border-border bg-card p-3.5 shadow-sm md:rounded-[1.75rem] md:p-5", className)}>
      {(title || icon) && (
        <div className="mb-3 flex items-center gap-2 md:mb-4">
          {icon && <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground md:h-8 md:w-8">{icon}</span>}
          {title && <h2 className="font-display text-lg font-extrabold uppercase tracking-tight md:text-2xl">{title}</h2>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </section>
  )
}

function GoalMini({ goal }: { goal: MatchGoal }) {
  return (
    <p>
      {goal.player} <span className="font-black text-white">{goal.minute}&apos;</span>
    </p>
  )
}

function PenaltyShootoutCard({ match }: { match: Match }) {
  const shootout = match.detail?.penaltyShootout
  if (!shootout) return null

  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"
  const homeKicks = match.isHome ? shootout.kicks?.river : shootout.kicks?.opponent
  const awayKicks = match.isHome ? shootout.kicks?.opponent : shootout.kicks?.river
  const homePenaltyScore = match.isHome ? shootout.river : shootout.opponent
  const awayPenaltyScore = match.isHome ? shootout.opponent : shootout.river

  return (
    <section className="rounded-[1.35rem] border border-border bg-card p-3.5 shadow-sm md:rounded-[1.75rem] md:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
        <div>
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight md:text-2xl">Tanda de penales</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary">
          Ganó River
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-5">
        <PenaltyTeamColumn team={homeTeam} score={homePenaltyScore} kicks={homeKicks ?? []} />
        <PenaltyTeamColumn team={awayTeam} score={awayPenaltyScore} kicks={awayKicks ?? []} align="right" />
      </div>
    </section>
  )
}

function PenaltyTeamColumn({ team, score, kicks, align = "left" }: { team: string; score: number; kicks: MatchPenaltyKick[]; align?: "left" | "right" }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-2.5 md:p-4">
      <div className={cn("mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-1.5 md:gap-2", align === "right" && "grid-cols-[auto_1fr_auto] text-right")}>
        {align === "left" && <TeamCrest team={team} size="sm" className="h-8 w-8" />}
        {align === "right" && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white md:h-9 md:w-9 md:text-base">
            {score}
          </span>
        )}
        <h3 className={cn("min-w-0 truncate font-display text-xs font-extrabold leading-tight md:text-lg", align === "right" && "text-right")}>{team}</h3>
        {align === "right" && <TeamCrest team={team} size="sm" className="h-8 w-8" />}
        {align === "left" && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground md:h-9 md:w-9 md:text-base">
            {score}
          </span>
        )}
      </div>

      {kicks.length > 0 ? (
        <div className="space-y-2">
          {kicks.map((kick, index) => (
            <PenaltyKickRow key={`${team}-${kick.player}-${index}`} kick={kick} align={align} />
          ))}
        </div>
      ) : (
        <EmptyState text="Pateadores sin cargar." />
      )}
    </div>
  )
}

function PenaltyKickRow({ kick, align }: { kick: MatchPenaltyKick; align: "left" | "right" }) {
  const icon = kick.scored ? (
    <Check className="h-3.5 w-3.5" />
  ) : (
    <X className="h-3.5 w-3.5" />
  )

  return (
    <div className={cn("flex items-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-[0.68rem] md:gap-2 md:px-2.5 md:py-2 md:text-sm", kick.scored ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950", align === "right" && "flex-row-reverse text-right")}>
      <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full md:h-6 md:w-6", kick.scored ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 whitespace-normal break-words font-semibold leading-tight">{kick.player}</span>
    </div>
  )
}

function Timeline({ goals, cards, substitutions, match }: { goals: MatchGoal[]; cards: MatchCardEvent[]; substitutions: MatchSubstitution[]; match: Match }) {
  const riverIsHome = match.isHome
  const halftimeScore = getHalftimeScore(goals, riverIsHome)
  const homeFinalScore = match.isHome ? match.riverScore : match.opponentScore
  const awayFinalScore = match.isHome ? match.opponentScore : match.riverScore
  const events: TimelineEvent[] = [
    ...goals.map((goal) => ({ type: "goal" as const, minute: goal.minute, team: goal.team, payload: goal })),
    ...cards.map((card) => ({ type: "card" as const, minute: card.minute, team: card.team, payload: card })),
    ...substitutions.map((substitution) => ({ type: "substitution" as const, minute: substitution.minute, team: substitution.team, payload: substitution })),
    { type: "halftime" as const, minute: "45.5", homeScore: halftimeScore.home, awayScore: halftimeScore.away },
    { type: "fulltime" as const, minute: "999", homeScore: homeFinalScore ?? 0, awayScore: awayFinalScore ?? 0 },
  ].sort((a, b) => getMinuteValue(a.minute) - getMinuteValue(b.minute))

  return (
    <div className="space-y-4 md:space-y-3">
      {events.map((event, index) => {
        if (event.type === "halftime") {
          return <ScoreBreakEvent key="halftime" label="ET" homeScore={event.homeScore} awayScore={event.awayScore} />
        }

        if (event.type === "fulltime") {
          return <ScoreBreakEvent key="fulltime" label="FT" homeScore={event.homeScore} awayScore={event.awayScore} />
        }

        const isHomeEvent = event.team === "river" ? riverIsHome : !riverIsHome
        const align = isHomeEvent ? "left" : "right"

        return (
          <div key={`${event.type}-${event.minute}-${index}`}>
            <div className="relative min-h-6 md:hidden">
              <MobileTimelineEvent event={event} align={align} />
            </div>
            <div className="hidden grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-start gap-3 md:grid">
              {isHomeEvent ? <TimelineEventCard event={event} align={align} /> : <span aria-hidden="true" />}
              <span className="mt-1 h-fit rounded-full bg-background/90 px-2.5 py-1 text-center text-xs font-black text-foreground shadow-sm ring-1 ring-border/70">
                {formatMinute(event.minute)}
              </span>
              {!isHomeEvent ? <TimelineEventCard event={event} align={align} /> : <span aria-hidden="true" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScoreBreakEvent({ label, homeScore, awayScore }: { label: string; homeScore: number; awayScore: number }) {
  return (
    <div className="flex items-center gap-3 py-1 md:py-2">
      <span className="h-px flex-1 bg-border" />
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-foreground shadow-sm md:px-4 md:py-1.5 md:text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{homeScore} - {awayScore}</span>
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function MobileTimelineEvent({ event, align }: { event: MatchTimelineEvent; align: "left" | "right" }) {
  if (align === "right") {
    return (
      <div className="ml-auto flex min-w-0 items-center justify-end gap-2 pl-2 text-right text-sm font-semibold leading-none text-foreground">
        <MobileTimelineText event={event} align={align} />
        <TimelineEventIcon event={event} />
        <span className="shrink-0 text-sm font-black text-muted-foreground">{formatMinute(event.minute)}</span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center justify-start gap-2 pr-2 text-left text-sm font-semibold leading-none text-foreground">
      <span className="shrink-0 text-sm font-black text-muted-foreground">{formatMinute(event.minute)}</span>
      <TimelineEventIcon event={event} />
      <MobileTimelineText event={event} align={align} />
    </div>
  )
}

function MobileTimelineText({ event, align }: { event: MatchTimelineEvent; align: "left" | "right" }) {
  if (event.type === "goal") {
    return <span className="whitespace-nowrap">{event.payload.player}</span>
  }

  if (event.type === "card") {
    return <span className="whitespace-nowrap">{event.payload.player}</span>
  }

  return (
    <span className={cn("flex min-w-0 items-center gap-1.5 whitespace-nowrap", align === "right" && "flex-row-reverse text-right")}>
      <span className="text-foreground">{event.payload.playerIn}</span>
      <span className="text-muted-foreground/60">{event.payload.playerOut}</span>
    </span>
  )
}

function TimelineEventIcon({ event }: { event: MatchTimelineEvent }) {
  if (event.type === "goal") {
    return <span className="shrink-0 text-base leading-none" aria-hidden="true">⚽</span>
  }

  if (event.type === "card") {
    return <Square className={cn("h-4 w-4 shrink-0 fill-current", event.payload.card === "red" ? "text-primary" : "text-yellow-400")} />
  }

  return <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
}

function TimelineEventCard({ event, align }: { event: MatchTimelineEvent; align: "left" | "right" }) {
  return (
    <div className={cn("min-w-0 rounded-2xl border px-4 py-3 text-sm leading-tight", getTimelineEventStyle(event.type, event.team), align === "right" && "text-right")}>
      <div className={cn("flex flex-col", align === "left" ? "items-start" : "items-end")}>
        {event.type === "goal" && <GoalEvent event={event.payload} align={align} />}
        {event.type === "card" && <CardEvent event={event.payload} align={align} />}
        {event.type === "substitution" && <SubstitutionEvent event={event.payload} align={align} />}
      </div>
    </div>
  )
}

function GoalEvent({ event, align = "left" }: { event: MatchGoal; align?: "left" | "right" }) {
  return (
    <div className="space-y-0.5">
      <p className={cn("flex items-center gap-1 font-semibold md:gap-2", align === "right" && "flex-row-reverse justify-end")}>
        <span className="shrink-0 text-xs leading-none md:text-base" aria-hidden="true">⚽</span>
        {event.player}
      </p>
    </div>
  )
}

function CardEvent({ event, align = "left" }: { event: MatchCardEvent; align?: "left" | "right" }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1 md:gap-x-2", align === "right" ? "flex-row-reverse justify-end" : "justify-start")}>
      <Square className={cn("h-3 w-3 shrink-0 fill-current md:h-4 md:w-4", event.card === "red" ? "text-primary" : "text-yellow-500")} />
      <span className="font-semibold">{event.player}</span>
    </div>
  )
}

function SubstitutionEvent({ event, align = "left" }: { event: MatchSubstitution; align?: "left" | "right" }) {
  return (
    <div className={cn("space-y-0.5", align === "right" && "text-right")}>
      <p className={cn("flex items-center gap-1.5 font-semibold md:gap-2", align === "right" ? "flex-row-reverse justify-end" : "justify-start")}>
        <RefreshCw className="h-3 w-3 shrink-0 text-primary md:h-4 md:w-4" />
        Entra {event.playerIn}
      </p>
      <p className="text-[0.65rem] text-muted-foreground md:text-xs">Sale {event.playerOut}</p>
    </div>
  )
}

function LineupPanel({ title, lineup, tone }: { title: string; lineup?: MatchLineup; tone: "river" | "opponent" }) {
  return (
    <section className="space-y-3 md:space-y-4">
      <h3 className="hidden font-display text-lg font-extrabold text-foreground md:block md:text-xl">{title}</h3>

      {lineup && lineup.starters.length > 0 ? (
        <div className="rounded-2xl border border-border bg-background p-3.5 md:p-5">
          <PlayerList title="Titulares" players={lineup.starters} tone={tone} />
          <div className="mt-5 rounded-2xl bg-muted/50 p-3 md:mt-7 md:bg-transparent md:p-0">
            <p className="text-xs text-muted-foreground md:text-sm">Entrenador</p>
            <p className="mt-1 text-base font-semibold text-foreground md:text-lg">{lineup.coach}</p>
          </div>
          <div className="my-5 h-px bg-border md:my-7" />
          <PlayerList title="Suplentes" players={lineup.substitutes} tone={tone} compact />
        </div>
      ) : (
        <EmptyState text="Formación sin cargar." />
      )}
    </section>
  )
}

function PlayerList({ title, players, tone, compact = false }: { title: string; players: string[]; tone: "river" | "opponent"; compact?: boolean }) {
  const orderedPlayers = orderLineupPlayers(players, tone)

  return (
    <div>
      <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.08em] text-foreground md:mb-4 md:text-base md:normal-case md:tracking-normal">{title}</h4>
      <div className="space-y-2 md:space-y-3">
        {orderedPlayers.map((player) => (
          <PlayerRow key={player} player={player} tone={tone} compact={compact} />
        ))}
      </div>
    </div>
  )
}

function PlayerRow({ player, tone, compact }: { player: string; tone: "river" | "opponent"; compact: boolean }) {
  const { number, name } = parsePlayerLabel(player)

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 md:gap-3", compact && "text-muted-foreground")}>
      <span
        className={cn(
          "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-black md:h-7 md:min-w-7 md:text-sm",
          compact
            ? "border border-border bg-card text-muted-foreground"
            : tone === "river"
              ? "bg-primary text-primary-foreground"
              : "bg-zinc-950 text-white",
        )}
      >
        {number}
      </span>
      <span className={cn("min-w-0 text-sm font-medium leading-tight md:text-base", compact ? "text-muted-foreground" : "text-foreground")}>{name}</span>
    </div>
  )
}

function getTimelineEventStyle(type: "goal" | "card" | "substitution", team: MatchTeamSide) {
  if (type === "goal" && team === "river") return "border-primary/30 bg-primary/10"
  if (type === "goal") return "border-zinc-950 bg-zinc-200/85"
  if (type === "card") return "border-border bg-background"
  return "border-border bg-muted/35"
}

function formatMinute(minute: string) {
  return minute.endsWith("'") ? minute : `${minute}'`
}

function getMinuteValue(minute: string) {
  const [base, added] = minute.split("+")
  return Number(base) + (Number(added) || 0) / 100
}

function getHalftimeScore(goals: MatchGoal[], riverIsHome: boolean) {
  return goals.reduce(
    (score, goal) => {
      if (getMinuteValue(goal.minute) > 45.99) return score

      const isHomeGoal = goal.team === "river" ? riverIsHome : !riverIsHome
      if (isHomeGoal) {
        score.home += 1
      } else {
        score.away += 1
      }

      return score
    },
    { home: 0, away: 0 },
  )
}

function parsePlayerLabel(player: string) {
  const parsed = player.match(/^#(\d+)\s+(.+)$/)
  if (!parsed) return { number: "-", name: player }
  return { number: parsed[1], name: parsed[2] }
}

const riverLineOrderByNumber = new Map<number, number>([
  [1, 0],
  [33, 0],
  [41, 0],
  [2, 1],
  [13, 1],
  [16, 1],
  [17, 1],
  [18, 1],
  [20, 1],
  [21, 1],
  [28, 1],
  [29, 1],
  [31, 1],
  [36, 1],
  [5, 2],
  [6, 2],
  [8, 2],
  [10, 2],
  [15, 2],
  [19, 2],
  [22, 2],
  [23, 2],
  [24, 2],
  [25, 2],
  [26, 2],
  [34, 2],
  [39, 2],
  [44, 2],
  [7, 3],
  [9, 3],
  [11, 3],
  [30, 3],
  [32, 3],
  [35, 3],
  [38, 3],
])

function orderLineupPlayers(players: string[], tone: "river" | "opponent") {
  if (tone !== "river") return players

  return players
    .map((player, index) => {
      const { number } = parsePlayerLabel(player)
      const parsedNumber = Number(number)
      return {
        player,
        index,
        lineOrder: riverLineOrderByNumber.get(parsedNumber) ?? 99,
      }
    })
    .sort((a, b) => a.lineOrder - b.lineOrder || a.index - b.index)
    .map(({ player }) => player)
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">{text}</p>
}

function getPenaltyScore(match: Match) {
  const shootout = match.detail?.penaltyShootout
  if (!shootout) return ""

  return match.isHome
    ? `${shootout.river}-${shootout.opponent}`
    : `${shootout.opponent}-${shootout.river}`
}
