import { products } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function FeaturedProducts() {
  const featuredProducts = products.slice(0, 4)

  return (
    <section className="py-20 md:py-28 px-5 md:px-8 bg-secondary/25">
      <div className="container">
        <div className="mb-12 md:mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Selección
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Piezas destacadas
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
