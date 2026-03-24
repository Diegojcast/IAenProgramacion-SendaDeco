import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderConfirmation } from "@/components/order/order-confirmation"

export const metadata = {
  title: "Confirmación de Pedido | Senda Deco",
  description: "Gracias por tu compra en Senda Deco",
}

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <OrderConfirmation />
      </main>
      <Footer />
    </div>
  )
}
