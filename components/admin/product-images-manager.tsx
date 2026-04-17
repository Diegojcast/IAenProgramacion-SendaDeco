"use client"

/**
 * components/admin/product-images-manager.tsx
 * Manages multiple product images:
 * - Upload (multi-file, up to 10 total)
 * - Delete individual
 * - Drag-to-reorder
 */

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { GripVertical, Trash2, Upload, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProductImageMeta = {
  id: string
  sortOrder: number
  imageMime?: string
  imageWidth?: number | null
  imageHeight?: number | null
}

const MAX_IMAGES = 10
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ProductImagesManagerProps {
  productId: string
  initialImages: ProductImageMeta[]
  /** called after any mutation so the parent can re-fetch */
  onRefresh?: () => void
}

export function ProductImagesManager({
  productId,
  initialImages,
  onRefresh,
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImageMeta[]>(
    [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setError(null)

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`Ya tenés ${MAX_IMAGES} imágenes. Elimina alguna antes de agregar más.`)
      return
    }

    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: tipo no permitido (JPG, PNG, WebP).`)
        continue
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`${file.name} supera los 2 MB.`)
        continue
      }
    }

    setUploading(true)
    try {
      const fd = new FormData()
      for (const f of files.slice(0, remaining)) {
        fd.append("images", f)
      }
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? "Error al subir imágenes.")
      }
      const data = await res.json()
      // Append newly created images to list
      const newImgs: ProductImageMeta[] = data.created.map((img: { id: string; sortOrder: number }) => ({
        id: img.id,
        sortOrder: img.sortOrder,
        imageMime: "image/webp",
        imageWidth: null,
        imageHeight: null,
      }))
      setImages((prev) => [...prev, ...newImgs].sort((a, b) => a.sortOrder - b.sortOrder))
      onRefresh?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      setError("Error al eliminar la imagen.")
      return
    }
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    onRefresh?.()
  }

  // ── Reorder (drag and drop) ───────────────────────────────────────────────

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  async function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...images]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    const withNewOrder = reordered.map((img, i) => ({ ...img, sortOrder: i }))
    setImages(withNewOrder)
    setDragIndex(null)
    setDragOverIndex(null)

    // Persist reorder
    await fetch(`/api/admin/products/${productId}/images/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: withNewOrder.map((img) => img.id) }),
    })
    onRefresh?.()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {images.length}/{MAX_IMAGES} imágenes
        </span>
        {images.length < MAX_IMAGES && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Plus size={13} className="mr-1.5" />
            {uploading ? "Subiendo…" : "Agregar imágenes"}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <Upload size={28} strokeWidth={1.25} />
          <span className="text-sm">Subir imágenes del producto</span>
          <span className="text-xs">Hasta {MAX_IMAGES} · JPG, PNG o WebP · máx. 2 MB cada una</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-border transition-all cursor-grab active:cursor-grabbing",
                dragOverIndex === index && dragIndex !== index && "ring-2 ring-primary scale-105",
                index === 0 && "ring-primary/50" // first = main image
              )}
            >
              <Image
                src={`/api/images/product/${productId}/${img.id}`}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              {/* Drag handle */}
              <div className="absolute top-1 left-1 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} />
              </div>
              {/* Delete */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
              >
                <Trash2 size={12} />
              </button>
              {/* Main badge */}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Arrastrá para reordenar · La primera imagen es la principal
      </p>
    </div>
  )
}
