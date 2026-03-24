import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata = {
  title: "Checkout | Senda Deco",
  description: "Completa tu compra en Senda Deco",
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Datos de envío y pago
        </h1>
        <CheckoutForm />
      </main>
      <Footer />
    </div>
  )
}
