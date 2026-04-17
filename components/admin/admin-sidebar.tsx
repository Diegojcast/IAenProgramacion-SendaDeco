"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  Tags,
  Palette,
  Layers,
  ShoppingBag,
  Home,
  Menu,
  LogOut,
  Users,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/colors", label: "Colores", icon: Palette },
  { href: "/admin/materials", label: "Materiales", icon: Layers },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/workers", label: "Trabajadores", icon: Users },
  { href: "/admin/homepage", label: "Inicio", icon: Home },
]

/** Links outside /admin that are accessible to both admins and workers. */
const extraItems = [
  { href: "/mi-trabajo", label: "Mi trabajo", icon: Briefcase, exact: true },
]

interface NavLinksProps {
  pathname: string
  userEmail: string
  onNavigate?: () => void
}

function NavLinks({ pathname, userEmail, onNavigate }: NavLinksProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Senda Deco
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Extra links (accessible outside /admin) */}
      <div className="px-3 pb-2 space-y-0.5">
        <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          Accesos
        </p>
        {extraItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-border space-y-2">
        <p className="text-[11px] text-muted-foreground truncate" title={userEmail}>
          {userEmail}
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar (lg+) ───────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-border bg-card min-h-screen flex-col">
        <NavLinks pathname={pathname} userEmail={userEmail} />
      </aside>

      {/* ── Mobile top bar + sheet drawer (< lg) ───────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-3">
              <Menu size={20} />
              <span className="sr-only">Menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 flex flex-col">
            <NavLinks
              pathname={pathname}
              userEmail={userEmail}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="font-serif text-lg font-medium text-foreground tracking-tight">
          Senda Deco
        </span>
        <span className="ml-2 text-xs text-muted-foreground">/ Admin</span>

        {/* Email + logout on mobile top bar (right side) */}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[160px]">
            {userEmail}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )
}
