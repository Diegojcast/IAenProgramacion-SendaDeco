"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/types"
import type { AdminProduct } from "@/lib/repositories/admin/products"

interface RecommendationResult {
  product: AdminProduct
  score: number
  reason: string
}

interface GiftRecommendationProps {
  products: Product[]
}

export function GiftRecommendation({ products: _ }: GiftRecommendationProps) {
  const [query, setQuery] = useState("")
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSuggest = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      setRecommendations(data.results ?? [])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section className="py-20 md:py-28 pb-10 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/50 bg-card/80 p-10 md:p-16 shadow-sm shadow-foreground/[0.03] text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Gift className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
              Ideas para regalar
            </h2>
          </div>
          <p className="text-muted-foreground mb-3 mx-auto max-w-lg leading-relaxed">
            Contanos para quién es el regalo y te sugerimos piezas de la colección.
          </p>
          <p className="text-xs text-muted-foreground/60 mb-10 animate-in fade-in duration-700">
            ✨ Recomendaciones inteligentes basadas en IA
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto justify-center items-stretch sm:items-center">
            <Input
              placeholder="Ej.: mamá, amiga, casa nueva…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
              className="flex-1 h-12 rounded-full border-border/70 bg-background px-5 text-center sm:text-left"
            />
            <Button 
              onClick={handleSuggest}
              disabled={isSearching || !query.trim()}
              className="h-12 px-8 shrink-0 mx-auto sm:mx-0"
            >
              {isSearching ? "Buscando..." : "Sugerir"}
            </Button>
          </div>

          {recommendations.length > 0 && (
            <div className="mt-14">
              <p className="text-xs text-muted-foreground/70 mb-3 tracking-wide">
                ✨ Recomendaciones generadas con IA
              </p>
              <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-8">
                Te recomendamos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto justify-items-center">
                {recommendations.map(({ product, reason }) => {
                  const firstImage = product.images[0]
                  return (
                    <Link
                      key={product.id}
                      href={`/producto/${product.id}`}
                      className="group block w-full"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
                        {firstImage ? (
                          <Image
                            src={`/api/images/product/${product.id}/${firstImage.id}`}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="mt-5 space-y-2 px-0.5">
                        <h3 className="text-sm font-normal text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed pt-1">
                          <span className="font-medium text-muted-foreground/80">💡 Por qué te lo recomendamos</span>
                          <br />
                          {reason}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {!isSearching && recommendations.length === 0 && query.trim() !== "" && (
            <p className="mt-10 text-sm text-muted-foreground">
              No encontramos recomendaciones
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
