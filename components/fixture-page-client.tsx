"use client"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FixtureTabs } from "@/components/fixture-tabs"
import { useAppState } from "@/components/app-state-provider"
import { useFastUpcomingMatches } from "@/hooks/use-fast-upcoming-matches"
import type { CompetitionPanelData, Match } from "@/lib/data/types"

type FixtureTab = "proximos" | "resultados" | "tablas"

export function FixturePageClient({
  standingsPanels,
  initialTab,
  initialUpcoming,
  initialPrevious,
}: {
  standingsPanels: CompetitionPanelData[]
  initialTab: FixtureTab
  initialUpcoming: Match[]
  initialPrevious: Match[]
}) {
  const { matches } = useAppState()
  const upcoming = useFastUpcomingMatches(initialUpcoming)

  const previousById = new Map(initialPrevious.map((match) => [match.id, match]))
  for (const match of matches) {
    if (match.status === "played") previousById.set(match.id, match)
  }
  const previous = Array.from(previousById.values()).sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const nextMatch = upcoming[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-4 py-4 md:space-y-8 md:py-10">
          <header>
            <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight leading-tight md:text-4xl">Fixture y resultados</h1>
          </header>
          <FixtureTabs
            upcoming={upcoming}
            previous={previous}
            nextMatch={nextMatch}
            standingsPanels={standingsPanels}
            initialTab={initialTab}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
