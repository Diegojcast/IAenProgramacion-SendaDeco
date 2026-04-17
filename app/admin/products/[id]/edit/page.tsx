import { notFound } from "next/navigation"
import { adminGetProductById } from "@/lib/repositories/admin/products"
import { adminGetCategories } from "@/lib/repositories/admin/categories"
import { adminGetColors } from "@/lib/repositories/admin/colors"
import { adminGetMaterials } from "@/lib/repositories/admin/materials"
import { ProductForm } from "@/components/admin/products/product-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories, colors, materials] = await Promise.all([
    adminGetProductById(id),
    adminGetCategories(),
    adminGetColors(),
    adminGetMaterials(),
  ])

  if (!product) notFound()

  return (
    <div>
      <AdminPageHeader title={`Editar: ${product.name}`} />
      <ProductForm product={product} categories={categories} colors={colors} materials={materials} />
    </div>
  )
}
