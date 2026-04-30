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
          <div className="container-prose py-6 md:py-10">
            <header className="space-y-5 md:space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Plantel</p>
                  <h1 className="font-display text-[2.15rem] font-extrabold tracking-tight text-foreground md:text-5xl">Plantel profesional</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:mt-3 md:text-base">
                    Plantel profesional de River para el Torneo Apertura 2026.
                  </p>
                </div>
                <Link href="/plantel/arma-tu-equipo" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:w-fit">
                  Arma tu equipo
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <StatCard label="Total de jugadores" value={String(squadPlayers.length)} icon={<Users className="h-5 w-5" />} />
                <StatCard label="Edad promedio" value={averageAge.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} suffix="años" icon={<CalendarDays className="h-5 w-5" />} />
                <StatCard label="Extranjeros" value={String(foreignCount)} icon={<Globe2 className="h-5 w-5" />} />
                <StatCard label="Formados en River" value={String(academyCount)} icon={<ShieldCheck className="h-5 w-5" />} />
              </div>
            </header>
          </div>
        </div>

        <div className="container-prose space-y-8 py-6 md:space-y-10 md:py-10">
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
    <div className="rounded-2xl border border-border bg-card/95 p-3.5 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground md:text-[11px] md:tracking-[0.16em]">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold leading-none text-foreground md:text-3xl">
            {value}
            {suffix && <span className="ml-1 text-sm font-bold text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:h-10 md:w-10">
          {icon}
        </span>
      </div>
    </div>
  )
}
