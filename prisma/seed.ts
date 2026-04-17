/**
 * Prisma seed â€” populates the database with initial Senda Deco data.
 * Run with: npx prisma db seed
 *
 * Times (production_time, drying_time) are in HOURS (float).
 * Stock is per color variant, managed via ProductColor.stock.
 * Products can have multiple categories via ProductCategory junction.
 */

import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("ðŸŒ±  Seeding...")

  // â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "macrame" },
      update: {},
      create: { name: "MacramÃ©", slug: "macrame", image: "https://images.unsplash.com/photo-1622227056993-6e7f88420855?w=300&h=300&fit=crop" },
    }),
    prisma.category.upsert({
      where: { slug: "cemento" },
      update: {},
      create: { name: "Cemento", slug: "cemento", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=300&fit=crop" },
    }),
    prisma.category.upsert({
      where: { slug: "velas" },
      update: {},
      create: { name: "Velas", slug: "velas", image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=300&h=300&fit=crop" },
    }),
  ])
  console.log(`  âœ“ ${categories.length} categories`)

  // â”€â”€ Colors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const colors = await Promise.all([
    prisma.color.upsert({ where: { slug: "crudo" }, update: {}, create: { name: "Crudo", slug: "crudo", hex: "#F5F0E6" } }),
    prisma.color.upsert({ where: { slug: "gris" }, update: {}, create: { name: "Gris", slug: "gris", hex: "#9CA3AF" } }),
    prisma.color.upsert({ where: { slug: "beige" }, update: {}, create: { name: "Beige", slug: "beige", hex: "#D4C4B0" } }),
    prisma.color.upsert({ where: { slug: "terracota" }, update: {}, create: { name: "Terracota", slug: "terracota", hex: "#C67B5C" } }),
  ])
  console.log(`  âœ“ ${colors.length} colors`)

  const colorMap = Object.fromEntries(colors.map((c) => [c.slug, c.id]))
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  // â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // production_time + drying_time in HOURS
  // colorVariants: { slug, stock } â€” per-color stock
  // categorySlugs: string[] â€” can belong to multiple categories
  type ProductSeed = {
    id: string
    name: string
    price: number
    categorySlugs: string[]
    colorVariants: { slug: string; stock: number }[]
    production_time: number
    drying_time: number
    description: string
  }

  const productData: ProductSeed[] = [
    {
      id: "1", name: "MacramÃ© Wall Hanging", price: 3200,
      categorySlugs: ["macrame"],
      colorVariants: [{ slug: "crudo", stock: 3 }, { slug: "beige", stock: 0 }],
      production_time: 120, drying_time: 0,
      description: "Hermoso colgante de pared tejido a mano con algodÃ³n natural.",
    },
    {
      id: "2", name: "Cerando Cemento", price: 3500,
      categorySlugs: ["cemento"],
      colorVariants: [{ slug: "gris", stock: 5 }, { slug: "beige", stock: 2 }, { slug: "terracota", stock: 0 }],
      production_time: 72, drying_time: 48,
      description: "Maceta de cemento artesanal con acabado suave.",
    },
    {
      id: "3", name: "Cerando Planstor", price: 3200,
      categorySlugs: ["cemento"],
      colorVariants: [{ slug: "beige", stock: 0 }, { slug: "gris", stock: 0 }],
      production_time: 72, drying_time: 48,
      description: "Macetero de cemento con diseÃ±o minimalista.",
    },
    {
      id: "4", name: "Velitas Tejidos", price: 3200,
      categorySlugs: ["velas"],
      colorVariants: [{ slug: "crudo", stock: 10 }, { slug: "beige", stock: 4 }],
      production_time: 48, drying_time: 24,
      description: "Set de velas aromÃ¡ticas de soja con aroma a vainilla.",
    },
    {
      id: "5", name: "Espejo Tejido Luna", price: 3200,
      categorySlugs: ["macrame"],
      colorVariants: [{ slug: "crudo", stock: 2 }],
      production_time: 96, drying_time: 0,
      description: "Espejo decorativo con marco de macramÃ© tejido a mano.",
    },
    {
      id: "6", name: "Cemento Textura", price: 3200,
      categorySlugs: ["cemento"],
      colorVariants: [{ slug: "terracota", stock: 0 }, { slug: "gris", stock: 0 }],
      production_time: 96, drying_time: 72,
      description: "Maceta con textura especial y acabado terracota.",
    },
    {
      id: "7", name: "Velmes Tejidos", price: 3200,
      categorySlugs: ["velas"],
      colorVariants: [{ slug: "beige", stock: 8 }, { slug: "crudo", stock: 3 }],
      production_time: 48, drying_time: 24,
      description: "Velas decorativas en tonos neutros.",
    },
    {
      id: "10", name: "Vela Soja Lavanda", price: 2400,
      categorySlugs: ["velas"],
      colorVariants: [{ slug: "crudo", stock: 12 }, { slug: "beige", stock: 6 }],
      production_time: 48, drying_time: 24,
      description: "Vela de soja con aroma a lavanda.",
    },
    {
      id: "11", name: "Florero Cemento", price: 1800,
      categorySlugs: ["cemento"],
      colorVariants: [{ slug: "gris", stock: 7 }, { slug: "terracota", stock: 2 }],
      production_time: 72, drying_time: 48,
      description: "Florero de cemento con diseÃ±o moderno y minimalista.",
    },
    {
      id: "12", name: "Espejos Tejidos", price: 3200,
      categorySlugs: ["macrame"],
      colorVariants: [{ slug: "crudo", stock: 1 }, { slug: "beige", stock: 0 }],
      production_time: 120, drying_time: 0,
      description: "Set de espejos con marco de macramÃ©.",
    },
    {
      id: "13", name: "Florero Cemento Textura", price: 1800,
      categorySlugs: ["cemento"],
      colorVariants: [{ slug: "terracota", stock: 0 }, { slug: "gris", stock: 0 }],
      production_time: 96, drying_time: 72,
      description: "Florero de cemento con textura Ãºnica y acabado terracota.",
    },
  ]

  for (const p of productData) {
    // Upsert base product (no categories/colors â€” managed separately)
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        price: p.price,
        production_time: p.production_time,
        drying_time: p.drying_time,
        description: p.description,
        active: true,
      },
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        production_time: p.production_time,
        drying_time: p.drying_time,
        description: p.description,
        active: true,
      },
    })

    // Replace category junctions
    await prisma.productCategory.deleteMany({ where: { productId: p.id } })
    await prisma.productCategory.createMany({
      data: p.categorySlugs.map((slug) => ({ productId: p.id, categoryId: catMap[slug] })),
    })

    // Replace color/stock junctions
    await prisma.productColor.deleteMany({ where: { productId: p.id } })
    await prisma.productColor.createMany({
      data: p.colorVariants.map(({ slug, stock }) => ({
        productId: p.id,
        colorId: colorMap[slug],
        stock,
      })),
    })
  }
  console.log(`  âœ“ ${productData.length} products`)

  console.log("âœ…  Seed complete.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
