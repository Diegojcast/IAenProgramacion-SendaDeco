import { adminGetColors } from "@/lib/repositories/admin/colors"
import { ColorsList } from "@/components/admin/colors/colors-list"

export const metadata = { title: "Colores | Admin" }

export default async function AdminColorsPage() {
  const colors = await adminGetColors()
  return <ColorsList colors={colors} />
}
