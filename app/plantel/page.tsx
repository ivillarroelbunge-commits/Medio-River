import { PlantelPageClient } from "@/components/plantel-page-client"
import { squadPlayers as fallbackSquadPlayers } from "@/lib/data/squad"
import { getPreloadedSquadPlayers } from "@/lib/squad-preload"

export const revalidate = 300

export default async function PlantelPage() {
  const preloadedPlayers = await getPreloadedSquadPlayers()
  const initialSquadPlayers = preloadedPlayers.length > 0 ? preloadedPlayers : fallbackSquadPlayers

  return <PlantelPageClient initialSquadPlayers={initialSquadPlayers} />
}
