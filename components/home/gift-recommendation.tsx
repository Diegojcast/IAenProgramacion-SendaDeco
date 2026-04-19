"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/types"
import { ProductCard } from "@/components/product-card"

interface GiftRecommendationProps {
  products: Product[]
}

export function GiftRecommendation({ products }: GiftRecommendationProps) {
  const [query, setQuery] = useState("")
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSuggest = () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    // Mock AI recommendation - in real app would call an API
    setTimeout(() => {
      const queryLower = query.toLowerCase()
      let suggested: Product[] = []

      if (queryLower.includes("mama") || queryLower.includes("mamá") || queryLower.includes("madre")) {
        suggested = products.filter(p => 
          p.categories.includes("velas") || p.categories.includes("macrame")
        ).slice(0, 3)
      } else if (queryLower.includes("amig") || queryLower.includes("novia")) {
        suggested = products.filter(p => 
          p.categories.includes("velas") || p.categories.includes("macrame")
        ).slice(0, 3)
      } else if (queryLower.includes("casa") || queryLower.includes("hogar") || queryLower.includes("departamento")) {
        suggested = products.filter(p => 
          p.categories.includes("cemento") || p.categories.includes("macrame")
        ).slice(0, 3)
      } else {
        // Random selection for other queries
        const shuffled = [...products].sort(() => 0.5 - Math.random())
        suggested = shuffled.slice(0, 3)
      }

      setRecommendations(suggested)
      setIsSearching(false)
    }, 800)
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
          <p className="text-muted-foreground mb-10 mx-auto max-w-lg leading-relaxed">
            Contanos para quién es el regalo y te sugerimos piezas de la colección.
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
              <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-8">
                Te recomendamos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto justify-items-center">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
