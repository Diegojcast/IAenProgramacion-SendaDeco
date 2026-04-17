import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrdersByWorker } from "@/lib/repositories/admin/orders"
import { adminGetWorkers } from "@/lib/repositories/admin/workers"
import { MiTrabajoOrders } from "@/components/worker/mi-trabajo-orders"

export default async function MiTrabajoPage() {
  const session = await auth()
  if (!session) redirect("/login")

  // @ts-expect-error – extended session type
  const role = session?.user?.role as string | undefined
  // @ts-expect-error – extended session type
  const workerId = session?.user?.workerId as string | null

  const isAdmin = role === "admin"

  // Fetch default worker's orders (may be empty if admin has no worker record)
  const initialOrders = workerId ? await getOrdersByWorker(workerId) : []

  // Admin: also fetch all workers + their orders for the worker picker
  if (isAdmin) {
    const allWorkers = await adminGetWorkers()
    // Pre-fetch orders for every worker in parallel
    const orderEntries = await Promise.all(
      allWorkers.map(async (w) => [w.id, await getOrdersByWorker(w.id)] as const)
    )
    const workerOrdersMap = Object.fromEntries(orderEntries)

    // Default selection: own worker record if available, else first worker
    const defaultId = workerId ?? allWorkers[0]?.id ?? null

    return (
      <MiTrabajoOrders
        defaultWorkerId={defaultId}
        initialOrders={defaultId ? (workerOrdersMap[defaultId] ?? initialOrders) : initialOrders}
        allWorkers={allWorkers.map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))}
        workerOrdersMap={workerOrdersMap}
        isAdmin
      />
    )
  }

  // Worker view — own orders only
  return (
    <MiTrabajoOrders
      defaultWorkerId={workerId}
      initialOrders={initialOrders}
    />
  )
}
