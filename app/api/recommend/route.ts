import { NextRequest, NextResponse } from "next/server"
import { getEmbedding } from "@/lib/ai/embeddings"
import { cosineSimilarity } from "@/lib/ai/similarity"
import { adminGetProducts } from "@/lib/repositories/admin/products"

export const dynamic = "force-dynamic"

const TOP_N = 5

function generateReason(query: string): string {
  const q = query.toLowerCase()

  const isModern =
    /moderno|moderna|contempor[aá]neo|contempor[aá]nea|minimalista|actual/.test(q)
  const isExterior =
    /jard[ií]n|terraza|exterior|afuera|patio|balc[oó]n/.test(q)
  const isGift =
    /regalo|obsequio|detalle|present[ae]|sorpresa/.test(q)

  const parts: string[] = []

  if (isModern) parts.push("coincide con un estilo moderno")
  if (isExterior) parts.push("es ideal para espacios exteriores")
  if (isGift) parts.push("es una excelente opción como regalo")

  if (parts.length === 0) {
    return "Este producto fue recomendado porque se ajusta a tu búsqueda."
  }

  return `Este producto fue recomendado porque ${parts.join(" y ")}.`
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.query !== "string" || body.query.trim() === "") {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const query: string = body.query.trim()

  try {
    const [queryEmbedding, products] = await Promise.all([
      getEmbedding(query),
      adminGetProducts(),
    ])

    const scored = await Promise.all(
      products.map(async (product) => {
        const text = [product.name, product.description, product.metadataText]
          .filter(Boolean)
          .join(" ")
        const embedding = await getEmbedding(text)
        return { product, score: cosineSimilarity(queryEmbedding, embedding) }
      })
    )

    const reason = generateReason(query)

    const results = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map(({ product, score }) => ({ product, score, reason }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[recommend] Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}
