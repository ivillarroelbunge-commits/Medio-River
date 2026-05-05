"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, CalendarDays, Flag, MapPin, RefreshCw, Square } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TeamCrest } from "@/components/team-crest"
import { useAppState } from "@/components/app-state-provider"
import type { Match, MatchCardEvent, MatchGoal, MatchLineup, MatchSubstitution, MatchTeamSide } from "@/lib/data/types"
import { formatDateLong, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const { matches } = useAppState()
  const match = matches.find((item) => item.id === params.id)
  const formationsCardRef = useRef<HTMLElement>(null)
  const [incidentsHeight, setIncidentsHeight] = useState<number>()

  useEffect(() => {
    const card = formationsCardRef.current
    if (!card) return

    const updateIncidentsHeight = () => {
      if (!window.matchMedia("(min-width: 1280px)").matches) {
        setIncidentsHeight(undefined)
        return
      }

      const nextHeight = Math.ceil(card.getBoundingClientRect().height)
      setIncidentsHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight))
    }

    updateIncidentsHeight()

    const observer = new ResizeObserver(updateIncidentsHeight)
    observer.observe(card)
    window.addEventListener("resize", updateIncidentsHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateIncidentsHeight)
    }
  }, [match?.id])

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

  return (
    <div className="flex min-h-dvh flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-5 py-5 md:space-y-6 md:py-10">
          <Link href="/fixture?tab=resultados#resultados-previos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            Volver al fixture
          </Link>

          <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm md:rounded-[2rem]">
            <div className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary px-4 py-5 text-white md:px-8 md:py-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                <span>{match.competition}</span>
                <span>·</span>
                <span>{formatDateLong(match.date)}</span>
                <span>·</span>
                <span>{formatTime(match.date)} hs</span>
              </div>

              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1.5 md:mt-6 md:gap-8">
                <TeamBlock team={homeTeam} goals={homeGoals} />
                <div className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2.5 text-center shadow-2xl backdrop-blur sm:px-3 sm:py-3 md:rounded-3xl md:px-7 md:py-5">
                  <p className="font-display text-2xl font-black leading-none sm:text-3xl md:text-6xl">
                    {homeScore ?? "-"} <span className="text-white/40">-</span> {awayScore ?? "-"}
                  </p>
                  <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/65">Final</p>
                  <div className="mt-2 space-y-1.5 border-t border-white/15 pt-2 text-left text-[0.56rem] font-semibold leading-tight text-white/78 sm:text-[0.62rem] md:mt-4 md:space-y-2 md:pt-4 md:text-xs">
                    <ScoreMeta icon={<MapPin className="h-3.5 w-3.5" />} label="Estadio" value={match.stadium} />
                    <ScoreMeta icon={<Flag className="h-3.5 w-3.5" />} label="Árbitro" value={detail?.referee ?? match.referee ?? "Sin dato"} />
                  </div>
                </div>
                <TeamBlock team={awayTeam} goals={awayGoals} align="right" />
              </div>
            </div>
          </section>

          <section className="grid items-start gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <MatchCard ref={formationsCardRef} title="Formaciones">
              <div className="grid gap-6 lg:grid-cols-2">
                <LineupPanel title="River Plate" lineup={detail?.lineups.river} tone="river" />
                <LineupPanel title={match.opponent} lineup={detail?.lineups.opponent} tone="opponent" />
              </div>
            </MatchCard>
            <MatchCard
              title="Incidencias"
              icon={<CalendarDays className="h-4 w-4" />}
              className="xl:flex xl:min-h-0 xl:flex-col xl:overflow-hidden"
              bodyClassName="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1"
              style={incidentsHeight ? { height: incidentsHeight } : undefined}
            >
              {detail && (detail.cards.length > 0 || detail.substitutions.length > 0) ? (
                <Timeline cards={detail.cards} substitutions={detail.substitutions} opponent={match.opponent} />
              ) : (
                <EmptyState text="No hay incidencias cargadas para este partido." />
              )}
            </MatchCard>
          </section>

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

function TeamBlock({ team, goals, align = "left" }: { team: string; goals: MatchGoal[]; align?: "left" | "right" }) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-1.5 md:gap-2", align === "right" && "text-right")}>
      <div className="rounded-full bg-white p-1.5 shadow-xl md:p-2">
        <TeamCrest team={team} size="md" className="md:h-16 md:w-16" />
      </div>
      <h1 className="line-clamp-2 font-display text-base font-extrabold leading-tight md:text-2xl">{team}</h1>
      <div className="mt-1 min-h-8 space-y-1 text-center text-[0.6rem] font-semibold leading-tight text-white/80 md:min-h-10 md:text-xs">
        {goals.length > 0 ? (
          goals.map((goal, index) => <GoalMini key={`${goal.minute}-${goal.player}-${index}`} goal={goal} />)
        ) : (
          <span className="text-white/35">Sin goles</span>
        )}
      </div>
    </div>
  )
}

