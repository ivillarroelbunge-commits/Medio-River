"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BarChart3, Calendar, History } from "lucide-react"
import type { Match } from "@/lib/data/types"
import { CompetitionSelector } from "@/components/competition-selector"
import { PreviousResults, UpcomingMatches } from "@/components/match-lists"
import { cn } from "@/lib/utils"

const tabs = [
  { key: "proximos", label: "Próximos partidos", icon: Calendar },
  { key: "resultados", label: "Resultados previos", icon: History },
  { key: "tablas", label: "Tablas", icon: BarChart3 },
] as const

export function FixtureTabs({ upcoming, previous }: { upcoming: Match[]; previous: Match[] }) {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("proximos")
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "proximos" || tab === "resultados" || tab === "tablas") {
      setActive(tab)
    }
  }, [searchParams])

  return (
    <div id="resultados-previos" className="space-y-6 scroll-mt-24">
      <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={cn("relative inline-flex shrink-0 items-center gap-2 px-3 py-3 text-xs font-semibold transition-colors md:px-4 md:text-sm", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>
      {active === "proximos" && <UpcomingMatches matches={upcoming} />}
      {active === "resultados" && <PreviousResults matches={previous} />}
      {active === "tablas" && <CompetitionSelector />}
    </div>
  )
}
