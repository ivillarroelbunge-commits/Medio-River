import { NextResponse } from "next/server"
import { getCompetitionPanelsWithLiveStandings } from "@/lib/football-standings-api"

export async function GET() {
  const result = await getCompetitionPanelsWithLiveStandings()

  return NextResponse.json(result)
}
