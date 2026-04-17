import { getProducts } from "@/lib/repositories/products"
import { ProductCard } from "@/components/product-card"

export async function FeaturedProducts() {
  const allProducts = await getProducts()
  // Show products explicitly flagged as featured, fallback to first 4
  const featured = allProducts.filter((p) => p.featured)
  const featuredProducts = featured.length > 0 ? featured.slice(0, 8) : allProducts.slice(0, 4)

  return (
    <section className="py-20 md:py-28 bg-secondary/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Selección
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Piezas destacadas
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 lg:gap-10">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
