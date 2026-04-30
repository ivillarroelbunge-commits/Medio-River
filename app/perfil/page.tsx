import { ProfilePageClient } from "@/components/profile-page-client"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { requireAuth } from "@/lib/supabase/guards"

export default async function PerfilPage() {
  await requireAuth()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-5 md:py-10">
          <ProfilePageClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
