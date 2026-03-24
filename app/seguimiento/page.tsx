import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderTracking } from "@/components/order/order-tracking"

export const metadata = {
  title: "Seguimiento de Pedido | Senda Deco",
  description: "Sigue el estado de tu pedido en Senda Deco",
}

export default function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Seguimiento de pedido
        </h1>
        <OrderTracking />
      </main>
      <Footer />
    </div>
  )
}
