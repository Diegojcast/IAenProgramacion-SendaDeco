"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageUploader } from "@/components/admin/image-uploader"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface HomepageFormProps {
  hasHeroImage: boolean
  heroAlt: string
}

export function HomepageForm({ hasHeroImage, heroAlt }: HomepageFormProps) {
  const [alt, setAlt] = useState(heroAlt)
  const [currentHero, setCurrentHero] = useState(hasHeroImage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Bust cache on refresh so new image is shown
  const [cacheKey, setCacheKey] = useState(Date.now())

  async function handleUpload(formData: FormData, _fieldName: string) {
    setError(null)
    formData.append("heroAlt", alt)
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? "Error al subir imagen")
    }
    setCurrentHero(true)
    setCacheKey(Date.now())
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleDelete() {
    await fetch("/api/admin/homepage", { method: "DELETE" })
    setCurrentHero(false)
    setCacheKey(Date.now())
  }

  async function saveAlt() {
    setSaving(true)
    const fd = new FormData()
    fd.append("heroAlt", alt)
    await fetch("/api/admin/homepage", { method: "POST", body: fd })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Hero Image */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium">Imagen Hero</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Imagen principal de la portada. Se muestra en la sección inicial de la página de inicio.
          </p>
        </div>

        <ImageUploader
          aspectRatio="16/9"
          currentImageUrl={currentHero ? `/api/images/homepage/hero?v=${cacheKey}` : undefined}
          onUpload={handleUpload}
          fieldName="heroImage"
          onDelete={handleDelete}
          hint="JPG, PNG o WebP · máx. 2 MB · recomendado: 1200 × 675 px"
        />
      </div>

      <Separator />

      {/* Alt text */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="heroAlt" className="text-base font-medium">Texto alternativo (SEO &amp; accesibilidad)</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Descripción de la imagen para lectores de pantalla y buscadores.
          </p>
        </div>
        <Input
          id="heroAlt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Decoración hecha a mano - Interior con plantas"
          maxLength={200}
        />
        <Button size="sm" onClick={saveAlt} disabled={saving}>
          {saving ? "Guardando…" : "Guardar texto"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Cambios guardados.</p>}

      <Separator />

      {/* Info box: featured products are auto-managed */}
      <div className="rounded-xl bg-muted/60 border border-border p-5 space-y-2">
        <p className="text-sm font-medium">Productos destacados</p>
        <p className="text-sm text-muted-foreground">
          Los productos marcados como "Destacar en inicio" desde su ficha en{" "}
          <span className="font-medium">Productos</span> aparecen automáticamente en la sección de
          piezas destacadas de la página de inicio.
        </p>
      </div>
    </div>
  )
}
