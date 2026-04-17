import { notFound } from "next/navigation"
import { adminGetWorkerById, getWorkerWorkload } from "@/lib/repositories/admin/workers"
import { WorkerDetail } from "@/components/admin/workers/worker-detail"

export const metadata = { title: "Trabajador | Admin" }

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [worker, workload] = await Promise.all([
    adminGetWorkerById(id),
    getWorkerWorkload(id),
  ])
  if (!worker) notFound()

  return <WorkerDetail worker={worker} workload={workload} />
}
