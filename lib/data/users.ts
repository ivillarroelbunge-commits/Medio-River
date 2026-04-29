import type { AppUser } from "@/lib/data/types"

export const demoUsers: AppUser[] = [
  {
    id: "user-admin",
    name: "Administrador Medio River",
    email: "admin@medioriver.com",
    password: "admin123",
    role: "admin",
    registeredAt: "2026-01-10T12:00:00-03:00",
  },
  {
    id: "user-editor",
    name: "Editor Medio River",
    email: "editor@medioriver.com",
    password: "editor123",
    role: "editor",
    registeredAt: "2026-01-15T12:00:00-03:00",
  },
  {
    id: "user-demo",
    name: "Hincha Millonario",
    email: "user@medioriver.com",
    password: "river123",
    role: "user",
    registeredAt: "2026-02-01T12:00:00-03:00",
  },
]
