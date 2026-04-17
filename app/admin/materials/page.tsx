import { adminGetMaterials } from "@/lib/repositories/admin/materials"
import { MaterialsList } from "@/components/admin/materials/materials-list"

export const metadata = { title: "Materiales | Admin" }

export default async function AdminMaterialsPage() {
  const materials = await adminGetMaterials()
  return <MaterialsList materials={materials} />
}
