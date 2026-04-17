import { adminGetCategories } from "@/lib/repositories/admin/categories"
import { adminGetColors } from "@/lib/repositories/admin/colors"
import { adminGetMaterials } from "@/lib/repositories/admin/materials"
import { ProductForm } from "@/components/admin/products/product-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const metadata = { title: "Nuevo producto | Admin" }

export default async function NewProductPage() {
  const [categories, colors, materials] = await Promise.all([
    adminGetCategories(),
    adminGetColors(),
    adminGetMaterials(),
  ])

  return (
    <div>
      <AdminPageHeader title="Nuevo producto" />
      <ProductForm categories={categories} colors={colors} materials={materials} />
    </div>
  )
}
