"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, ChevronDown } from "lucide-react"
import type { CategoryRow } from "@/lib/repositories/categories"
import type { ColorRow } from "@/lib/repositories/colors"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  categories: CategoryRow[]
  colors: ColorRow[]
}

export function ProductFilters({ categories, colors }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  
  const currentCategory = searchParams.get("category") || ""
  const currentColor = searchParams.get("color") || ""
  const hasActiveFilter = !!(currentCategory || currentColor)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/productos?${params.toString()}`)
  }

  const filtersContent = (
    <div className="space-y-8">
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
              <RadioGroupItem value={category.slug} id={`cat-${category.slug}`} />
              <Label htmlFor={`cat-${category.slug}`} className="text-sm cursor-pointer">
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
              <RadioGroupItem value={color.slug} id={`color-${color.slug}`} />
              <Label htmlFor={`color-${color.slug}`} className="text-sm cursor-pointer flex items-center gap-2">
                {color.hex && (
                  <span
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                )}
                {color.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: collapsible toggle */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Filtros
            {hasActiveFilter && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {(currentCategory ? 1 : 0) + (currentColor ? 1 : 0)}
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            {filtersContent}
          </div>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        {filtersContent}
      </div>
    </>
  )
}
