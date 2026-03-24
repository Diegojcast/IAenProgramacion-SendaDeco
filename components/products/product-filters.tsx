"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { categories, colors } from "@/lib/data"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get("category") || ""
  const currentColor = searchParams.get("color") || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/productos?${params.toString()}`)
  }

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
          Categoría
        </h3>
        <RadioGroup
          value={currentCategory}
          onValueChange={(value) => updateFilter("category", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="cat-all" />
            <Label htmlFor="cat-all" className="text-sm cursor-pointer">
              Todas
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.id} id={`cat-${category.id}`} />
              <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
          Color
        </h3>
        <RadioGroup
          value={currentColor}
          onValueChange={(value) => updateFilter("color", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="color-all" />
            <Label htmlFor="color-all" className="text-sm cursor-pointer">
              Todos
            </Label>
          </div>
          {colors.map((color) => (
            <div key={color.id} className="flex items-center space-x-2">
              <RadioGroupItem value={color.id} id={`color-${color.id}`} />
              <Label htmlFor={`color-${color.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
