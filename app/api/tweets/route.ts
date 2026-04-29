import { NextResponse } from "next/server"
import { latestTweets } from "@/lib/data"
import { fetchLatestXTweets } from "@/lib/x-api"

export async function GET() {
  const token = (process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || "")
    .trim()
    .replace(/^Bearer\s+/i, "")
  const username = process.env.X_USERNAME || "MedioRiver"

  if (!token || token.length < 50) {
    return NextResponse.json({
      source: "fallback",
      error: "Falta configurar un Bearer Token válido de X.",
      tweets: latestTweets,
    })
  }

  try {
    const tweets = await fetchLatestXTweets(username, token)
    return NextResponse.json({
      source: "x",
      tweets: tweets.length > 0 ? tweets : latestTweets,
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: "fallback",
        error: error instanceof Error ? error.message : "No se pudieron cargar tweets reales.",
        tweets: latestTweets,
      },
      { status: 200 },
    )
  }
}
