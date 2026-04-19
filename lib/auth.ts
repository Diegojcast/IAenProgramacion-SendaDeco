import NextAuth from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authConfig } from "@/lib/auth.config"

/**
 * Hard-coded admin emails (env fallback).
 * Workers that are NOT in this list can still log in if they exist in the
 * Worker table — they just get role "worker" instead of "admin".
 */
const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ?? "diegojcast@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  callbacks: {
    // Inherit the edge-safe session callback from authConfig
    ...authConfig.callbacks,

    /**
     * Allow sign-in if:
     *   a) email is in the ADMIN_EMAILS list, OR
     *   b) email exists in the Worker table
     */
    async signIn({ user }) {
      const email = user.email?.toLowerCase() ?? ""
      if (!email) return false
      if (ADMIN_EMAILS.includes(email)) return true
      const worker = await prisma.worker.findUnique({ where: { email }, select: { id: true } })
      return !!worker
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email
        // Resolve role once at sign-in time and cache in JWT
        const email = user.email.toLowerCase()
        if (ADMIN_EMAILS.includes(email)) {
          token.role = "admin"
          token.workerId = null
        } else {
          const worker = await prisma.worker.findUnique({
            where: { email },
            select: { id: true, isAdmin: true },
          })
          token.role = worker?.isAdmin ? "admin" : "worker"
          token.workerId = worker?.id ?? null
        }
      }
      return token
    },

    session({ session, token }) {
      if (token.email) session.user.email = token.email as string
      // @ts-expect-error – custom field
      session.user.role = token.role as string
      // @ts-expect-error – custom field
      session.user.workerId = token.workerId as string | null
      return session
    },
  },
})

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
