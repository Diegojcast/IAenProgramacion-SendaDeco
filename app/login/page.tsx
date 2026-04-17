/**
 * Login page — shown when accessing /admin without a session,
 * or when a sign-in attempt is denied.
 *
 * This is a server component. The actual sign-in action lives in
 * a tiny client component (LoginButton) to allow onClick usage.
 */
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginButton } from "./login-button"

export const metadata: Metadata = {
  title: "Iniciar sesión | Senda Deco Admin",
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  // Already authenticated → go straight to admin
  const session = await auth()
  if (session) redirect("/admin")

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <p className="font-serif text-3xl font-medium text-foreground tracking-tight mb-1">
            Senda Deco
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-serif text-xl font-medium text-foreground mb-1">
            Iniciar sesión
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Usá tu cuenta de Google para acceder al panel.
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error === "AccessDenied"
                ? "Tu cuenta no tiene acceso al panel de administración."
                : "Ocurrió un error al iniciar sesión. Intentá de nuevo."}
            </div>
          )}

          <LoginButton />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Senda Deco © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
