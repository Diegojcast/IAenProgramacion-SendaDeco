import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    email: session.user?.email,
    // @ts-expect-error – custom field
    role: session.user?.role,
    // @ts-expect-error – custom field
    workerId: session.user?.workerId,
  })
}
