import { products } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function FeaturedProducts() {
  const featuredProducts = products.slice(0, 4)

  return (
    <section className="py-16 px-4 bg-card">
      <div className="container">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
