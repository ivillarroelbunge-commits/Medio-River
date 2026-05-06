import Link from "next/link"
import { BellRing, ExternalLink, Radio } from "lucide-react"

export function LatestTweetsSection() {
  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,#080808_0%,#1b0709_46%,#d71920_100%)] p-5 text-white shadow-[0_22px_55px_rgba(15,23,42,0.22)] md:rounded-[2.25rem] md:p-8"
      aria-label="Seguinos en X"
    >
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/12 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-primary/35 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,transparent_0%,transparent_42%,white_43%,white_45%,transparent_46%,transparent_100%)]" />

      <div className="relative grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/18">
            <Radio className="h-3.5 w-3.5 text-primary" />
            Información al instante
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-[2rem] font-black leading-[0.96] tracking-tight md:text-[3.6rem]">
            Para estar al tanto de todo, seguinos en X.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base md:leading-7">
            Noticias, mercado de pases, fixture, formaciones y todo lo que pasa en River, apenas ocurre. Activá las notificaciones y no te pierdas nada.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/14 bg-black/28 p-4 shadow-2xl backdrop-blur md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold leading-tight">Activá las notificaciones</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Entrá al perfil de Medio River, tocá la campana y recibí cada novedad en tiempo real.
              </p>
            </div>
          </div>

          <Link
            href="https://x.com/MedioRiver"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Seguir a Medio River
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
