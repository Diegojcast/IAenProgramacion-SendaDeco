import { NextRequest, NextResponse } from "next/server"
import { getEmbedding, getEmbeddings } from "@/lib/ai/embeddings"
import { cosineSimilarity } from "@/lib/ai/similarity"
import { adminGetProducts } from "@/lib/repositories/admin/products"

export const dynamic = "force-dynamic"

const TOP_N = 3
const MIN_SCORE = 0.63

const BOOST_EXTERIOR = 0.10
const PENALTY_INTERIOR = 0.08

function adjustScore(baseScore: number, query: string, productText: string): number {
  const q = query.toLowerCase()
  const p = productText.toLowerCase()

  const queryIsExterior = /exterior|jard[ií]n|terraza|patio|balc[oó]n|afuera/.test(q)

  let score = baseScore

  if (queryIsExterior) {
    if (/exterior|jard[ií]n|terraza/.test(p)) {
      score += BOOST_EXTERIOR
    }
    if (/interior/.test(p)) {
      score -= PENALTY_INTERIOR
    }
  }

  return Math.min(1, Math.max(0, score))
}

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

    const productTexts = products.map((p) =>
      [p.name, p.description, p.metadataText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .trim()
    )
    const productEmbeddings = await getEmbeddings(productTexts)

    const scored = products.map((product, i) => {
      const base = cosineSimilarity(queryEmbedding, productEmbeddings[i])
      const productText = productTexts[i]
      const score = adjustScore(base, query, productText)
      console.log(product.name, score)
      return { product, score }
    })

    const reason = generateReason(query)

    const results = scored
      .filter(({ score }) => score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map(({ product, score }) => ({ product, score, reason }))

    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[recommend] Error generating recommendations:", message)
    return NextResponse.json(
      { error: "Failed to generate recommendations", detail: message },
      { status: 500 }
    )
  }
}
