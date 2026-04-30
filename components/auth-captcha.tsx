"use client"

import Script from "next/script"
import { useEffect, useId } from "react"

type CaptchaProvider = "turnstile" | "hcaptcha"

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
    hcaptcha?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
    [key: `captchaCallback_${string}`]: (token: string) => void
    [key: `captchaExpired_${string}`]: () => void
  }
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

export function hasCaptchaConfigured() {
  return Boolean(turnstileSiteKey || hcaptchaSiteKey)
}

export function AuthCaptcha({ onTokenChange }: { onTokenChange: (token: string | null) => void }) {
  const rawId = useId()
  const id = rawId.replace(/\W/g, "")
  const provider: CaptchaProvider | null = turnstileSiteKey ? "turnstile" : hcaptchaSiteKey ? "hcaptcha" : null
  const siteKey = turnstileSiteKey ?? hcaptchaSiteKey
  const callbackName = `captchaCallback_${id}` as const
  const expiredCallbackName = `captchaExpired_${id}` as const

  useEffect(() => {
    window[callbackName] = (token: string) => onTokenChange(token)
    window[expiredCallbackName] = () => onTokenChange(null)

    return () => {
      delete window[callbackName]
      delete window[expiredCallbackName]
    }
  }, [callbackName, expiredCallbackName, onTokenChange])

  if (!provider || !siteKey) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Verificación</p>
      <div className="min-h-[70px] overflow-hidden rounded-2xl border border-border bg-background p-2">
        {provider === "turnstile" ? (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback={callbackName}
              data-expired-callback={expiredCallbackName}
              data-error-callback={expiredCallbackName}
            />
          </>
        ) : (
          <>
            <Script src="https://js.hcaptcha.com/1/api.js" async defer />
            <div
              className="h-captcha"
              data-sitekey={siteKey}
              data-callback={callbackName}
              data-expired-callback={expiredCallbackName}
              data-error-callback={expiredCallbackName}
            />
          </>
        )}
      </div>
    </div>
  )
}
