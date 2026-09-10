import { FixturePageClient } from "@/components/fixture-page-client"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"
import { getPreloadedMatches, getPreviousFromMatches, getUpcomingFromMatches } from "@/lib/matches-preload"

// Refresh the fixture shell every minute. Promiedos standings keep their own
// five-minute data cache, while match dates/statuses can update more often.
export const revalidate = 60

export default async function FixturePage() {
  const [{ panels }, initialMatches] = await Promise.all([
    getCompetitionPanelsWithLiveStandings(),
    getPreloadedMatches(),
  ])

  return (
    <FixturePageClient
      standingsPanels={panels}
      initialTab="proximos"
      initialUpcoming={getUpcomingFromMatches(initialMatches)}
      initialPrevious={getPreviousFromMatches(initialMatches)}
    />
  )
}
