import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderTracking } from "@/components/order/order-tracking"

export const metadata = {
  title: "Seguimiento de Pedido | Senda Deco",
  description: "Sigue el estado de tu pedido en Senda Deco",
}

export default function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex flex-1 justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8 text-center">
            Seguimiento de pedido
          </h1>
          <Suspense>
            <OrderTracking />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
