"use client"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FixtureTabs } from "@/components/fixture-tabs"
import { useAppState } from "@/components/app-state-provider"
import { useFastUpcomingMatches } from "@/hooks/use-fast-upcoming-matches"

export default function FixturePage() {
  const { matches } = useAppState()
  const upcoming = useFastUpcomingMatches()
  const previous = matches.filter((match) => match.status === "played").sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const nextMatch = upcoming[0]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose space-y-4 py-4 md:space-y-8 md:py-10">
          <header>
            <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight leading-tight md:text-4xl">Fixture y resultados</h1>
          </header>
          <FixtureTabs upcoming={upcoming} previous={previous} nextMatch={nextMatch} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
