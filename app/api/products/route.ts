import { NextResponse } from "next/server"
import { products } from "@/data/products"

/**
 * GET /api/products — catálogo mock (misma fuente que la UI).
 * Listo para sustituir por DB sin cambiar el contrato JSON.
 */
export async function GET() {
  return NextResponse.json({ products })
}
