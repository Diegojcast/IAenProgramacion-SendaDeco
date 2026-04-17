import { adminGetProducts } from "@/lib/repositories/admin/products"
import { ProductsList } from "@/components/admin/products/products-list"

export const metadata = { title: "Productos | Admin" }

export default async function AdminProductsPage() {
  const products = await adminGetProducts()
  return <ProductsList products={products} />
}
