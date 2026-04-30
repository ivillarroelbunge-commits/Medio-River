"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import type { ReactNode } from "react"
import { useState } from "react"
import { ArrowLeft, BadgeCheck, Clock, Goal, Shield, Star, Trophy } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useAppState } from "@/components/app-state-provider"
import type { PlayerStatLine, PlayerStatsCompetitionKey, SquadPlayer } from "@/lib/data/types"
import {
  formatPlayerRating,
  getCompetitionStatLine,
  getPlayerTotalStats,
  playerSeasonStats,
  playerStatsCompetitionLabels,
  playerStatsSourceUrl,
  playerStatsUpdatedAt,
} from "@/lib/player-stats"

const statTabs: Array<PlayerStatsCompetitionKey | "total"> = ["total", "apertura", "sudamericana", "copaArgentina"]

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>()
  const { isHydrated, squadPlayers } = useAppState()
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

  const stats = activeTab === "total" ? getPlayerTotalStats(player.id) : getCompetitionStatLine(player.id, activeTab)
  const totalStats = getPlayerTotalStats(player.id)
  const sourceId = playerSeasonStats[player.id]?.sourceId
  const isGoalkeeper = player.line === "Arqueros"

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-b from-muted/50 to-background">
        <div className="container-prose space-y-5 py-5 md:space-y-8 md:py-10">
          <Link href="/plantel" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver al plantel
          </Link>

          <section className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-xl md:rounded-[2rem]">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-[20rem] overflow-hidden bg-secondary p-4 text-secondary-foreground md:min-h-[24rem] md:p-8">
                <div className="absolute -left-16 -top-20 h-60 w-60 rounded-full bg-primary/50 blur-3xl" />
                <div className="absolute -bottom-24 right-4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(115deg,transparent_0%,transparent_44%,white_45%,white_48%,transparent_49%,transparent_100%)]" />
                <div className="relative flex h-full flex-col justify-between gap-5 md:gap-8">
                  <div className="flex flex-wrap gap-2">
                    {player.fromAcademy && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Formado en River
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white/75 ring-1 ring-white/15">
                      {player.line}
                    </span>
                  </div>

                  <div className="mx-auto flex flex-col items-center">
                    <div className="relative h-56 w-48 overflow-hidden rounded-[1.75rem] border border-white/15 bg-white shadow-2xl shadow-black/30 md:h-72 md:w-64 md:rounded-[2.2rem]">
                      <PlayerPhoto player={player} />
                    </div>
                    <div className="-mt-7 rounded-2xl bg-primary px-4 py-2.5 text-center shadow-xl md:-mt-8 md:px-5 md:py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Dorsal</p>
                      <p className="font-display text-3xl font-extrabold leading-none text-primary-foreground md:text-4xl">#{player.number}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative p-4 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">#{player.number} · {player.position}</p>
                <h1 className="mt-2 font-display text-[2.1rem] font-extrabold tracking-tight leading-none text-foreground md:text-6xl">{player.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Perfil del jugador con estadísticas de temporada, vista total y desglose por torneo.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <BioBlock label="Edad" value={`${player.age}`} />
                  <BioBlock label="País" value={player.nationality} />
                  <BioBlock label="Pierna" value={player.foot} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <HeroStat icon={<Trophy className="h-4 w-4" />} label="PJ" value={String(totalStats.matches)} />
                  <HeroStat icon={<Clock className="h-4 w-4" />} label="Minutos" value={formatNumber(totalStats.minutes)} />
                  <HeroStat icon={isGoalkeeper ? <Shield className="h-4 w-4" /> : <Goal className="h-4 w-4" />} label={isGoalkeeper ? "Vallas" : "Goles"} value={String(isGoalkeeper ? totalStats.cleanSheets : totalStats.goals)} />
                  <HeroStat icon={<Star className="h-4 w-4" />} label="Rating" value={formatPlayerRating(totalStats.rating)} />
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
              {sourceId ? ` · ID jugador ${sourceId}` : ""} · actualizado el {playerStatsUpdatedAt}. FotMob no expone titulares en este endpoint, por eso se muestran PJ y minutos.
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

  return <img src={player.image} alt={player.name} className="h-full w-full object-cover object-top" onError={() => setFailed(true)} />
}

function BioBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  )
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
