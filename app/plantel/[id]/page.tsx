"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Goal, Handshake, ShieldCheck, ShieldX, Square, Star, type LucideIcon } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppState } from "@/components/app-state-provider"
import type { Competition, Match, PlayerSeasonStats, PlayerStatLine, PlayerStatsCompetitionKey, SquadPlayer } from "@/lib/data/types"
import {
  formatPlayerRating,
  getCompetitionStatLine,
  getPlayerTotalStats,
  playerStatsCompetitionLabels,
} from "@/lib/player-stats"

const statTabs: Array<PlayerStatsCompetitionKey | "total"> = ["total", "clausura", "sudamericana", "copaArgentina", "apertura"]

type CrowdRatingLine = Partial<PlayerStatLine> & { ratingMatches?: number }

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>()
  const { isHydrated, matches, playerSeasonStats, squadPlayers } = useAppState()
  const player = squadPlayers.find((item) => item.id === params.id)
  const [activeTab, setActiveTab] = useState<PlayerStatsCompetitionKey | "total">("total")
  const [mobileSection, setMobileSection] = useState<"profile" | "stats">("profile")

  if (!isHydrated) {
    return <div className="min-h-dvh bg-background" />
  }

  if (!player) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container-prose py-6 md:py-10">
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:p-8">
              <h1 className="font-display text-2xl font-extrabold md:text-3xl">Jugador no encontrado</h1>
              <Link href="/plantel" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                Volver al plantel
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const stats = activeTab === "total" ? getPlayerTotalStats(player.id, playerSeasonStats) : getCompetitionStatLine(player.id, activeTab, playerSeasonStats)
  const crowdRating = getCrowdRating(player.id, activeTab, playerSeasonStats)
  const height = getPlayerHeight(player.id)
  const isGoalkeeper = player.line === "Arqueros" || player.position.toLowerCase().includes("arquero")
  const goalsConceded = isGoalkeeper ? getGoalkeeperGoalsConceded(player, matches, activeTab) : null
  const statItems: Array<{ icon: LucideIcon; iconClassName?: string; label: string; value: string }> = isGoalkeeper
    ? [
        { icon: CalendarDays, label: "Partidos", value: String(stats.matches) },
        { icon: Clock, label: "Minutos", value: formatNumber(stats.minutes) },
        { icon: ShieldCheck, label: "Vallas invictas", value: String(stats.cleanSheets) },
        { icon: ShieldX, label: "Goles recibidos", value: goalsConceded === null ? "-" : String(goalsConceded) },
        { icon: Square, iconClassName: "text-yellow-400 fill-yellow-400", label: "Amarillas", value: String(stats.yellowCards) },
        { icon: Square, iconClassName: "text-primary fill-primary", label: "Rojas", value: String(stats.redCards) },
        { icon: Star, label: "Puntuación MR", value: formatPlayerRating(crowdRating) },
      ]
    : [
        { icon: CalendarDays, label: "Partidos", value: String(stats.matches) },
        { icon: Clock, label: "Minutos", value: formatNumber(stats.minutes) },
        { icon: Goal, label: "Goles", value: String(stats.goals) },
        { icon: Handshake, label: "Asistencias", value: String(stats.assists) },
        { icon: Square, iconClassName: "text-yellow-400 fill-yellow-400", label: "Amarillas", value: String(stats.yellowCards) },
        { icon: Square, iconClassName: "text-primary fill-primary", label: "Rojas", value: String(stats.redCards) },
        { icon: Star, label: "Puntuación MR", value: formatPlayerRating(crowdRating) },
      ]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-b from-muted/50 to-background">
        <div className="container-prose py-5 md:py-10">
          <Link href="/plantel" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver al plantel
          </Link>

          <div className="mt-5 space-y-3 md:mt-8 md:space-y-4">
            <section className="space-y-3 md:space-y-4">
              <div className="overflow-hidden rounded-[1.5rem] shadow-xl md:rounded-[2rem]">
                <div className="relative h-[85px] overflow-hidden bg-primary px-4 py-3 md:h-[150px] md:px-10 md:py-7">
                  <div className="absolute bottom-0 left-4 h-[85px] w-20 md:left-10 md:h-[150px] md:w-36">
                    <PlayerPhoto player={player} />
                  </div>
                  <div className={`relative ml-24 flex h-full flex-col md:ml-48 ${player.fromAcademy ? "justify-start" : "justify-center"}`}>
                    <div className="mt-2 flex flex-col-reverse gap-1.5 md:mt-0 md:flex-col md:gap-0">
                      <h1 className="truncate whitespace-nowrap text-xl font-extrabold leading-tight text-white md:text-5xl">{player.name}</h1>
                      <div className="flex flex-wrap items-center gap-2 md:mt-3">
                      <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary md:inline-flex">
                        #{player.number}
                      </span>
                      {player.fromAcademy && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-white ring-1 ring-white/20 md:px-3 md:py-1 md:text-xs md:tracking-[0.12em]">
                          <BadgeCheck className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                          Formado en River
                        </span>
                      )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-x border-b border-border bg-card px-4 md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileSection("profile")}
                    className={`px-4 py-3 text-sm font-extrabold transition ${
                      mobileSection === "profile" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSection("stats")}
                    className={`px-4 py-3 text-sm font-extrabold transition ${
                      mobileSection === "stats" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Estadísticas
                  </button>
                </div>
              </div>

              <div className={`${mobileSection === "profile" ? "grid" : "hidden"} gap-3 md:grid md:grid-cols-2 md:gap-4`}>
                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[2rem] md:p-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                    <DetailItem label="Edad" value={`${player.age} años`} />
                    <DetailItem label="Dorsal" value={String(player.number)} />
                    <DetailItem label="País" value={player.nationality} />
                    <DetailItem label="Pierna hábil" value={player.foot} />
                  <DetailItem label="Altura" value={height} isLast />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[2rem] md:p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_9rem] items-start gap-3 md:grid-cols-[1fr_auto] md:gap-4">
                    <div>
                      <p className="text-xl font-extrabold">Posición</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Principal</p>
                      <p className="mt-1.5 text-base text-foreground">{player.position}</p>
                    </div>
                    <PlayerPitch line={player.line} position={player.position} />
                  </div>
                </div>
              </div>
            </section>

            <section className={`${mobileSection === "stats" ? "block" : "hidden"} rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:block md:rounded-[2rem] md:p-6`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-primary md:block">Estadísticas</p>
                  <h2 className="font-display text-2xl font-extrabold">Temporada 2026</h2>
                </div>
                <div className="w-fit min-w-56 max-w-full md:w-72">
                  <Select
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as PlayerStatsCompetitionKey | "total")}
                  >
                    <SelectTrigger
                      aria-label="Estadísticas"
                      className="h-10 w-full rounded-2xl border-border bg-card px-4 text-sm font-extrabold shadow-sm hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20 md:h-11"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="overflow-hidden rounded-2xl border-border bg-card p-1.5 shadow-xl">
                    {statTabs.map((tab) => (
                      <SelectItem
                        key={tab}
                        value={tab}
                        className="rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      >
                        {playerStatsCompetitionLabels[tab]}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statItems.map((item) => (
                  <StatBox key={item.label} icon={item.icon} iconClassName={item.iconClassName} label={item.label} value={item.value} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PlayerPhoto({ player }: { player: SquadPlayer }) {
  const [failed, setFailed] = useState(false)

  if (!player.image || failed) {
    return <div className="flex h-full w-full items-center justify-center bg-muted text-5xl font-extrabold text-primary">{player.name.charAt(0)}</div>
  }

  return <img src={player.image} alt={player.name} className="h-full w-full object-contain object-bottom" onError={() => setFailed(true)} />
}

function DetailItem({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={`${isLast ? "" : "border-b border-border"} py-2.5 md:py-3`}>
      <p className="font-display text-lg font-normal leading-none text-foreground md:text-xl">{value}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:text-xs">{label}</p>
    </div>
  )
}

function PlayerPitch({ line, position }: { line: SquadPlayer["line"]; position: string }) {
  const markerClass = positionMarkerClass(position, line)

  return (
    <div className="relative mx-auto h-52 w-full max-w-40 overflow-hidden rounded-xl bg-muted md:h-48 md:w-96 md:max-w-96">
      <div className="absolute inset-x-0 top-1/2 border-t border-foreground/10 md:hidden" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-foreground/10" />
      <div className="absolute left-1/2 top-0 h-10 w-16 -translate-x-1/2 rounded-b-md border-x-4 border-b-4 border-foreground/10 md:hidden" />
      <div className="absolute bottom-0 left-1/2 h-10 w-16 -translate-x-1/2 rounded-t-md border-x-4 border-t-4 border-foreground/10 md:hidden" />
      <div className="absolute inset-y-0 left-1/2 hidden border-l border-foreground/10 md:block" />
      <div className="absolute left-0 top-1/2 hidden h-20 w-12 -translate-y-1/2 rounded-r-md border-y-4 border-r-4 border-foreground/10 md:block" />
      <div className="absolute right-0 top-1/2 hidden h-20 w-12 -translate-y-1/2 rounded-l-md border-y-4 border-l-4 border-foreground/10 md:block" />
      <span className={`absolute inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-2.5 text-sm font-extrabold text-white shadow-lg ${markerClass}`}>
        {positionCode(position)}
      </span>
    </div>
  )
}

function positionMarkerClass(position: string, line: SquadPlayer["line"]) {
  const normalized = position.toLowerCase()

  if (normalized.includes("arquero")) return "bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2 md:translate-x-0"
  if (normalized.includes("lateral izquierdo")) return "bottom-16 left-5 md:bottom-auto md:left-[28%] md:top-5"
  if (normalized.includes("lateral derecho")) return "bottom-16 right-5 md:bottom-5 md:left-[28%] md:right-auto"
  if (normalized.includes("defensor central")) return "bottom-16 left-1/2 -translate-x-1/2 md:bottom-auto md:left-[28%] md:top-1/2 md:-translate-y-1/2"
  if (normalized.includes("volante central")) return "top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-[48%] md:top-[58%]"
  if (normalized.includes("volante ofensivo")) return "top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-[60%] md:top-[42%]"
  if (normalized.includes("mediocampista")) return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-[50%]"
  if (normalized.includes("centrodelantero")) return "top-8 left-1/2 -translate-x-1/2 md:left-[82%] md:top-1/2 md:-translate-y-1/2"
  if (normalized.includes("delantero")) return "top-10 left-1/2 -translate-x-1/2 md:left-[78%] md:top-1/2 md:-translate-y-1/2"

  return {
    Arqueros: "bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2 md:translate-x-0",
    Defensores: "bottom-16 left-1/2 -translate-x-1/2 md:bottom-auto md:left-[28%] md:top-1/2 md:-translate-y-1/2",
    Mediocampistas: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-[50%]",
    Delanteros: "top-10 left-1/2 -translate-x-1/2 md:left-[78%] md:top-1/2 md:-translate-y-1/2",
  }[line]
}

function positionCode(position: string) {
  const normalized = position.toLowerCase()

  if (normalized.includes("arquero")) return "ARQ"
  if (normalized.includes("lateral derecho")) return "LD"
  if (normalized.includes("lateral izquierdo")) return "LI"
  if (normalized.includes("defensor central")) return "DFC"
  if (normalized.includes("volante central")) return "MC"
  if (normalized.includes("volante ofensivo")) return "MCO"
  if (normalized.includes("mediocampista")) return "MC"
  if (normalized.includes("centrodelantero")) return "DC"
  if (normalized.includes("delantero")) return "DEL"

  return position
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase()
}

function StatBox({ icon: Icon, iconClassName = "text-primary", label, value }: { icon: LucideIcon; iconClassName?: string; label: string; value: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm">
      <Icon className={`absolute right-4 top-4 h-5 w-5 ${iconClassName}`} />
      <p className="pr-7 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
    </div>
  )
}

function getCrowdRating(
  playerId: string,
  competition: PlayerStatsCompetitionKey | "total",
  statsMap: Record<string, PlayerSeasonStats>,
) {
  const playerStats = statsMap[playerId]
  if (!playerStats) return null

  if (competition !== "total") {
    const line = playerStats.competitions[competition] as CrowdRatingLine | undefined
    return (line?.ratingMatches ?? 0) > 0 && typeof line?.rating === "number" ? line.rating : null
  }

  let ratingSum = 0
  let ratedMatches = 0

  for (const rawLine of Object.values(playerStats.competitions)) {
    const line = rawLine as CrowdRatingLine | undefined
    const matches = line?.ratingMatches ?? 0
    if (matches <= 0 || typeof line?.rating !== "number") continue

    ratingSum += line.rating * matches
    ratedMatches += matches
  }

  return ratedMatches > 0 ? Number((ratingSum / ratedMatches).toFixed(2)) : null
}

function formatNumber(value: number) {
  return value.toLocaleString("es-AR")
}

function getPlayerHeight(playerId: string) {
  const heights: Record<string, string> = {
    "player-centurion": "183 cm",
  }

  return heights[playerId] ?? "—"
}

function getGoalkeeperGoalsConceded(player: SquadPlayer, matches: Match[], competition: PlayerStatsCompetitionKey | "total") {
  const normalizedPlayerName = normalizePlayerName(player.name)
  let countedMatches = 0
  let goalsConceded = 0

  for (const match of matches) {
    if (match.status !== "played" || !match.detail) continue
    if (competition !== "total" && competitionToStatKey(match.competition) !== competition) continue

    const intervals = getGoalkeeperIntervals(normalizedPlayerName, match)
    if (intervals.length === 0) continue

    countedMatches += 1

    for (const goal of match.detail.goals) {
      if (goal.team !== "opponent") continue

      const goalMinute = parseMatchMinute(goal.minute)
      if (goalMinute === null) continue
      if (intervals.some(({ start, end }) => goalMinute >= start && goalMinute < end)) {
        goalsConceded += 1
      }
    }
  }

  return countedMatches > 0 ? goalsConceded : null
}

function getGoalkeeperIntervals(playerName: string, match: Match) {
  const lineups = match.detail?.lineups.river
  if (!lineups) return []

  const intervals: Array<{ start: number; end: number }> = []
  const started = lineups.starters.some((name) => normalizePlayerName(name).includes(playerName))

  if (started) {
    intervals.push({ start: 0, end: Number.POSITIVE_INFINITY })
  }

  const riverSubstitutions = match.detail?.substitutions
    .filter((substitution) => substitution.team === "river")
    .map((substitution) => ({
      minute: parseMatchMinute(substitution.minute),
      playerIn: normalizePlayerName(substitution.playerIn),
      playerOut: normalizePlayerName(substitution.playerOut),
    }))
    .filter((substitution): substitution is { minute: number; playerIn: string; playerOut: string } => substitution.minute !== null) ?? []

  for (const substitution of riverSubstitutions) {
    if (substitution.playerIn.includes(playerName)) {
      intervals.push({ start: substitution.minute, end: Number.POSITIVE_INFINITY })
    }

    if (substitution.playerOut.includes(playerName)) {
      for (const interval of intervals) {
        if (interval.end === Number.POSITIVE_INFINITY && substitution.minute >= interval.start) {
          interval.end = substitution.minute
        }
      }
    }
  }

  return intervals
}

function normalizePlayerName(name: string) {
  return name
    .replace(/^#?\d+\s*/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function parseMatchMinute(minute: string) {
  const match = /(\d+)/.exec(minute)
  return match ? Number(match[1]) : null
}

function competitionToStatKey(competition: Competition): PlayerStatsCompetitionKey {
  if (competition === "Torneo Clausura") return "clausura"
  if (competition === "Copa Sudamericana") return "sudamericana"
  if (competition === "Copa Argentina") return "copaArgentina"
  return "apertura"
}
