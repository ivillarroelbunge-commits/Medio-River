import { FixturePageClient } from "@/components/fixture-page-client"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"

export default async function FixturePage() {
  const { panels } = await getCompetitionPanelsWithLiveStandings()

  return <FixturePageClient standingsPanels={panels} />
}
