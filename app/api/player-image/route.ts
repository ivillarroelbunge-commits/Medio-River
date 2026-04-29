import { NextRequest, NextResponse } from "next/server"

const allowedHosts = new Set(["images.fotmob.com"])

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src")

  if (!src) {
    return new NextResponse("Missing image source", { status: 400 })
  }

  let url: URL
  try {
    url = new URL(src)
  } catch {
    return new NextResponse("Invalid image source", { status: 400 })
  }

  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    return new NextResponse("Image source not allowed", { status: 403 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "MedioRiver/1.0",
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) {
      return new NextResponse("Image not found", { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Invalid content type", { status: 415 })
    }

    const body = await response.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Type": contentType,
      },
    })
  } catch {
    return new NextResponse("Could not load image", { status: 502 })
  }
}
