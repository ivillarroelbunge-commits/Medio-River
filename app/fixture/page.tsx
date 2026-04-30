"use client"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FixtureTabs } from "@/components/fixture-tabs"
import { Scoreboard } from "@/components/scoreboard"
import { useAppState } from "@/components/app-state-provider"

export default function FixturePage() {
  const { matches } = useAppState()
  const upcoming = matches.filter((match) => match.status === "upcoming").sort((a, b) => +new Date(a.date) - +new Date(b.date))
  const previous = matches.filter((match) => match.status === "played").sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const nextMatch = upcoming[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-6 py-5 md:space-y-8 md:py-10">
          <header className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Calendario</p>
            <h1 className="font-display text-[2rem] font-extrabold tracking-tight leading-tight md:text-4xl">Fixture y resultados</h1>
          </header>
          {nextMatch && <Scoreboard match={nextMatch} variant="compact" />}
          <FixtureTabs upcoming={upcoming} previous={previous} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
