import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product/product-detail"
import { getProductById } from "@/lib/repositories/products"
import { getColors } from "@/lib/repositories/colors"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  
  if (!product) {
    return { title: "Producto no encontrado | Senda Deco" }
  }

  return {
    title: `${product.name} | Senda Deco`,
    description: product.description,
  }
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params
  const [product, colorOptions] = await Promise.all([
    getProductById(id),
    getColors(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <ProductDetail product={product} colorOptions={colorOptions} />
      </main>
      <Footer />
    </div>
  )
}
