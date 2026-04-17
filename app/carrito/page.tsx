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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-10 md:mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Tu selección
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Carrito
          </h1>
        </div>
        <CartContent />
      </main>
      <Footer />
    </div>
  )
}
