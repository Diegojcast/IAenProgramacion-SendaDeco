import { NextResponse } from "next/server"

// Debug endpoint — disabled in production
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { auth } = await import("@/lib/auth")
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
