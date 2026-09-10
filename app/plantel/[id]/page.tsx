"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, BadgeCheck } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useAppState } from "@/components/app-state-provider"
import type { PlayerStatsCompetitionKey, SquadPlayer } from "@/lib/data/types"
import {
  formatPlayerRating,
  getCompetitionStatLine,
  getPlayerTotalStats,
  playerStatsCompetitionLabels,
  playerStatsSourceUrl,
  playerStatsUpdatedAt,
} from "@/lib/player-stats"

const statTabs: Array<PlayerStatsCompetitionKey | "total"> = ["total", "clausura", "sudamericana", "copaArgentina", "apertura"]

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>()
  const { isHydrated, playerSeasonStats, squadPlayers } = useAppState()
  const player = squadPlayers.find((item) => item.id === params.id)
  const [activeTab, setActiveTab] = useState<PlayerStatsCompetitionKey | "total">("total")

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
  const sourceId = playerSeasonStats[player.id]?.sourceId
  const updatedAt = playerSeasonStats[player.id]?.updatedAt ?? playerStatsUpdatedAt
  const height = getPlayerHeight(player.id)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-b from-muted/50 to-background">
        <div className="container-prose space-y-5 py-5 md:space-y-8 md:py-10">
          <Link href="/plantel" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver al plantel
          </Link>

          <section className="space-y-3 md:space-y-4">
            <div className="relative h-[85px] overflow-hidden rounded-[1.5rem] bg-primary px-4 py-3 shadow-xl md:h-[150px] md:rounded-[2rem] md:px-10 md:py-7">
              <div className="absolute bottom-0 left-4 h-[85px] w-20 md:left-10 md:h-[150px] md:w-36">
                <PlayerPhoto player={player} />
              </div>
              <div className={`relative ml-24 flex h-full flex-col md:ml-48 ${player.fromAcademy ? "justify-start" : "justify-center"}`}>
                <h1 className="truncate whitespace-nowrap text-xl font-extrabold leading-tight text-white md:text-5xl">{player.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-3">
                  <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary md:inline-flex">
                    #{player.number}
                  </span>
                  {player.fromAcademy && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white ring-1 ring-white/20 md:px-3 md:text-xs md:tracking-[0.12em]">
                      <BadgeCheck className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      Formado en River
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[2rem] md:p-6">
                <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2">
                  <DetailItem label="Edad" value={`${player.age} años`} />
                  <DetailItem label="Dorsal" value={String(player.number)} />
                  <DetailItem label="País" value={player.nationality} />
                  <DetailItem label="Pierna hábil" value={player.foot} />
                  <DetailItem label="Altura" value={height} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[2rem] md:p-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
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

          <section className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm md:rounded-[2rem] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Estadísticas</p>
                <h2 className="font-display text-2xl font-extrabold">Temporada 2026</h2>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                {statTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${activeTab === tab ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {playerStatsCompetitionLabels[tab]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox tone="dark" label="Partidos" value={String(stats.matches)} />
              <StatBox tone="dark" label="Minutos" value={formatNumber(stats.minutes)} />
              <StatBox tone="red" label="Goles" value={String(stats.goals)} />
              <StatBox tone="red" label="Asistencias" value={String(stats.assists)} />
              <StatBox label="Rating FotMob" value={formatPlayerRating(stats.rating)} />
              <StatBox label="Amarillas" value={String(stats.yellowCards)} />
              <StatBox label="Rojas" value={String(stats.redCards)} />
              <StatBox label="Vallas invictas" value={String(stats.cleanSheets)} />
            </div>

            <p className="mt-6 text-xs leading-5 text-muted-foreground">
              Fuente base: <a href={playerStatsSourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">FotMob River Plate stats</a>
              {sourceId ? ` · ID jugador ${sourceId}` : ""} · actualizado el {updatedAt}. FotMob no expone titulares en este endpoint, por eso se muestran PJ y minutos.
            </p>
          </section>
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-2.5 md:py-3">
      <p className="text-lg leading-none text-foreground md:text-xl">{value}</p>
      <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  )
}

function PlayerPitch({ line, position }: { line: SquadPlayer["line"]; position: string }) {
  const markerClass = positionMarkerClass(position, line)

  return (
    <div className="relative mx-auto h-40 w-full max-w-40 overflow-hidden rounded-xl bg-muted md:h-48 md:w-96 md:max-w-96">
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

function StatBox({ label, tone = "plain", value }: { label: string; tone?: "plain" | "dark" | "red"; value: string }) {
  const toneClass = {
    plain: "border-border bg-muted/25 text-foreground",
    dark: "border-secondary bg-secondary text-secondary-foreground",
    red: "border-primary bg-primary text-primary-foreground",
  }[tone]

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${tone === "plain" ? "text-muted-foreground" : "text-white/65"}`}>{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
    </div>
  )
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
