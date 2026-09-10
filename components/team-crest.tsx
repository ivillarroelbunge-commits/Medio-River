import Image from "next/image"
import { getTeamCrest } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TeamCrestProps {
  team: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap: Record<NonNullable<TeamCrestProps["size"]>, string> = {
  xs: "h-5 w-5",
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

const pixelSizeMap: Record<NonNullable<TeamCrestProps["size"]>, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 64,
  xl: 96,
}

export function TeamCrest({ team, size = "md", className }: TeamCrestProps) {
  const pixels = pixelSizeMap[size]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent",
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src={getTeamCrest(team)}
        alt=""
        width={pixels}
        height={pixels}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  )
}
