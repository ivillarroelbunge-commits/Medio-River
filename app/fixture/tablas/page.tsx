import { FixturePageClient } from "@/components/fixture-page-client"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"
import { getPreloadedMatches, getPreviousFromMatches, getUpcomingFromMatches } from "@/lib/matches-preload"

export const revalidate = 60

export default async function FixtureTablesPage() {
  const [{ panels }, initialMatches] = await Promise.all([
    getCompetitionPanelsWithLiveStandings(),
    getPreloadedMatches(),
  ])

  return (
    <FixturePageClient
      standingsPanels={panels}
      initialTab="tablas"
      initialUpcoming={getUpcomingFromMatches(initialMatches)}
      initialPrevious={getPreviousFromMatches(initialMatches)}
    />
  )
}
