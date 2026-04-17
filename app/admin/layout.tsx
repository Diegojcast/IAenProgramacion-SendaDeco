import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth, isAdminEmail } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side guard: middleware handles unauthenticated users, but we also
  // verify the email whitelist here so edge-runtime token manipulation can't bypass it.
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!isAdminEmail(session.user?.email)) {
    // Authenticated with Google but not in the allowed list
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="font-serif text-2xl font-medium text-foreground">Acceso denegado</p>
          <p className="text-sm text-muted-foreground">
            La cuenta <span className="font-medium text-foreground">{session.user?.email}</span> no
            tiene permisos para acceder al panel de administración.
          </p>
          <a
            href="/api/auth/signout"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            Cerrar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userEmail={session.user?.email ?? ""} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* pt-14 on mobile to clear the fixed top bar; removed on lg+ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full pt-[4.5rem] lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
