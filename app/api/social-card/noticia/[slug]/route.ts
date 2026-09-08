import React from "react"
import { ImageResponse } from "next/og"
import { getTeamCrest } from "@/lib/data"
import { fetchSocialArticleMetadata } from "@/lib/social-article-metadata"

const SITE_URL = "https://medioriver.com.ar"
const IMAGE_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const social = await fetchSocialArticleMetadata(slug)
  const article = social?.article
  const match = social?.match

  if (!article) {
    return fallbackImage()
  }

  if (article.articleType !== "player_ratings" || !article.matchId || !match) {
    return serveArticleCover(article.image)
  }

  const homeTeam = match.isHome ? "River Plate" : match.opponent
  const awayTeam = match.isHome ? match.opponent : "River Plate"
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
        "Cache-Control": IMAGE_CACHE_CONTROL,
      },
    },
  )
}

async function serveArticleCover(image: string | null) {
  const source = image?.trim()
  if (!source) return fallbackImage()

  if (source.startsWith("data:")) {
    const parsed = parseDataImage(source)
    if (!parsed) return fallbackImage()

    return new Response(parsed.bytes, {
      status: 200,
      headers: {
        "Content-Type": parsed.contentType,
        "Cache-Control": IMAGE_CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    })
  }

  try {
    const imageUrl = toAbsoluteUrl(source)
    const response = await fetch(imageUrl, { cache: "force-cache" })
    if (!response.ok) return fallbackImage()

    const contentType = response.headers.get("content-type") || "image/jpeg"
    if (!contentType.toLowerCase().startsWith("image/")) return fallbackImage()

    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": IMAGE_CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return fallbackImage()
  }
}

function parseDataImage(value: string) {
  const match = value.match(/^data:(image\/[a-z0-9.+-]+)(;base64)?,(.*)$/is)
  if (!match) return null

  try {
    const contentType = match[1].toLowerCase()
    const payload = match[3]
    const bytes = match[2]
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8")

    if (!bytes.length) return null
    return { contentType, bytes }
  } catch {
    return null
  }
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
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": IMAGE_CACHE_CONTROL },
    },
  )
}

function toAbsoluteUrl(value: string) {
  if (/^(?:https?:|data:)/i.test(value)) return value
  return new URL(value, SITE_URL).toString()
}
