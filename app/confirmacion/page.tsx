import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderConfirmation } from "@/components/order/order-confirmation"

export const metadata = {
  title: "Confirmación de Pedido | Senda Deco",
  description: "Gracias por tu compra en Senda Deco",
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-lg">
          <OrderConfirmation orderId={orderId} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
