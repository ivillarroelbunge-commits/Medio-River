import type { Metadata } from "next"
import { ProfilePageClient } from "@/components/profile-page-client"

export const metadata: Metadata = {
  title: "Mi perfil",
}

export default function PerfilPage() {
  return <ProfilePageClient />
}
