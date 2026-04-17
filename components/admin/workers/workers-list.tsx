"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Pencil, UserRound } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminTable,
  AdminTableHead,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminSearch,
} from "@/components/admin/admin-table"
import { DeleteButton } from "@/components/admin/delete-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AdminWorker } from "@/lib/repositories/admin/workers"

interface WorkersListProps {
  workers: AdminWorker[]
}

export function WorkersList({ workers }: WorkersListProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const filtered = workers.filter((w) => {
    const q = query.toLowerCase()
    return (
      w.firstName.toLowerCase().includes(q) ||
      w.lastName.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <AdminPageHeader
        title="Trabajadores"
        description={`${workers.length} trabajador${workers.length !== 1 ? "es" : ""}`}
        action={
          <Button size="sm" asChild>
            <Link href="/admin/workers/new">+ Nuevo trabajador</Link>
          </Button>
        }
      />

      <div className="mb-4">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar por nombre o email..." />
      </div>

      <AdminTable>
        <AdminTableHead columns={["Nombre", "Email", "Categorías", "Acciones"]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay trabajadores" />
        ) : (
        <tbody>
          {filtered.map((w) => (
            <AdminTableRow key={w.id}>
              <AdminTableCell>
                <Link
                  href={`/admin/workers/${w.id}`}
                  className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
                >
                  <UserRound size={15} className="text-muted-foreground shrink-0" />
                  {w.firstName} {w.lastName}
                </Link>
              </AdminTableCell>
              <AdminTableCell muted>{w.email}</AdminTableCell>
              <AdminTableCell>
                {w.categories.length === 0 ? (
                  <span className="text-muted-foreground text-xs">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {w.categories.map((c) => (
                      <Badge key={c.id} variant="secondary" className="text-xs">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link href={`/admin/workers/${w.id}/edit`}>
                      <Pencil size={14} />
                    </Link>
                  </Button>
                  <DeleteButton
                    action={`/api/admin/workers/${w.id}`}
                    label={`${w.firstName} ${w.lastName}`}
                  />
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </tbody>
        )}
      </AdminTable>
    </div>
  )
}
