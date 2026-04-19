"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Badge } from "@/components/ui/badge"
import {
  AdminTable,
  AdminTableHead,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminSearch,
} from "@/components/admin/admin-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminOrder } from "@/lib/repositories/admin/orders"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/order-status-badge"

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_produccion", label: "En producción" },
  { value: "listo", label: "Listo" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
]

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

export function OrdersList({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = orders.filter((o) => {
    const matchQuery = o.nombre.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toLowerCase().includes(query.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    const isUnassigned = !o.workers || o.workers.length === 0
    const matchAssignment = !onlyUnassigned || isUnassigned
    return matchQuery && matchStatus && matchAssignment
  })

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setUpdatingId(null)
    router.refresh()
  }

  return (
    <div>
      <AdminPageHeader title="Pedidos" description={`${orders.length} pedidos`} />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar por nombre o ID..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={onlyUnassigned}
            onCheckedChange={(v) => setOnlyUnassigned(!!v)}
          />
          Solo sin asignar
        </label>
      </div>

      <AdminTable>
        <AdminTableHead columns={["ID", "Cliente", "Total", "Entrega", "Estado", "Asignación", "Fecha", ""]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay pedidos" />
        ) : (
          <tbody>
            {filtered.map((o) => {
              const isUnassigned = !o.workers || o.workers.length === 0
              return (
              <AdminTableRow key={o.id} className={cn(isUnassigned && "bg-red-50 dark:bg-red-950/20")}>
                <AdminTableCell>
                  <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}…</span>
                </AdminTableCell>
                <AdminTableCell>
                  <div>
                    <p className="font-medium text-sm">{o.nombre}</p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>{formatPrice(o.total)}</AdminTableCell>
                <AdminTableCell muted>{o.deliveryTime} días</AdminTableCell>
                <AdminTableCell>
                  <Select
                    value={o.status}
                    onValueChange={(v) => updateStatus(o.id, v)}
                    disabled={updatingId === o.id}
                  >
                    <SelectTrigger className="h-7 text-xs border-none shadow-none p-0 w-auto gap-1 [&>svg]:h-3 [&>svg]:w-3">
                      <OrderStatusBadge status={o.status} className="cursor-pointer" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </AdminTableCell>
                <AdminTableCell>
                  {isUnassigned ? (
                    <Badge variant="destructive" className="text-xs font-normal">
                      Sin asignar
                    </Badge>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="default" className="text-xs font-normal bg-green-600 hover:bg-green-600 w-fit">
                        Asignado
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {o.workers!.map((w) => w.firstName).join(", ")}
                      </span>
                    </div>
                  )}
                </AdminTableCell>
                <AdminTableCell muted className="text-xs">
                  {new Date(o.createdAt).toLocaleDateString("es-AR")}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Eye size={14} />
                  </Link>
                </AdminTableCell>
              </AdminTableRow>
              )
            })}
          </tbody>
        )}
      </AdminTable>
    </div>
  )
}
