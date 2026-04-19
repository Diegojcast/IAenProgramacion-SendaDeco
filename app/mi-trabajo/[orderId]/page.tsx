import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminGetOrderById } from "@/lib/repositories/admin/orders"
import { OrderStepList } from "@/components/worker/order-step-list"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { Separator } from "@/components/ui/separator"

const DELIVERY_LABELS: Record<string, string> = {
  envio: "Envío a domicilio",
  retiro: "Retiro en persona",
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_produccion: "En producción",
  listo: "Listo",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

export default async function MiTrabajoOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  // @ts-expect-error – extended session
  const role = session?.user?.role as string | undefined
  const isAdmin = role === "admin"

  const { orderId } = await params
  const order = await adminGetOrderById(orderId)
  if (!order) notFound()

  const steps = order.orderSteps ?? []
  const canEdit = order.status === "en_produccion"

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8 px-4">
      {/* Back link */}
      <Link
        href="/mi-trabajo"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} />
        Volver a mis pedidos
      </Link>

      {/* Order header */}
      <div>
        <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}…</p>
        <h1 className="text-xl font-semibold mt-0.5">{order.nombre}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          <span>
            {new Date(order.createdAt).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>{DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Productos</p>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}× {item.productName}
              {item.color ? ` (${item.color})` : ""}
            </span>
            {/* Price hidden for workers */}
            {isAdmin && (
              <span className="font-medium tabular-nums">
                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.price * item.quantity)}
              </span>
            )}
          </div>
        ))}
        {isAdmin && (
          <>
            <Separator className="my-1" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(order.total)}</span>
            </div>
          </>
        )}
      </div>

      {/* Production steps */}
      {steps.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pasos de producción
          </p>
          <OrderStepList
            orderId={order.id}
            initialSteps={steps}
            units={order.items.flatMap((item) =>
              (item.units ?? []).map((u) => ({
                id: u.id,
                unitIndex: u.unitIndex,
                productName: item.productName,
                color: item.color,
                totalUnits: item.quantity,
              }))
            )}
            canEdit={canEdit}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Este pedido no tiene pasos de producción definidos.
        </div>
      )}
    </div>
  )
}
