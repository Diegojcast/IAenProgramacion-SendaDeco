import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { toggleScheduledTask } from "@/lib/repositories/scheduled-tasks"
import { prisma } from "@/lib/db/prisma"

type Params = { params: Promise<{ taskId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // @ts-expect-error – extended session
  const isAdmin = session?.user?.role === "admin"
  // @ts-expect-error – extended session
  const workerId = session?.user?.workerId as string | null

  const { taskId } = await params
  const body = await request.json()
  const { completed } = body

  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "completed must be a boolean" }, { status: 400 })
  }

  // Workers can only toggle their own tasks
  if (!isAdmin) {
    const task = await prisma.scheduledTask.findUnique({
      where: { id: taskId },
      select: { workerId: true },
    })
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (task.workerId !== workerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  try {
    const updated = await toggleScheduledTask(taskId, completed)
    return NextResponse.json({ task: updated })
  } catch (err) {
    console.error("[scheduled-tasks] toggle error", err)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
