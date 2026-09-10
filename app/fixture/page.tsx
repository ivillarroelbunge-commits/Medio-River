import { FixturePageClient } from "@/components/fixture-page-client"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"

export const dynamic = "force-dynamic"

type FixtureTab = "proximos" | "resultados" | "tablas"

export default async function FixturePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ panels }, params] = await Promise.all([
    getCompetitionPanelsWithLiveStandings(),
    searchParams,
  ])

  const initialTab: FixtureTab = params.tab === "resultados" || params.tab === "tablas" ? params.tab : "proximos"

  return <FixturePageClient standingsPanels={panels} initialTab={initialTab} />
}
