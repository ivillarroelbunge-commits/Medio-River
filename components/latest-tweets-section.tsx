"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    twttr?: {
      _e?: Array<() => void>
      ready?: (callback: () => void) => void
      widgets?: {
        createTimeline?: (
          source: { sourceType: "profile"; screenName: string },
          element: HTMLElement,
          options?: Record<string, string | number | boolean>,
        ) => Promise<HTMLElement>
        load: (element?: HTMLElement | null) => void
      }
    }
  }
}

export function LatestTweetsSection() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const renderRequestedRef = useRef(false)
  const renderTimerRef = useRef<number | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [renderFailed, setRenderFailed] = useState(false)
  const [rendering, setRendering] = useState(true)
  const [showBlockedHint, setShowBlockedHint] = useState(false)

  const loadTimeline = useCallback(() => {
    const target = timelineRef.current
    const widgets = window.twttr?.widgets

    if (!target || !widgets) return
    if (renderRequestedRef.current) return

    renderRequestedRef.current = true
    setRendering(true)
    setRenderFailed(false)
    target.innerHTML = ""

    if (renderTimerRef.current) {
      window.clearTimeout(renderTimerRef.current)
    }

    const options = {
      chrome: "nofooter",
      dnt: false,
      height: window.matchMedia("(max-width: 767px)").matches ? 500 : 650,
    }

    if (widgets.createTimeline) {
      void widgets
        .createTimeline({ sourceType: "profile", screenName: "MedioRiver" }, target, options)
        .then(() => {
          setRendering(false)
          setRenderFailed(false)
        })
        .catch(() => {
          renderRequestedRef.current = false
          target.innerHTML =
            '<a class="twitter-timeline" data-height="650" data-chrome="nofooter" href="https://twitter.com/MedioRiver?ref_src=twsrc%5Etfw">Tweets by MedioRiver</a>'
          widgets.load(target)
          window.setTimeout(() => setRendering(false), 1200)
        })
      return
    }

    target.innerHTML =
      '<a class="twitter-timeline" data-height="650" data-chrome="nofooter" href="https://twitter.com/MedioRiver?ref_src=twsrc%5Etfw">Tweets by MedioRiver</a>'
    widgets.load(target)
    renderTimerRef.current = window.setTimeout(() => setRendering(false), 1200)
  }, [])

  useEffect(() => {
    window.twttr = window.twttr || { _e: [] }
    window.twttr._e = window.twttr._e || []
    window.twttr.ready = window.twttr.ready || ((callback) => window.twttr?._e?.push(callback))

    if (window.twttr.widgets?.load) {
      loadTimeline()
    } else {
      window.twttr.ready(loadTimeline)
    }

    if (!scriptReady) return

    loadTimeline()

    const checkRender = window.setTimeout(() => {
      const hasIframe = Boolean(timelineRef.current?.querySelector("iframe"))
      setRenderFailed(!hasIframe)
      setRendering(false)
      setShowBlockedHint(hasIframe)
    }, 6500)

    return () => {
      window.clearTimeout(checkRender)
      if (renderTimerRef.current) {
        window.clearTimeout(renderTimerRef.current)
      }
    }
  }, [loadTimeline, scriptReady])

  return (
    <section className="space-y-4" aria-label="Últimos tweets" data-testid="latest-tweets-section">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Desde X</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Últimos tweets</h2>
      </div>

      <div className="rounded-[1.75rem] border border-border bg-card p-3 shadow-sm md:p-4">
        <div className="relative h-[500px] overflow-hidden rounded-[1.35rem] bg-muted/30 md:h-[650px] [&_iframe]:!h-full [&_iframe]:!w-full">
          <div ref={timelineRef} className="h-full w-full" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="font-display text-xl font-extrabold">Cargando tweets...</p>
                <p className="mt-2 text-sm text-muted-foreground">Conectando con el timeline oficial de @MedioRiver.</p>
              </div>
            </div>
          )}
          {renderFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 p-6 text-center backdrop-blur-sm">
              <div className="max-w-sm">
                <p className="font-display text-xl font-extrabold">No se pudo cargar el timeline embebido.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  X puede bloquear el widget por cookies, extensiones o configuración del navegador.
                </p>
                <a
                  href="https://twitter.com/MedioRiver"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Ver @MedioRiver en X
                </a>
              </div>
            </div>
          )}
          {showBlockedHint && (
            <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border bg-background/95 p-3 text-sm shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground">
                  Si el timeline queda en blanco, X está bloqueando temporalmente el widget oficial.
                </p>
                <a
                  href="https://twitter.com/MedioRiver"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Abrir en X
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <Script
        id="twitter-wjs"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptReady(true)
          window.requestAnimationFrame(loadTimeline)
        }}
        onReady={() => {
          setScriptReady(true)
          window.requestAnimationFrame(loadTimeline)
        }}
      />
    </section>
  )
}
