import { getSupabaseEnv } from "@/lib/supabase/env"

export const runtime = "nodejs"
export const revalidate = 86400

const IMAGE_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const image = await getStoredImage(id)

  if (!image) {
    return new Response("Image not found", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    })
  }

  const dataImage = parseDataImage(image)
  if (dataImage) {
    return new Response(dataImage.bytes, {
      headers: {
        "Content-Type": dataImage.contentType,
        "Cache-Control": IMAGE_CACHE_CONTROL,
      },
    })
  }

  try {
    const destination = image.startsWith("/")
      ? new URL(image, request.url).toString()
      : new URL(image).toString()

    return new Response(null, {
      status: 307,
      headers: {
        Location: destination,
        "Cache-Control": IMAGE_CACHE_CONTROL,
      },
    })
  } catch {
    return new Response("Invalid image", { status: 404 })
  }
}

async function getStoredImage(id: string) {
  try {
    const { url, key } = getSupabaseEnv()
    const endpoint = new URL(`${url}/rest/v1/news_articles`)
    endpoint.searchParams.set("select", "image")
    endpoint.searchParams.set("id", `eq.${id}`)
    endpoint.searchParams.set("limit", "1")

    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Accept: "application/json",
      },
      next: {
        revalidate: 86400,
        tags: [`news-image:${id}`],
      },
    })

    if (!response.ok) return null

    const rows = (await response.json()) as Array<{ image?: string | null }>
    return rows[0]?.image?.trim() || null
  } catch {
    return null
  }
}

function parseDataImage(value: string) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+)$/i.exec(value)
  if (!match) return null

  try {
    return {
      contentType: match[1],
      bytes: Buffer.from(match[2].replace(/\s/g, ""), "base64"),
    }
  } catch {
    return null
  }
}
