import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { contactEmail } from "@/lib/data"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Medio River.",
}

const sections = [
  {
    title: "1. Información que podemos recopilar",
    content:
      "Podemos recopilar información que nos brindás al registrarte o usar el sitio, como nombre, email, foto de perfil, resultados de trivia y preferencias de uso. También podemos recibir información técnica básica, como navegador, dispositivo, páginas visitadas y datos de rendimiento.",
  },
  {
    title: "2. Uso de la información",
    content:
      "Usamos la información para permitir el inicio de sesión, mostrar tu perfil, guardar resultados de trivia, mejorar la experiencia, mantener la seguridad del sitio y administrar funcionalidades editoriales o de comunidad.",
  },
  {
    title: "3. Autenticación con terceros",
    content:
      "Si iniciás sesión con Google o X, recibimos los datos básicos que esos proveedores comparten según sus permisos, como identificador de cuenta, email, nombre o avatar. No recibimos tu contraseña de esos servicios.",
  },
  {
    title: "4. Supabase",
    content:
      "Medio River utiliza Supabase para autenticación, base de datos y gestión de perfiles. La información necesaria para estas funcionalidades puede almacenarse en la infraestructura de Supabase bajo sus propias políticas y medidas de seguridad.",
  },
  {
    title: "5. Cookies, captcha y seguridad",
    content:
      "El sitio puede usar cookies o tecnologías similares para mantener sesiones activas, recordar preferencias y proteger formularios mediante captcha. Estas herramientas ayudan a reducir spam, abuso y accesos automatizados.",
  },
  {
    title: "6. Publicidad de Google AdSense",
    content:
      "Podemos mostrar anuncios mediante Google AdSense. Google y sus socios pueden usar cookies para personalizar o medir anuncios según visitas anteriores a este u otros sitios. Podés gestionar la personalización de anuncios desde la configuración de Google.",
  },
  {
    title: "7. Enlaces externos",
    content:
      "Medio River puede incluir enlaces a redes sociales, fuentes periodísticas u otros sitios externos. No controlamos sus políticas de privacidad ni sus prácticas de tratamiento de datos.",
  },
  {
    title: "8. Conservación y protección de datos",
    content:
      "Conservamos la información mientras sea necesaria para operar el servicio, cumplir finalidades legítimas o atender solicitudes. Aplicamos medidas razonables de seguridad, aunque ningún sistema conectado a internet puede garantizar protección absoluta.",
  },
  {
    title: "9. Tus derechos y contacto",
    content:
      `Podés escribirnos a ${contactEmail} para solicitar revisión, actualización o eliminación de datos asociados a tu cuenta, sujeto a limitaciones técnicas, legales o de seguridad aplicables.`,
  },
  {
    title: "10. Cambios en esta política",
    content:
      "Podemos actualizar esta política para reflejar cambios del sitio, nuevas funcionalidades o requisitos legales. La versión vigente será siempre la publicada en esta página.",
  },
]

export default function PoliticaDePrivacidadPage() {
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
              Política de privacidad
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Cómo Medio River recopila, usa y protege la información de sus usuarios.
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
