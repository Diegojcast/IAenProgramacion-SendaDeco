"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { WorkerOrderStatus } from "@/components/worker/worker-order-status"
import { formatPrice } from "@/lib/format"
import { Package, ChevronRight } from "lucide-react"
import type { AdminOrder } from "@/lib/repositories/admin/orders"

const DELIVERY_LABELS: Record<string, string> = {
  envio: "Envío a domicilio",
  retiro: "Retiro en persona",
}

interface WorkerOption {
  id: string
  firstName: string
  lastName: string
}

interface MiTrabajoOrdersProps {
  /** The worker whose orders are shown by default (null = admin without a worker record) */
  defaultWorkerId: string | null
  /** Pre-fetched orders for the default worker */
  initialOrders: AdminOrder[]
  /** Only present for admins */
  allWorkers?: WorkerOption[]
  /** All orders keyed by workerId — pre-fetched server-side for admins */
  workerOrdersMap?: Record<string, AdminOrder[]>
  /** Whether the current user is an admin */
  isAdmin?: boolean
}

function OrderList({ orders, showPrice }: { orders: AdminOrder[]; showPrice: boolean }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-3 text-muted-foreground">
        <Package size={36} className="opacity-30" />
        <p className="text-sm">No hay pedidos asignados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}…</p>
              <p className="text-sm font-medium mt-0.5">{order.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
              </p>
            </div>
            {showPrice && (
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}× {item.productName}
                  {item.color ? ` (${item.color})` : ""}
                </span>
                {showPrice && <span>{formatPrice(item.price * item.quantity)}</span>}
              </div>
            ))}
          </div>

          {/* Status + detail link */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Estado:</span>
              <WorkerOrderStatus orderId={order.id} currentStatus={order.status} />
            </div>
            <Link
              href={`/mi-trabajo/${order.id}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver detalle
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MiTrabajoOrders({
  defaultWorkerId,
  initialOrders,
  allWorkers,
  workerOrdersMap,
  isAdmin,
}: MiTrabajoOrdersProps) {
  const [selectedId, setSelectedId] = useState<string | null>(defaultWorkerId)

  const orders = selectedId
    ? (workerOrdersMap?.[selectedId] ?? (selectedId === defaultWorkerId ? initialOrders : []))
    : initialOrders

  const orderCount = orders.length

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Volver al panel admin
        </Link>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Mi trabajo</h1>
          <p className="text-sm text-muted-foreground">
            {orderCount === 0
              ? "No hay pedidos asignados."
              : `${orderCount} pedido${orderCount !== 1 ? "s" : ""} activo${orderCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Worker selector — admin only */}
        {isAdmin && allWorkers && allWorkers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allWorkers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedId(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedId === w.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {w.firstName} {w.lastName}
              </button>
            ))}
          </div>
        )}
      </div>

      <OrderList orders={orders} showPrice={!!isAdmin} />
    </div>
  )
}
