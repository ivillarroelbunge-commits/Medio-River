"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn, UserPlus } from "lucide-react"
import { useAppState } from "@/components/app-state-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAppState()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-5 md:p-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const result = await login(
          String(formData.get("email") || ""),
          String(formData.get("password") || ""),
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
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" required className="h-11 rounded-xl" />
      </div>
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
  const { register } = useAppState()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:space-y-5 md:p-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const result = await register({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
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
