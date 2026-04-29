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
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={cn("relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
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
