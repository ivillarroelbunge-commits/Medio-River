"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Users, CalendarDays, Globe2, ShieldCheck } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SquadSection } from "@/components/squad-section"
import { useAppState } from "@/components/app-state-provider"

export default function PlantelPage() {
  const { squadPlayers } = useAppState()
  const grouped = {
    Arqueros: squadPlayers.filter((player) => player.line === "Arqueros"),
    Defensores: squadPlayers.filter((player) => player.line === "Defensores"),
    Mediocampistas: squadPlayers.filter((player) => player.line === "Mediocampistas"),
    Delanteros: squadPlayers.filter((player) => player.line === "Delanteros"),
  }
  const academyCount = squadPlayers.filter((player) => player.fromAcademy).length
  const averageAge = squadPlayers.reduce((total, player) => total + player.age, 0) / squadPlayers.length
  const foreignCount = squadPlayers.filter((player) => player.nationality !== "Argentina").length

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-gradient-to-b from-muted/70 to-background">
          <div className="container-prose py-8 md:py-10">
            <header className="space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Plantel</p>
                  <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">Plantel profesional</h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    Plantel profesional de River para el Torneo Apertura 2026.
                  </p>
                </div>
                <Link href="/plantel/arma-tu-equipo" className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                  Arma tu equipo
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total de jugadores" value={String(squadPlayers.length)} icon={<Users className="h-5 w-5" />} />
                <StatCard label="Edad promedio" value={averageAge.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} suffix="años" icon={<CalendarDays className="h-5 w-5" />} />
                <StatCard label="Extranjeros" value={String(foreignCount)} icon={<Globe2 className="h-5 w-5" />} />
                <StatCard label="Formados en River" value={String(academyCount)} icon={<ShieldCheck className="h-5 w-5" />} />
              </div>
            </header>
          </div>
        </div>

        <div className="container-prose space-y-10 py-8 md:py-10">
          <SquadSection title="ARQUEROS" players={grouped.Arqueros} />
          <SquadSection title="DEFENSORES" players={grouped.Defensores} />
          <SquadSection title="MEDIOCAMPISTAS" players={grouped.Mediocampistas} />
          <SquadSection title="DELANTEROS" players={grouped.Delanteros} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function StatCard({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-extrabold leading-none text-foreground">
            {value}
            {suffix && <span className="ml-1 text-sm font-bold text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
    </div>
  )
}
