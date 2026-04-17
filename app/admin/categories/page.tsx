import { adminGetCategories } from "@/lib/repositories/admin/categories"
import { CategoriesList } from "@/components/admin/categories/categories-list"

export const metadata = { title: "Categorías | Admin" }

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories()
  return <CategoriesList categories={categories} />
}
