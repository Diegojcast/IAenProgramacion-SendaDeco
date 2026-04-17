import { adminGetWorkers } from "@/lib/repositories/admin/workers"
import { WorkersList } from "@/components/admin/workers/workers-list"

export const metadata = { title: "Trabajadores | Admin" }

export default async function AdminWorkersPage() {
  const workers = await adminGetWorkers()
  return <WorkersList workers={workers} />
}
