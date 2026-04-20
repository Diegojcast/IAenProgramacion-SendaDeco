import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminGetOrderById } from "@/lib/repositories/admin/orders"
import { adminGetWorkers } from "@/lib/repositories/admin/workers"
import { getScheduledTasksForOrder, groupScheduledTasks } from "@/lib/repositories/scheduled-tasks"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusUpdater } from "@/components/admin/orders/order-status-updater"
import { OrderWorkers } from "@/components/admin/orders/order-workers"
import { ScheduleOrderButton } from "@/components/admin/orders/schedule-order-button"
import { formatPrice } from "@/lib/format"

type Props = { params: Promise<{ id: string }> }

const DELIVERY_LABELS: Record<string, string> = {
  envio: "Envío a domicilio",
  retiro: "Retiro en persona",
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const [order, allWorkers, scheduledTasks] = await Promise.all([
    adminGetOrderById(id),
    adminGetWorkers(),
    getScheduledTasksForOrder(id),
  ])
  if (!order) notFound()

  return (
    <div className="max-w-2xl">
      {/* Back + header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/admin/orders">
            <ArrowLeft size={14} className="mr-1" />
            Volver a pedidos
          </Link>
        </Button>
        <AdminPageHeader
          title={`Pedido #${order.id.slice(0, 8)}…`}
          description={`Creado el ${new Date(order.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}`}
        />
      </div>

      <div className="space-y-5">
        {/* ── Section 1: Order info ─────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Información del pedido
          </p>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
            <span className="text-muted-foreground">ID</span>
            <span className="font-mono text-xs">#{order.id}</span>

            <span className="text-muted-foreground">Estado</span>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

            <span className="text-muted-foreground">Tiempo de entrega</span>
            <span>{order.deliveryTime} días hábiles</span>
          </div>
        </div>

        {/* ── Section 2: Customer info ──────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Datos del cliente
          </p>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
            <span className="text-muted-foreground">Nombre</span>
            <span>{order.nombre}</span>

            <span className="text-muted-foreground">Email</span>
            <a href={`mailto:${order.email}`} className="text-primary hover:underline">
              {order.email}
            </a>

            <span className="text-muted-foreground">Teléfono</span>
            <span>{order.telefono}</span>

            <span className="text-muted-foreground">Método de entrega</span>
            <span>{DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</span>

            <span className="text-muted-foreground">Método de pago</span>
            <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>

            {order.calle && (
              <>
                <span className="text-muted-foreground">Dirección</span>
                <span>
                  {order.calle}
                  {order.ciudad && `, ${order.ciudad}`}
                  {order.codigoPostal && ` (${order.codigoPostal})`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Section 3 + 4: Products table + total ────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Productos
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-muted-foreground">Producto</th>
                <th className="pb-2 font-medium text-muted-foreground text-center w-20">Cant.</th>
                <th className="pb-2 font-medium text-muted-foreground text-right w-28">Precio u.</th>
                <th className="pb-2 font-medium text-muted-foreground text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="font-medium">{item.productName}</p>
                    {item.color && (
                      <p className="text-xs text-muted-foreground mt-0.5">Color: {item.color}</p>
                    )}
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="py-3 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator />

          <div className="flex justify-between items-center font-medium">
            <span>Total</span>
            <span className="text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
        {/* ── Section 4: Worker assignment ──────────────────────────────── */}
        <OrderWorkers
          orderId={order.id}
          status={order.status}
          allWorkers={allWorkers}
          assignedWorkerIds={order.workers?.map((w) => w.id) ?? []}
        />

        {/* ── Section 5: Scheduling ─────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Agenda de producción
            </p>
            <ScheduleOrderButton
              orderId={order.id}
              hasWorkers={(order.workers?.length ?? 0) > 0}
            />
          </div>

          {scheduledTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no se generó la agenda para este pedido. Hacé clic en «Generar agenda» para
              programar las tareas según la disponibilidad de los operarios.
            </p>
          ) : (
            <div className="space-y-2">
              {groupScheduledTasks(scheduledTasks).map((t) => (
                <div
                  key={t.ids[0]}
                  className={`flex items-center gap-3 text-sm py-2 px-3 rounded-lg border ${
                    t.completed
                      ? "bg-muted/40 border-border/50 text-muted-foreground"
                      : "bg-card border-border"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.completed ? "bg-emerald-500" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span className="flex-1 font-medium truncate">{t.orderStep.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(t.date).toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {t.hoursAssigned % 1 === 0 ? t.hoursAssigned : t.hoursAssigned.toFixed(1)} hs
                  </span>
                  {t.worker && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {t.worker.firstName} {t.worker.lastName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

