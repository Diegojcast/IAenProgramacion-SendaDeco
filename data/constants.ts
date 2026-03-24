import type { ProductCategory, ProductColorId } from "@/types"

export const categories: { id: ProductCategory; name: string; image: string }[] = [
  {
    id: "macrame",
    name: "Macramé",
    image: "https://images.unsplash.com/photo-1622227056993-6e7f88420855?w=300&h=300&fit=crop",
  },
  {
    id: "cemento",
    name: "Cemento",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop",
  },
  {
    id: "velas",
    name: "Velas",
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=300&h=300&fit=crop",
  },
]

/** Metadatos de swatches para selector de variantes (UI) */
export const colorOptions: { id: ProductColorId; name: string; hex: string }[] = [
  { id: "crudo", name: "Crudo", hex: "#F5F0E6" },
  { id: "gris", name: "Gris", hex: "#9CA3AF" },
  { id: "beige", name: "Beige", hex: "#D4C4B0" },
  { id: "terracota", name: "Terracota", hex: "#C67B5C" },
]
