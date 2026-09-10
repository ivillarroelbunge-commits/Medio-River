"use client"

import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SquadSection } from "@/components/squad-section"
import { useSquadPlayers } from "@/hooks/use-squad-players"

export default function PlantelPage() {
  const { squadPlayers } = useSquadPlayers()
  const grouped = {
    Arqueros: squadPlayers.filter((player) => player.line === "Arqueros"),
    Defensores: squadPlayers.filter((player) => player.line === "Defensores"),
    Mediocampistas: squadPlayers.filter((player) => player.line === "Mediocampistas"),
    Delanteros: squadPlayers.filter((player) => player.line === "Delanteros"),
  }
  const academyCount = squadPlayers.filter((player) => player.fromAcademy).length
  const averageAge = squadPlayers.length > 0
    ? squadPlayers.reduce((total, player) => total + player.age, 0) / squadPlayers.length
    : 0
  const foreignCount = squadPlayers.filter((player) => player.nationality !== "Argentina").length

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-gradient-to-b from-muted/70 to-background">
          <div className="container-prose pb-4 pt-6 md:py-10">
            <header className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-[1fr_auto] items-start gap-4 md:flex md:items-center md:justify-between">
                <h1 className="font-display text-[2.15rem] font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
                  <span className="block md:inline">Plantel</span>{" "}
                  <span className="block md:inline">Profesional</span>
                </h1>
                <Link href="/plantel/arma-tu-equipo" className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 md:px-5 md:py-3 md:text-sm">
                  Arma tu equipo
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                <StatItem label="Total de jugadores" value={String(squadPlayers.length)} />
                <StatItem label="Edad promedio" value={averageAge.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} suffix="años" />
                <StatItem label="Extranjeros" value={String(foreignCount)} />
                <StatItem label="Formados en River" value={String(academyCount)} />
              </div>

            </header>
          </div>
        </div>

        <div className="container-prose space-y-8 pb-6 pt-4 md:space-y-10 md:py-10">
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

function StatItem({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-sm md:px-4 md:py-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground md:text-[10px] md:tracking-[0.14em]">{label}</p>
      <p className="mt-1.5 font-display text-xl font-extrabold leading-none text-foreground md:text-2xl">
        {value}
        {suffix && <span className="ml-1 text-xs font-bold text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}
