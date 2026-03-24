import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart/cart-content"

export const metadata = {
  title: "Carrito | Senda Deco",
  description: "Tu carrito de compras en Senda Deco",
}

export default function CarritoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Carrito
        </h1>
        <CartContent />
      </main>
      <Footer />
    </div>
  )
}
