import Link from "next/link"
import { Instagram, Mail, Twitter } from "lucide-react"
import { Logo } from "@/components/logo"
import { contactEmail, socialLinks } from "@/lib/data"

const iconMap = {
  X: Twitter,
  Instagram,
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary text-secondary-foreground">
      <div className="container-prose py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <Logo invert />
            <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground/70">
              El medio digital del hincha de River. Noticias, fixture, plantel y todo el mundo Millonario en un solo lugar.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-secondary-foreground/60">Secciones</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/noticias">Noticias</Link></li>
              <li><Link href="/fixture">Fixture</Link></li>
              <li><Link href="/plantel">Plantel</Link></li>
              <li><Link href="/trivia">Trivia</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-secondary-foreground/60">Contacto</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = iconMap[item.label as keyof typeof iconMap]
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-secondary-foreground/15 hover:border-primary hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
              <a href={`mailto:${contactEmail}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-secondary-foreground/15 hover:border-primary hover:text-primary">
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm leading-relaxed text-secondary-foreground/70">Medio River es un sitio independiente, sin vinculación oficial con el Club Atlético River Plate.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-secondary-foreground/10 pt-6 text-xs text-secondary-foreground/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Medio River. Todos los derechos reservados.</p>
          <p>{contactEmail}</p>
        </div>
      </div>
    </footer>
  )
}
