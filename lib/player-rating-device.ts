const STORAGE_KEY = "medio-river-player-ratings-device-v1"

function isUuid(value: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
}

export function getOrCreatePlayerRatingDeviceId() {
  if (typeof window === "undefined") return null

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isUuid(stored)) return stored

  const deviceId = crypto.randomUUID()
  window.localStorage.setItem(STORAGE_KEY, deviceId)
  return deviceId
}
