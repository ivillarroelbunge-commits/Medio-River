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
        "group inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight",
        className,
      )}
    >
      <img
        src="/logoMR.jpeg"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 rounded-full object-cover ring-1 ring-border transition-transform group-hover:scale-105"
      />
      <span className="flex items-baseline">
        <span className={cn(invert ? "text-background" : "text-foreground")}>
          MEDIO
        </span>
        <span className="ml-1 text-primary">RIVER</span>
      </span>
    </Link>
  )
}
