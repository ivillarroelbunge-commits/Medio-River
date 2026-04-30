import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { contactEmail } from "@/lib/data"

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: "Términos y condiciones de uso de Medio River.",
}

const sections = [
  {
    title: "1. Aceptación de los términos",
    content:
      "Al acceder y utilizar Medio River aceptás estos términos de servicio. Si no estás de acuerdo con alguna parte, te pedimos que no utilices el sitio.",
  },
  {
    title: "2. Naturaleza del sitio",
    content:
      "Medio River es un medio digital independiente dedicado a noticias, información, fixture, plantel, trivia y contenido relacionado con River Plate. No somos un sitio oficial ni tenemos vinculación institucional con el Club Atlético River Plate.",
  },
  {
    title: "3. Uso permitido",
    content:
      "Podés navegar, leer, compartir enlaces y participar de las funcionalidades disponibles respetando la ley, a otros usuarios y la integridad del sitio. No está permitido intentar vulnerar la seguridad, automatizar abusivamente el acceso, publicar contenido ofensivo o usar la plataforma para fines ilícitos.",
  },
  {
    title: "4. Cuentas de usuario",
    content:
      "Al registrarte, sos responsable de mantener la confidencialidad de tus credenciales y de la actividad asociada a tu cuenta. Podemos limitar, suspender o eliminar cuentas que incumplan estos términos o afecten el funcionamiento de la comunidad.",
  },
  {
    title: "5. Contenido editorial",
    content:
      "El contenido publicado busca informar y entretener. Aunque trabajamos para mantener la información actualizada, puede haber errores, cambios de último momento o datos sujetos a confirmación. Medio River no garantiza exactitud absoluta ni continuidad permanente del servicio.",
  },
  {
    title: "6. Propiedad intelectual",
    content:
      "Los textos, diseños, organización del contenido y elementos propios de Medio River pertenecen al sitio o a sus respectivos titulares. Las marcas, nombres, escudos, imágenes o referencias de terceros pertenecen a sus dueños correspondientes y se usan con fines informativos.",
  },
  {
    title: "7. Publicidad y enlaces externos",
    content:
      "El sitio puede mostrar publicidad, incluyendo anuncios de Google AdSense, y enlaces a sitios externos. No somos responsables por el contenido, políticas o prácticas de terceros.",
  },
  {
    title: "8. Cambios en el servicio",
    content:
      "Podemos modificar, suspender o discontinuar secciones del sitio, funcionalidades o estos términos cuando sea necesario. La versión vigente será la publicada en esta página.",
  },
  {
    title: "9. Contacto",
    content:
      `Para consultas sobre estos términos podés escribirnos a ${contactEmail}.`,
  },
]

export default function TerminosDeServicioPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="container-prose max-w-4xl py-8 md:py-12">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            ← Volver al inicio
          </Link>

          <header className="mt-6 rounded-[1.75rem] border border-border bg-card p-6 shadow-sm md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="mt-2 font-display text-[2rem] font-extrabold tracking-tight md:text-5xl">
              Términos de servicio
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Condiciones generales para usar Medio River y sus funcionalidades.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Última actualización: 30 de abril de 2026
            </p>
          </header>

          <div className="mt-6 space-y-4 md:mt-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm md:p-6">
                <h2 className="font-display text-xl font-extrabold text-foreground">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">{section.content}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
