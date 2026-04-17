import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { getProducts } from "@/lib/repositories/products"
import { getCategories } from "@/lib/repositories/categories"
import { getColors } from "@/lib/repositories/colors"

export const metadata = {
  title: "Productos | Senda Deco",
  description: "Explora nuestra colección de decoración artesanal hecha a mano",
}

export default async function ProductosPage() {
  const [products, categories, colors] = await Promise.all([
    getProducts(),
    getCategories(),
    getColors(),
  ])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="mb-8 md:mb-16 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Tienda
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Productos
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          <aside className="w-full md:w-56 lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="h-32 bg-muted rounded-lg animate-pulse" />}>
              <ProductFilters categories={categories} colors={colors} />
            </Suspense>
          </aside>
          <div className="flex-1 min-w-0">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={products} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-square bg-muted rounded-xl animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  )
}
