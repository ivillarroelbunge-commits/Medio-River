import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  invert?: boolean
}

export function Logo({ className, invert = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Medio River — Inicio"
      className={cn(
        "group inline-flex items-center gap-2 font-display text-base font-extrabold tracking-tight md:text-lg",
        className,
      )}
    >
      <img
        src="/logoMR.jpeg"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 rounded-full object-cover ring-1 ring-border transition-transform group-hover:scale-105 md:h-10 md:w-10"
      />
      <span className="hidden items-baseline xs:flex sm:flex">
        <span className={cn(invert ? "text-background" : "text-foreground")}>
          MEDIO
        </span>
        <span className="ml-1 text-primary">RIVER</span>
      </span>
    </Link>
  )
}
