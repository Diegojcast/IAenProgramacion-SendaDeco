import { prisma } from "@/lib/db/prisma"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { HomepageForm } from "@/components/admin/homepage/homepage-form"

export default async function AdminHomepagePage() {
  const settings = await prisma.homepageSettings.findUnique({
    where: { id: "main" },
    select: { heroImageData: true, heroAlt: true },
  })

  return (
    <div>
      <AdminPageHeader
        title="Página de inicio"
        description="Configurá el hero y los productos destacados"
      />
      <HomepageForm
        hasHeroImage={!!settings?.heroImageData}
        heroAlt={settings?.heroAlt ?? ""}
      />
    </div>
  )
}
