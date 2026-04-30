import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { AppStateProvider } from "@/components/app-state-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Medio River — Noticias, fixture y trivia de River Plate",
    template: "%s · Medio River",
  },
  description: "Noticias, fixture, plantel y trivia del mundo River.",
  openGraph: {
    title: "Medio River",
    description: "Noticias, fixture, plantel y trivia del mundo River.",
    type: "website",
    locale: "es_AR",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7693484030474244"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <AppStateProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AppStateProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
