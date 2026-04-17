import { notFound } from "next/navigation"
import { adminGetWorkerById } from "@/lib/repositories/admin/workers"
import { adminGetCategories } from "@/lib/repositories/admin/categories"
import { WorkerForm } from "@/components/admin/workers/worker-form"

export const metadata = { title: "Editar trabajador | Admin" }

export default async function EditWorkerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [worker, categories] = await Promise.all([
    adminGetWorkerById(id),
    adminGetCategories(),
  ])
  if (!worker) notFound()

  return (
    <WorkerForm
      worker={worker}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  )
}
