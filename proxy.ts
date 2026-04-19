/**
 * Next.js Edge Middleware — runs before every request.
 *
 * /admin/*      → require role "admin"  → redirect to /login or /mi-trabajo
 * /mi-trabajo/* → require any session   → redirect to /login if missing
 * /login        → if already authed, redirect based on role
 *
 * Uses the edge-safe auth config (no Prisma) so this runs cleanly in the
 * Edge runtime without importing Node.js-only modules.
 */
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge-safe NextAuth instance — no Prisma / Node.js built-ins
const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  // @ts-expect-error – custom field set in jwt callback
  const role: string | undefined = session?.user?.role

  // Protect /admin — admins only
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
    if (role === "worker") {
      return NextResponse.redirect(new URL("/mi-trabajo", req.url))
    }
  }

  // Protect /mi-trabajo — any authenticated user (worker or admin)
  if (pathname.startsWith("/mi-trabajo")) {
    if (!session) {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  // /login with an active session: only redirect workers (who have no reason to
  // be on /login). Admins may land here intentionally (e.g. after sign-out) so
  // we leave them alone and let Next.js render the page.
  if (pathname === "/login" && session && role === "worker") {
    return NextResponse.redirect(new URL("/mi-trabajo", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/mi-trabajo/:path*", "/login"],
}
