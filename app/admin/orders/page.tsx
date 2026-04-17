import { adminGetOrders } from "@/lib/repositories/admin/orders"
import { OrdersList } from "@/components/admin/orders/orders-list"

export const metadata = { title: "Pedidos | Admin" }

export default async function AdminOrdersPage() {
  const orders = await adminGetOrders()
  return <OrdersList orders={orders} />
}
