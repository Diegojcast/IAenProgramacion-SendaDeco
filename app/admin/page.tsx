import { adminGetDashboardMetrics, adminGetOrders } from "@/lib/repositories/admin/orders"
import { StatCard, AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminTable,
  AdminTableHead,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
} from "@/components/admin/admin-table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatPrice } from "@/lib/format"

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_produccion: "En producción",
  listo: "Listo",
  enviado: "Enviado",
  entregado: "Entregado",
}

export default async function AdminHomePage() {
  const [metrics, orders] = await Promise.all([
    adminGetDashboardMetrics(),
    adminGetOrders(),
  ])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Dashboard" description="Resumen del negocio" />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Productos activos" value={metrics.totalProducts} />
        <StatCard label="Pedidos pendientes" value={metrics.pendingOrders} description="Sin procesar" />
        <StatCard label="Materiales bajos" value={metrics.lowStockMaterials} description="Stock < 5" />
        <StatCard label="Pedidos totales" value={metrics.totalOrders} />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest text-[11px]">
            Últimos pedidos
          </h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <AdminTable>
          <AdminTableHead columns={["ID", "Cliente", "Total", "Estado", "Fecha"]} />
          {recentOrders.length === 0 ? (
            <AdminTableEmpty label="No hay pedidos aún" />
          ) : (
            <tbody>
              {recentOrders.map((o) => (
                <AdminTableRow key={o.id}>
                  <AdminTableCell>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-primary hover:underline">
                      {o.id.slice(0, 8)}…
                    </Link>
                  </AdminTableCell>
                  <AdminTableCell>{o.nombre}</AdminTableCell>
                  <AdminTableCell>{formatPrice(o.total)}</AdminTableCell>
                  <AdminTableCell>
                    <Badge variant="outline" className="text-xs">
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell muted className="text-xs">
                    {new Date(o.createdAt).toLocaleDateString("es-AR")}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          )}
        </AdminTable>
      </div>
    </div>
  )
}
