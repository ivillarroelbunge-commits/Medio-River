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

export function TeamCrest({ team, size = "md", className }: TeamCrestProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent",
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      <img src={getTeamCrest(team)} alt="" className="h-full w-full object-contain" />
    </span>
  )
}
