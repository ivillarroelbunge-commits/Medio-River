import type { SocialLink, Tweet } from "@/lib/data/types"

export const socialLinks: SocialLink[] = [
  { label: "X", href: "https://x.com/MedioRiver" },
  { label: "Instagram", href: "https://www.instagram.com/medioriver/" },
]

export const contactEmail = "medioriver@gmail.com"

export const latestTweets: Tweet[] = [
  {
    id: "tweet-1",
    text: "🚨🎟 VENTA DE ENTRADAS RIVER vs. BOCA JUNIORS (domingo 19/04, 17hs) 👉 Venta para Socios: desde el martes 14 de abril a las 10AM. 👉 Socios y Somos River: desde el martes 14 de abril a las 17PM.",
    publishedAt: "2026-04-07T10:03:00-03:00",
    url: "https://x.com/MedioRiver/status/2041517102213775844",
  },
  {
    id: "tweet-2",
    text: "🚨 Eduardo Coudet tiene cláusula de rescisión en Alavés y está interesado en venir. Está todo alineado para que sea el nuevo director técnico de River. ℹ️ @CLMerlo",
    publishedAt: "2026-02-23T23:20:00-03:00",
    url: "https://x.com/MedioRiver/status/2026150339389391099",
  },
  {
    id: "tweet-3",
    text: "Eduardo Coudet es el principal candidato a dirigir River. Vía @GerGarciaGrova.",
    publishedAt: "2026-02-23T18:37:00-03:00",
    url: "https://x.com/MedioRiver/status/2026094017327362370",
  },
]
