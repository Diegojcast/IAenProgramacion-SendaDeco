import { Header } from "@/components/header"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { GiftRecommendation } from "@/components/home/gift-recommendation"
import { Footer } from "@/components/footer"
import { getProducts } from "@/lib/repositories/products"

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GiftRecommendation products={products} />
        <CategoriesSection />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  )
}
