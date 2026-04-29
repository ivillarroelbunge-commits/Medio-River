import type { Tweet } from "@/lib/data/types"

interface XUserResponse {
  data?: {
    id: string
  }
}

interface XMedia {
  media_key: string
  type?: string
  url?: string
  preview_image_url?: string
}

interface XTweet {
  id: string
  text: string
  created_at?: string
  attachments?: {
    media_keys?: string[]
  }
}

interface XTimelineResponse {
  data?: XTweet[]
  includes?: {
    media?: XMedia[]
  }
}

const X_API_BASE_URL = "https://api.twitter.com/2"

async function xFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${X_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      revalidate: 300,
    },
  })

  if (!response.ok) {
    throw new Error(`X API respondió ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchLatestXTweets(username: string, token: string, maxResults = 9): Promise<Tweet[]> {
  const user = await xFetch<XUserResponse>(
    `/users/by/username/${encodeURIComponent(username.replace(/^@/, ""))}`,
    token,
  )

  if (!user.data?.id) {
    return []
  }

  const params = new URLSearchParams({
    max_results: String(Math.max(5, Math.min(maxResults, 100))),
    "tweet.fields": "created_at,attachments",
    expansions: "attachments.media_keys",
    "media.fields": "url,preview_image_url,type",
    exclude: "retweets,replies",
  })

  const timeline = await xFetch<XTimelineResponse>(`/users/${user.data.id}/tweets?${params}`, token)
  const mediaByKey = new Map((timeline.includes?.media ?? []).map((media) => [media.media_key, media]))

  return (timeline.data ?? []).map((tweet) => {
    const media = tweet.attachments?.media_keys
      ?.map((key) => mediaByKey.get(key))
      .find((item) => item?.url || item?.preview_image_url)

    return {
      id: tweet.id,
      text: tweet.text,
      publishedAt: tweet.created_at ?? new Date().toISOString(),
      image: media?.url ?? media?.preview_image_url,
      url: `https://x.com/${username.replace(/^@/, "")}/status/${tweet.id}`,
    }
  })
}
