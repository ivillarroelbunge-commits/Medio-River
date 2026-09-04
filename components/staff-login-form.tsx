"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { AuthCaptcha, hasCaptchaConfigured } from "@/components/auth-captcha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StaffLoginForm() {
  const router = useRouter()
  const { login } = useAppState()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-5 md:p-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)

        if (hasCaptchaConfigured() && !captchaToken) {
          setError("Completá la verificación para iniciar sesión.")
          return
        }

        setIsSubmitting(true)
        const formData = new FormData(event.currentTarget)
        const result = await login(
          String(formData.get("email") || ""),
          String(formData.get("password") || ""),
          captchaToken ?? undefined,
        )
        setIsSubmitting(false)

        if (!result.ok) {
          setError(result.error ?? "No se pudo iniciar sesión.")
          return
        }

        router.push(result.redirectTo ?? "/admin")
        router.refresh()
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="staff-login-email">Email</Label>
        <Input id="staff-login-email" name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-login-password">Contraseña</Label>
        <Input id="staff-login-password" name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" required className="h-11 rounded-xl" />
      </div>
      <AuthCaptcha onTokenChange={setCaptchaToken} />
      {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{error}</p>}
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  )
}
