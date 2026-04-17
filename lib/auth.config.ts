/**
 * Edge-safe auth configuration — no Node.js / Prisma imports.
 * Used by middleware (Edge runtime) and spread into the full server auth config.
 */
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * Surface JWT claims (role, workerId) onto the session object.
     * This callback is edge-safe — it only reads from the already-signed token,
     * no database calls needed here.
     */
    session({ session, token }) {
      if (token.email) session.user.email = token.email as string
      // @ts-expect-error – custom field
      session.user.role = token.role as string
      // @ts-expect-error – custom field
      session.user.workerId = token.workerId as string | null
      return session
    },
  },
}
