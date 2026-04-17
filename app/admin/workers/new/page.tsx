import { adminGetCategories } from "@/lib/repositories/admin/categories"
import { WorkerForm } from "@/components/admin/workers/worker-form"

export const metadata = { title: "Nuevo trabajador | Admin" }

export default async function NewWorkerPage() {
  const categories = await adminGetCategories()
  return (
    <WorkerForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  )
}
