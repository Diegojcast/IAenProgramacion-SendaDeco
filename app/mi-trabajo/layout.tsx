import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"

export default async function MiTrabajoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  // Allow both workers and admins — block only unauthenticated users
  if (!session) {
    redirect("/login")
  }

  const name = session.user.name ?? session.user.email ?? "Trabajador"

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Sesión como</p>
            <p className="text-sm font-medium">{name}</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
