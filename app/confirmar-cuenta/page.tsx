import type { Metadata } from "next"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Confirmá tu cuenta",
  description: "Revisá tu correo para confirmar tu cuenta de Medio River.",
}

export default async function ConfirmarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center">
        <section className="container-prose py-10">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary px-6 py-10 text-center text-white md:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                <MailCheck className="h-8 w-8" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/65">Un paso más</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-5xl">
                Confirmá tu cuenta
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75 md:text-base">
                Te enviamos un correo con un botón de confirmación. Abrilo y tocá el botón para activar tu cuenta de Medio River.
              </p>
            </div>

            <div className="space-y-5 p-5 text-center md:p-8">
              {email && (
                <p className="rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                  Revisá la bandeja de entrada de <span className="font-semibold text-foreground">{email}</span>.
                </p>
              )}
              <p className="text-sm leading-6 text-muted-foreground">
                Si no lo encontrás, revisá spam, promociones o correo no deseado. El link puede tardar unos minutos en llegar.
              </p>
              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Button asChild className="rounded-full">
                  <Link href="/iniciar-sesion">Ir a iniciar sesión</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
