import { AdminPageClient } from "@/components/admin-page-client"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { requireRole } from "@/lib/supabase/guards"

export default async function AdminPage() {
  await requireRole(["admin"])

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-5 md:py-10">
          <AdminPageClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
