"use client"

import { useEffect, useState } from "react"
import type { SquadPlayer } from "@/lib/data/types"
import { squadPlayers as fallbackSquadPlayers } from "@/lib/data/squad"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchSquadPlayers } from "@/lib/supabase/squad"

export function useSquadPlayers() {
  const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>(fallbackSquadPlayers)
  const [isSquadLoading, setIsSquadLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createSupabaseBrowserClient()

    void fetchSquadPlayers(supabase)
      .then(({ squadPlayers: remotePlayers, error }) => {
        if (!active) return

        if (error) {
          console.warn("No se pudo cargar el plantel desde Supabase; se usa el respaldo local.", error)
          return
        }

        if (remotePlayers?.length) {
          setSquadPlayers(remotePlayers)
        }
      })
      .finally(() => {
        if (active) setIsSquadLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { squadPlayers, isSquadLoading }
}
