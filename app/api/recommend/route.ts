import { NextRequest, NextResponse } from "next/server"
import { getSimilarityScores } from "@/lib/ai/embeddings"
import { adminGetProducts } from "@/lib/repositories/admin/products"

export const dynamic = "force-dynamic"

const TOP_N = 3
const MIN_SCORE = 0.30

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

function generateReason(query: string, score: number): string {
  const q = query.toLowerCase()
  const pct = (score * 100).toFixed(0)

  // 🎯 detecciones
  const isModern =
    /moderno|moderna|contempor[aá]neo|minimalista|actual/.test(q)
  const isExterior =
    /jard[ií]n|terraza|exterior|patio|balc[oó]n|aire libre/.test(q)
  const isInterior =
    /interior|living|casa|hogar|decoraci[oó]n/.test(q)
  const isGift =
    /regalo|obsequio|detalle|sorpresa/.test(q)
  const isWarm =
    /c[aá]lido|hogare[nñ]o|acogedor/.test(q)
  const isRustic =
    /r[uú]stico|natural|artesanal/.test(q)

  // 🎲 helpers para variedad
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const intros = [
    "Lo elegimos porque",
    "Te lo recomendamos porque",
    "Este producto encaja bien porque",
    "Puede ser una gran opción porque",
  ]

  const closings = [
    `(${pct}% de afinidad)`,
    `con un ${pct}% de coincidencia`,
    `y coincide en un ${pct}% con tu búsqueda`,
  ]

  const reasons: string[] = []

  if (isModern) reasons.push("tiene un estilo moderno y actual")
  if (isExterior) reasons.push("funciona muy bien en espacios exteriores")
  if (isInterior) reasons.push("encaja perfecto en interiores")
  if (isGift) reasons.push("es ideal para regalar")
  if (isWarm) reasons.push("aporta una sensación cálida y acogedora")
  if (isRustic) reasons.push("tiene un carácter artesanal y natural")

  // 🎯 fallback más natural
  if (reasons.length === 0) {
    return pick([
      `Este producto se alinea con lo que estás buscando ${closings[0]}.`,
      `Creemos que puede gustarte según tu búsqueda ${closings[1]}.`,
      `Es una buena coincidencia con lo que describiste ${closings[2]}.`,
    ])
  }

  // 🎯 construir frase variada
  const intro = pick(intros)
  const closing = pick(closings)

  return `${intro} ${reasons.join(" y ")} ${closing}.`
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.query !== "string" || body.query.trim() === "") {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const query: string = body.query.trim()

  try {
    const products = await adminGetProducts()

    const productTexts = products.map((p) =>
      [p.name, p.description, p.metadataText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .trim()
    )
    const rawScores = await getSimilarityScores(query, productTexts)

    const scored = products.map((product, i) => {
      const base = rawScores[i]
      const productText = productTexts[i]
      const score = adjustScore(base, query, productText)
      console.log(product.name, score)
      return { product, score }
    })

    const results = scored
      .filter(({ score }) => score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map(({ product, score }) => ({ product, score, reason: generateReason(query, score) }))

    return NextResponse.json({ results })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : String(error)
    console.error("[recommend] Error generating recommendations:", message)
    return NextResponse.json(
      { error: "Failed to generate recommendations", detail: message },
      { status: 500 }
    )
  }
}
