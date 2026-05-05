import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AppStateProvider } from "@/components/app-state-provider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://medioriver.com.ar"),
  title: {
    default: "Medio River",
    template: "%s · Medio River",
  },
  description: "Medio de comunicación de actualidad creado por hinchas para hinchas de River Plate. Medio River es un sitio independiente, sin vinculación oficial con el Club Atlético River Plate.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Medio River",
    description: "Noticias, fixture, plantel y trivia del mundo River.",
    url: "https://medioriver.com.ar",
    siteName: "Medio River",
    images: [
      {
        url: "/logoMR.jpeg",
        width: 1254,
        height: 1254,
        alt: "Logo de Medio River",
      },
    ],
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Medio River",
    description: "Noticias, fixture, plantel y trivia del mundo River.",
    images: ["/logoMR.jpeg"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Medio River",
              url: "https://medioriver.com.ar",
              logo: "https://medioriver.com.ar/logoMR.jpeg",
              sameAs: [
                "https://x.com/medioriver",
                "https://www.instagram.com/medioriver",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppStateProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AppStateProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
        <SpeedInsights />
      </body>
    </html>
  )
}
