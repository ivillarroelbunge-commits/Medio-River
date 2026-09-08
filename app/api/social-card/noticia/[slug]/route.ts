import React from "react"
import { ImageResponse } from "next/og"
import { getTeamCrest } from "@/lib/data"
import { fetchNewsArticleBySlug } from "@/lib/supabase/news"
import { createClient } from "@/lib/supabase/server"

const SITE_URL = "https://medioriver.com.ar"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()
  const { article } = await fetchNewsArticleBySlug(supabase, slug)

  if (!article?.matchId) {
    return fallbackImage()
  }

  const { data: match } = await supabase
    .from("matches")
    .select("opponent, is_home")
    .eq("id", article.matchId)
    .maybeSingle<{ opponent: string; is_home: boolean }>()

  if (!match) {
    return fallbackImage()
  }

  const homeTeam = match.is_home ? "River Plate" : match.opponent
  const awayTeam = match.is_home ? match.opponent : "River Plate"
  const homeCrest = toAbsoluteUrl(getTeamCrest(homeTeam))
  const awayCrest = toAbsoluteUrl(getTeamCrest(awayTeam))

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "Arial, sans-serif",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background: "radial-gradient(circle at center, rgba(220, 38, 38, 0.11), rgba(255,255,255,0) 48%)",
          },
        },
        React.createElement("div", {
          style: {
            position: "absolute",
            top: 80,
            bottom: 80,
            left: "50%",
            width: 2,
            background: "#e5e7eb",
          },
        }),
        React.createElement(
          "div",
          {
            style: {
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          React.createElement("img", {
            src: homeCrest,
            alt: homeTeam,
            style: { width: 250, height: 250, objectFit: "contain" },
          }),
        ),
        React.createElement(
          "div",
          {
            style: {
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          React.createElement("img", {
            src: awayCrest,
            alt: awayTeam,
            style: { width: 250, height: 250, objectFit: "contain" },
          }),
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 52px",
            background: "#111111",
            color: "#ffffff",
          },
        },
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          React.createElement(
            "div",
            { style: { fontSize: 34, fontWeight: 800, letterSpacing: -0.6 } },
            "PUNTUÁ A LOS JUGADORES DE RIVER",
          ),
          React.createElement(
            "div",
            { style: { fontSize: 20, color: "#d1d5db" } },
            `${homeTeam} vs ${awayTeam}`,
          ),
        ),
        React.createElement(
          "div",
          { style: { fontSize: 24, fontWeight: 800, color: "#ef4444" } },
          "MEDIO RIVER",
        ),
      ),
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  )
}

function fallbackImage() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: 64,
          fontWeight: 800,
        },
      },
      "MEDIO RIVER",
    ),
    { width: 1200, height: 630 },
  )
}

function toAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, SITE_URL).toString()
}
