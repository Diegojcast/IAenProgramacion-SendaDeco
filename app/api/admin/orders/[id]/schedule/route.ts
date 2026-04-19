import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { scheduleOrder, SchedulingValidationError } from "@/lib/repositories/scheduled-tasks"
import { prisma } from "@/lib/db/prisma"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  // @ts-expect-error – extended session
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  // Guard: require at least one assigned worker
  const workerCount = await prisma.orderWorker.count({ where: { orderId: id } })
  if (workerCount === 0) {
    return NextResponse.json(
      { error: "Debe asignar al menos un trabajador antes de generar la agenda" },
      { status: 422 }
    )
  }

  try {
    const tasks = await scheduleOrder(id)
    return NextResponse.json({ tasks })
  } catch (err) {
    if (err instanceof SchedulingValidationError) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    console.error("[schedule] error", err)
    return NextResponse.json({ error: "Failed to schedule order" }, { status: 500 })
  }
}
