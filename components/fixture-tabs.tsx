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
    <div id="resultados-previos" className="space-y-4 scroll-mt-24 md:space-y-6">
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm md:flex md:flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={cn("inline-flex min-w-0 items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[0.62rem] font-bold leading-tight transition-colors md:gap-2 md:px-4 md:py-2.5 md:text-sm", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{tab.label}</span>
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
