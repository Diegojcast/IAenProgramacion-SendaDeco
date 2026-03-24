import type { ReactNode } from "react"

/** Layout admin: sin navegación pública; UI completa vendrá después. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Senda Deco — Admin
        </p>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
