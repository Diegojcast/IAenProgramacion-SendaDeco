"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ProductImagesManager } from "@/components/admin/product-images-manager"
import { ProductStepsManager } from "@/components/admin/products/product-steps-manager"
import { Upload, X, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminProduct } from "@/lib/repositories/admin/products"
import type { StepDraft } from "@/components/admin/products/product-steps-manager"
import type { AdminCategory } from "@/lib/repositories/admin/categories"
import type { AdminColor } from "@/lib/repositories/admin/colors"
import type { AdminMaterial } from "@/lib/repositories/admin/materials"

const MAX_PENDING = 10
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 2 * 1024 * 1024

type PendingFile = { file: File; preview: string }

interface ProductFormProps {
  product?: AdminProduct
  categories: AdminCategory[]
  colors: AdminColor[]
  materials: AdminMaterial[]
}

export function ProductForm({ product, categories, colors, materials }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? "")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories.map((c) => c.id) ?? []
  )
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [stepsDraft, setStepsDraft] = useState<StepDraft[]>(
    product?.steps?.map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order,
      durationHours: s.durationHours,
      requiredCategoryId: s.requiredCategoryId,
    })) ?? []
  )
  const [description, setDescription] = useState(product?.description ?? "")
  const [active, setActive] = useState(product?.active ?? true)
  const [featured, setFeatured] = useState(product?.featured ?? false)

  // ── Pending images (create mode only) ────────────────────────────────────
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [pendingError, setPendingError] = useState<string | null>(null)
  const pendingInputRef = useRef<HTMLInputElement>(null)

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => { pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePendingFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPendingError(null)

    const remaining = MAX_PENDING - pendingFiles.length
    if (remaining <= 0) {
      setPendingError(`Máximo ${MAX_PENDING} imágenes.`)
      return
    }

    const toAdd: PendingFile[] = []
    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setPendingError(`${file.name}: tipo no permitido (JPG, PNG, WebP).`)
        continue
      }
      if (file.size > MAX_SIZE) {
        setPendingError(`${file.name} supera los 2 MB.`)
        continue
      }
      toAdd.push({ file, preview: URL.createObjectURL(file) })
    }
    setPendingFiles((prev) => [...prev, ...toAdd])
    if (e.target) e.target.value = ""
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  // per-color stock: { colorId → stock }
  const [colorStocks, setColorStocks] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    if (product) {
      for (const cv of product.colors) {
        initial[cv.color.id] = cv.stock
      }
    }
    return initial
  })

  const [materialRows, setMaterialRows] = useState<{ materialId: string; quantity: number }[]>(
    product?.materials.map((m) => ({ materialId: m.material.id, quantity: m.quantity })) ?? []
  )
  const [metadataText, setMetadataText] = useState<string>(product?.metadataText ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStepErrors, setShowStepErrors] = useState(false)

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function toggleColor(id: string) {
    setColorStocks((prev) => {
      if (id in prev) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: 0 }
    })
  }

  function setColorStock(id: string, value: number) {
    setColorStocks((prev) => ({ ...prev, [id]: value }))
  }

  function addMaterialRow() {
    setMaterialRows((prev) => [...prev, { materialId: "", quantity: 1 }])
  }

  function updateMaterialRow(index: number, field: "materialId" | "quantity", value: string | number) {
    setMaterialRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function removeMaterialRow(index: number) {
    setMaterialRows((prev) => prev.filter((_, i) => i !== index))
  }

  function validateSteps(): boolean {
    if (stepsDraft.length === 0) return false
    return stepsDraft.every((s) => s.name.trim() !== "" && s.durationHours > 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("[ProductForm] handleSubmit fired", { name, price, steps: stepsDraft })

    // Manual field validation (form uses noValidate)
    if (!name.trim()) {
      setError("El nombre del producto es requerido.")
      return
    }
    if (!price || parseFloat(price) <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }

    if (!validateSteps()) {
      setShowStepErrors(true)
      setError("Revisá los pasos de producción antes de guardar.")
      return
    }

    setError(null)
    setLoading(true)

    const payload = {
      name,
      categoryIds: selectedCategoryIds,
      price: parseFloat(price),
      description,
      active,
      featured,
      metadataText: metadataText.trim() || null,
      colorVariants: Object.entries(colorStocks).map(([colorId, stock]) => ({ colorId, stock })),
      materials: materialRows.filter((r) => r.materialId),
    }

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setLoading(false)
      setError("Error al guardar. Verificá los datos e intentá de nuevo.")
      return
    }

    // Resolve the product ID (new or existing)
    let savedProductId = isEdit ? product!.id : (await res.clone().json()).product?.id as string | undefined

    // Save steps
    if (savedProductId) {
      await fetch(`/api/admin/products/${savedProductId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: stepsDraft }),
      })
    }

    // If creating, upload any queued images before redirecting
    if (!isEdit && pendingFiles.length > 0) {
      if (!savedProductId) {
        const data = await res.json()
        savedProductId = data.product?.id
      }
      if (savedProductId) {
        const fd = new FormData()
        for (const { file } of pendingFiles) fd.append("images", file)
        await fetch(`/api/admin/products/${savedProductId}/images`, { method: "POST", body: fd })
      }
    }

    setLoading(false)
    router.push("/admin/products")
    router.refresh()
  }

  const selectedColorIds = Object.keys(colorStocks)

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-6">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      {/* Categories multi-select */}
      <div className="space-y-2">
        <Label>Categorías</Label>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <Checkbox
                checked={selectedCategoryIds.includes(c.id)}
                onCheckedChange={() => toggleCategory(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <Label htmlFor="price">Precio (ARS)</Label>
        <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>

      {/* Production steps */}
      <div className="space-y-2">
        <Label>Pasos de producción</Label>
        <ProductStepsManager
          initialSteps={product?.steps}
          categories={categories}
          onChange={(s) => { setStepsDraft(s); if (showStepErrors) setShowStepErrors(false) }}
          showErrors={showStepErrors}
        />
      </div>

      {/* Colors + per-color stock */}
      <div className="space-y-2">
        <Label>Colores y stock por variante</Label>
        <div className="space-y-2">
          {colors.map((c) => {
            const checked = selectedColorIds.includes(c.id)
            return (
              <div key={c.id} className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm min-w-[140px]">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleColor(c.id)}
                  />
                  {c.hex && (
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ background: c.hex }}
                    />
                  )}
                  {c.name}
                </label>
                {checked && (
                  <Input
                    type="number"
                    min="0"
                    className="w-24 h-8 text-sm"
                    placeholder="Stock"
                    value={colorStocks[c.id] ?? 0}
                    onChange={(e) => setColorStock(c.id, parseInt(e.target.value, 10) || 0)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label>Materiales</Label>
        <div className="space-y-2">
          {materialRows.map((row, i) => (
            <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <Select value={row.materialId} onValueChange={(v) => updateMaterialRow(i, "materialId", v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-24"
                placeholder="Cant."
                value={row.quantity}
                onChange={(e) => updateMaterialRow(i, "quantity", parseFloat(e.target.value))}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeMaterialRow(i)} className="text-muted-foreground">
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addMaterialRow}>
          + Agregar material
        </Button>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <Switch id="active" checked={active} onCheckedChange={setActive} />
        <Label htmlFor="active">Producto activo</Label>
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-3">
        <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
        <Label htmlFor="featured">Destacar en inicio</Label>
      </div>

      {/* Product images */}
      <Separator />
      <div className="space-y-2">
        <Label>Imágenes del producto</Label>

        {isEdit ? (
          /* Edit mode: manager talks directly to the API */
          <ProductImagesManager
            productId={product!.id}
            initialImages={product!.images}
          />
        ) : (
          /* Create mode: queue local files; uploaded after product is saved */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {pendingFiles.length}/{MAX_PENDING} imágenes
              </span>
              {pendingFiles.length < MAX_PENDING && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => pendingInputRef.current?.click()}
                >
                  <Plus size={13} className="mr-1.5" />
                  Agregar imágenes
                </Button>
              )}
            </div>

            <input
              ref={pendingInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePendingFilesSelected}
            />

            {pendingError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle size={14} />
                {pendingError}
              </p>
            )}

            {pendingFiles.length === 0 ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => pendingInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && pendingInputRef.current?.click()}
              >
                <Upload size={26} strokeWidth={1.25} />
                <span className="text-sm">Subir imágenes del producto</span>
                <span className="text-xs">Hasta {MAX_PENDING} · JPG, PNG o WebP · máx. 2 MB</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {pendingFiles.map((pf, i) => (
                    <div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                      <Image
                        src={pf.preview}
                        alt={`Vista previa ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                        unoptimized
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePendingFile(i)}
                        className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Las imágenes se subirán al guardar el producto
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Internal field — not shown in public frontend */}
      <Separator />
      <div className="space-y-1.5">
        <Label htmlFor="metadataText">
          Descripción interna{" "}
          <span className="text-xs text-muted-foreground font-normal">(IA)</span>
        </Label>
        <Textarea
          id="metadataText"
          rows={4}
          placeholder="Ej: Macramé artesanal ideal para regalo, decoración de hogar, ambientes minimalistas..."
          value={metadataText}
          onChange={(e) => setMetadataText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Este campo no se muestra al cliente. Sirve para mejorar búsquedas y recomendaciones.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