function ScoreMeta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-white/55">{icon}</span>
      <p>
        <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-white/45">{label}</span>
        <span className="text-white/85">{value}</span>
      </p>
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
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  style?: React.CSSProperties
  ref?: React.Ref<HTMLElement>
}) {
  return (
    <section ref={ref} style={style} className={cn("rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[1.75rem] md:p-5", className)}>
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">{icon}</span>}
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight md:text-2xl">{title}</h2>
      </div>
      <div className={bodyClassName}>
        {children}
      </div>
    </section>
  )
}

function GoalMini({ goal }: { goal: MatchGoal }) {
  return (
    <p>
      {goal.player} <span className="font-black text-white">{goal.minute}'</span>
    </p>
  )
}

function Timeline({ cards, substitutions, opponent }: { cards: MatchCardEvent[]; substitutions: MatchSubstitution[]; opponent: string }) {
  const events = [
    ...cards.map((card) => ({ type: "card" as const, minute: card.minute, team: card.team, payload: card })),
    ...substitutions.map((substitution) => ({ type: "substitution" as const, minute: substitution.minute, team: substitution.team, payload: substitution })),
  ].sort((a, b) => Number(a.minute) - Number(b.minute))

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={`${event.type}-${event.minute}-${index}`} className="flex gap-3 rounded-2xl border border-border bg-background p-4">
          <span className="mt-1 h-fit rounded-full bg-muted px-2.5 py-1 text-xs font-black text-foreground">{event.minute}'</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{teamLabel(event.team, opponent)}</p>
            {event.type === "card" ? <CardEvent event={event.payload} /> : <SubstitutionEvent event={event.payload} />}
          </div>
        </div>
      ))}
    </div>
  )
}

function CardEvent({ event }: { event: MatchCardEvent }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <Square className={cn("h-4 w-4 fill-current", event.card === "red" ? "text-primary" : "text-yellow-500")} />
      <span className="font-semibold">{event.player}</span>
      {event.detail && <span className="text-sm text-muted-foreground">· {event.detail}</span>}
    </div>
  )
}

function SubstitutionEvent({ event }: { event: MatchSubstitution }) {
  return (
    <div className="mt-1 space-y-1">
      <p className="flex items-center gap-2 font-semibold">
        <RefreshCw className="h-4 w-4 text-primary" />
        Entra {event.playerIn}
      </p>
      <p className="text-sm text-muted-foreground">Sale {event.playerOut}</p>
    </div>
  )
}

function LineupPanel({ title, lineup, tone }: { title: string; lineup?: MatchLineup; tone: "river" | "opponent" }) {
  return (
    <section className="space-y-4">
      <h3 className="font-display text-xl font-extrabold text-foreground">{title}</h3>

      {lineup ? (
        <div className="rounded-2xl border border-border bg-background p-4 md:p-5">
          <PlayerList title="Titulares" players={lineup.starters} tone={tone} />
          <div className="mt-7">
            <p className="text-sm text-muted-foreground">Entrenador</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{lineup.coach}</p>
          </div>
          <div className="my-7 h-px bg-border" />
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
      <h4 className="mb-3 text-base font-extrabold text-foreground md:mb-4">{title}</h4>
      <div className="space-y-2.5 md:space-y-3">
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
    <div className={cn("flex items-center gap-3", compact && "gap-3 text-muted-foreground")}>
      <span
        className={cn(
          "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-sm font-black",
          compact
            ? "border border-border bg-card text-muted-foreground"
            : tone === "river"
              ? "bg-primary text-primary-foreground"
              : "bg-zinc-950 text-white",
        )}
      >
        {number}
      </span>
      <span className={cn("text-sm font-medium md:text-base", compact ? "text-muted-foreground" : "text-foreground")}>{name}</span>
    </div>
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

function teamLabel(team: MatchTeamSide, opponent: Match["opponent"]) {
  return team === "river" ? "River Plate" : opponent
}
