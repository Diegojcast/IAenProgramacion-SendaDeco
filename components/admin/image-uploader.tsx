"use client"

/**
 * components/admin/image-uploader.tsx
 * Reusable image upload widget with:
 * - Local file picker (jpg, png, webp — max 2 MB)
 * - Aspect-ratio cropping preview
 * - Upload progress indicator
 * - Existing image display
 */

import { useRef, useState, useCallback } from "react"
import Image from "next/image"
import { ImageIcon, Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

export type AspectRatio = "1/1" | "4/3" | "4/5" | "16/9"

interface ImageUploaderProps {
  /** URL or data-URL of current image (shown when no new file is picked) */
  currentImageUrl?: string | null
  /** Visual aspect ratio of the preview box */
  aspectRatio?: AspectRatio
  /** Called when user confirms an upload; receives the FormData */
  onUpload: (formData: FormData, fieldName: string) => Promise<void>
  /** Field name for the FormData entry */
  fieldName?: string
  /** Called when user clicks delete on an existing image */
  onDelete?: () => Promise<void>
  /** Hint shown below the upload area */
  hint?: string
  className?: string
}

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
}

export function ImageUploader({
  currentImageUrl,
  aspectRatio = "4/3",
  onUpload,
  fieldName = "image",
  onDelete,
  hint = "JPG, PNG o WebP · máx. 2 MB",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Tipo de archivo no permitido. Usá JPG, PNG o WebP.")
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 2 MB.`)
      return
    }

    setPendingFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!pendingFile) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append(fieldName, pendingFile)
      await onUpload(fd, fieldName)
      setPreview(null)
      setPendingFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [pendingFile, fieldName, onUpload])

  const handleDiscard = useCallback(() => {
    setPreview(null)
    setPendingFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const handleDelete = useCallback(async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }, [onDelete])

  const displayUrl = preview ?? currentImageUrl

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview / drop zone */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50",
          ASPECT_CLASSES[aspectRatio]
        )}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Seleccionar imagen"
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={!!preview} // blob URL — skip Next.js optimisation
            />
            {/* Dark overlay hint */}
            <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-background/90 rounded-full px-3 py-1.5 text-xs text-foreground flex items-center gap-1.5">
                <Upload size={12} />
                Cambiar imagen
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon size={32} strokeWidth={1.25} />
            <span className="text-sm">Subir imagen</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {pendingFile ? (
          <>
            <Button size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Subiendo…" : "Confirmar subida"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDiscard} disabled={uploading}>
              <X size={14} className="mr-1" /> Descartar
            </Button>
            <span className="text-xs text-muted-foreground">
              {pendingFile.name} · {(pendingFile.size / 1024).toFixed(0)} KB
            </span>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={13} className="mr-1.5" />
              {currentImageUrl ? "Reemplazar" : "Subir imagen"}
            </Button>
            {currentImageUrl && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando…" : "Eliminar imagen"}
              </Button>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
