import { FixturePageClient } from "@/components/fixture-page-client"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"

// Promiedos standings are already cached for five minutes. Let the whole route
// use ISR as well instead of rebuilding the page in a function for every visit.
export const revalidate = 60 * 5

export default async function FixturePage() {
  const { panels } = await getCompetitionPanelsWithLiveStandings()

  return <FixturePageClient standingsPanels={panels} initialTab="proximos" />
}
