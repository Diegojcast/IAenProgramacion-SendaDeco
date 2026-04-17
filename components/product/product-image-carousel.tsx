"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImagePlaceholder } from "@/components/ui/image-placeholder"

interface ProductImageCarouselProps {
  productId: string
  imageIds: string[]
  alt: string
  className?: string
  priority?: boolean
}

export function ProductImageCarousel({
  productId,
  imageIds,
  alt,
  className,
  priority = false,
}: ProductImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  const sources: string[] = imageIds.map((id) => `/api/images/product/${productId}/${id}`)

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + sources.length) % sources.length)
  }, [sources.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % sources.length)
  }, [sources.length])

  if (sources.length === 0) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl", className)}>
        <ImagePlaceholder className="w-full h-full min-h-[300px]" />
      </div>
    )
  }

  return (
    <div className={cn("relative group overflow-hidden rounded-2xl bg-muted", className)}>
      {/* Main image */}
      <Image
        key={sources[current]}
        src={sources[current]}
        alt={`${alt} \u2013 imagen ${current + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority && current === 0}
        unoptimized
      />

      {/* Navigation arrows (only when multiple images) */}
      {sources.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {sources.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === current ? "bg-white w-3" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
