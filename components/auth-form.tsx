"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, LogIn, UserPlus } from "lucide-react"
import type { Provider } from "@supabase/supabase-js"
import { useAppState } from "@/components/app-state-provider"
import { AuthCaptcha, hasCaptchaConfigured } from "@/components/auth-captcha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SocialProvider = Extract<Provider, "google" | "x">

export function LoginForm() {
  const router = useRouter()
  const { login, loginWithProvider } = useAppState()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)

  const handleOAuth = async (provider: SocialProvider) => {
    setError(null)
    setPendingProvider(provider)
    const result = await loginWithProvider(provider)
    setPendingProvider(null)

    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión con ese proveedor.")
    }
  }

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

        router.push(result.redirectTo ?? "/perfil")
        router.refresh()
      }}
    >
      <SocialAuthButtons mode="login" pendingProvider={pendingProvider} onSelect={handleOAuth} />
      <AuthDivider />
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" required className="h-11 rounded-xl" />
      </div>
      <AuthCaptcha onTokenChange={setCaptchaToken} />
      {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{error}</p>}
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/registrarse" className="font-semibold text-primary hover:underline">
          Registrate
        </Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const { register, loginWithProvider } = useAppState()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)

  const handleOAuth = async (provider: SocialProvider) => {
    setError(null)
    setPendingProvider(provider)
    const result = await loginWithProvider(provider)
    setPendingProvider(null)

    if (!result.ok) {
      setError(result.error ?? "No se pudo registrar con ese proveedor.")
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-5 md:p-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)

        if (hasCaptchaConfigured() && !captchaToken) {
          setError("Completá la verificación para crear tu cuenta.")
          return
        }

        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const result = await register({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          captchaToken: captchaToken ?? undefined,
        })

        setIsSubmitting(false)

        if (!result.ok) {
          setError(result.error ?? "No se pudo registrar el usuario.")
          return
        }

        router.push(result.redirectTo ?? "/perfil")
        router.refresh()
      }}
    >
      <SocialAuthButtons mode="register" pendingProvider={pendingProvider} onSelect={handleOAuth} />
      <AuthDivider />
      <div className="space-y-2">
        <Label htmlFor="register-name">Nombre</Label>
        <Input id="register-name" name="name" autoComplete="name" placeholder="Tu nombre" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input id="register-email" name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input id="register-password" name="password" type="password" autoComplete="new-password" minLength={6} placeholder="Mínimo 6 caracteres" required className="h-11 rounded-xl" />
      </div>
      <AuthCaptcha onTokenChange={setCaptchaToken} />
      {error && <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{error}</p>}
      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-semibold text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </form>
  )
}

function SocialAuthButtons({
  mode,
  onSelect,
  pendingProvider,
}: {
  mode: "login" | "register"
  onSelect: (provider: SocialProvider) => void
  pendingProvider: SocialProvider | null
}) {
  const action = mode === "login" ? "Continuar" : "Registrarse"

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-full border-border bg-background font-semibold"
        disabled={Boolean(pendingProvider)}
        onClick={() => onSelect("google")}
      >
        {pendingProvider === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-black text-primary">G</span>}
        {action} con Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-full border-zinc-900 bg-zinc-950 font-semibold text-white hover:bg-zinc-900 hover:text-white"
        disabled={Boolean(pendingProvider)}
        onClick={() => onSelect("x")}
      >
        {pendingProvider === "x" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-black">X</span>}
        {action} con X
      </Button>
    </div>
  )
}

function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      o con email
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
