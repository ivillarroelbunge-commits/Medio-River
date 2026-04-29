export function formatDateLong(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatDateShort(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatWeekdayDate(iso: string) {
  const date = new Date(iso)
  const day = date.toLocaleDateString("es-AR", { weekday: "long" })
  const rest = date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  })
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${rest}`
}

export function formatTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function timeAgo(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "Hace instantes"
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} h`
  if (days < 7) return `Hace ${days} d`
  return formatDateShort(iso)
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
