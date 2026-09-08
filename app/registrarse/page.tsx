import { RegisterForm } from "@/components/auth-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { redirectIfAuthenticated } from "@/lib/supabase/guards"

export default async function RegistrarsePage() {
  await redirectIfAuthenticated()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose grid gap-5 py-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-8 md:py-14">
          <header className="space-y-3 md:space-y-4">
            <h1 className="font-display text-[2.2rem] font-extrabold tracking-tight leading-none md:text-5xl">Crear cuenta</h1>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">
              Creá tu cuenta para guardar tu progreso de trivia, recuperar tus resultados y mantener tu jugador en cualquier dispositivo.
            </p>
          </header>
          <div className="mx-auto w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
