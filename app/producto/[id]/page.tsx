import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product/product-detail"
import { products } from "@/lib/data"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  
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
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 md:py-20 px-5 md:px-8">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  )
}
