"use client"

import { useState } from "react"
import { BarChart3, Calendar, History } from "lucide-react"
import type { CompetitionPanelData, Match } from "@/lib/data/types"
import { CompetitionSelector } from "@/components/competition-selector"
import { PreviousResults, UpcomingMatches } from "@/components/match-lists"
import { Scoreboard } from "@/components/scoreboard"
import { cn } from "@/lib/utils"

const tabs = [
  { key: "proximos", label: "Próximos", icon: Calendar },
  { key: "resultados", label: "Previos", icon: History },
  { key: "tablas", label: "Tablas", icon: BarChart3 },
] as const

type FixtureTab = (typeof tabs)[number]["key"]

export function FixtureTabs({
  upcoming,
  previous,
  nextMatch,
  standingsPanels,
  initialTab,
}: {
  upcoming: Match[]
  previous: Match[]
  nextMatch?: Match
  standingsPanels: CompetitionPanelData[]
  initialTab: FixtureTab
}) {
  const [active, setActive] = useState<FixtureTab>(initialTab)
  const upcomingRest = nextMatch ? upcoming.filter((match) => match.id !== nextMatch.id) : upcoming

  return (
    <div id="resultados-previos" className="space-y-4 scroll-mt-24 md:space-y-6">
      <div role="tablist" className="flex w-full flex-nowrap gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={cn("inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-[0.62rem] font-bold leading-tight transition-colors md:gap-2 md:px-4 md:py-2.5 md:text-sm", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
      {active === "proximos" && (
        <div className="space-y-4 md:space-y-6">
          {nextMatch && <Scoreboard match={nextMatch} variant="compact" />}
          <UpcomingMatches matches={upcomingRest} />
        </div>
      )}
      {active === "resultados" && <PreviousResults matches={previous} />}
      {active === "tablas" && <CompetitionSelector initialPanels={standingsPanels} />}
    </div>
  )
}
