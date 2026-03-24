"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { products, type Product } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function GiftRecommendation() {
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
          p.category === "velas" || p.category === "macrame"
        ).slice(0, 3)
      } else if (queryLower.includes("amig") || queryLower.includes("novia")) {
        suggested = products.filter(p => 
          p.category === "velas" || p.category === "tejidos"
        ).slice(0, 3)
      } else if (queryLower.includes("casa") || queryLower.includes("hogar") || queryLower.includes("departamento")) {
        suggested = products.filter(p => 
          p.category === "cemento" || p.category === "macrame"
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
    <section className="py-16 px-4">
      <div className="container">
        <div className="bg-muted rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              Gift Recommendation
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Sugerir eo viber te aparecea y to ra quién es el regalo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <Input
              placeholder="¿Para quién es el regalo?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
              className="flex-1 bg-card border-border"
            />
            <Button 
              onClick={handleSuggest}
              disabled={isSearching || !query.trim()}
              className="rounded-full px-6"
            >
              {isSearching ? "Buscando..." : "Sugerir regalo"}
            </Button>
          </div>

          {recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Te recomendamos:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
