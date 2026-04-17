"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Pencil, Check, X, ImageIcon } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  AdminTable,
  AdminTableHead,
  AdminTableRow,
  AdminTableCell,
  AdminTableEmpty,
  AdminSearch,
} from "@/components/admin/admin-table"
import { DeleteButton } from "@/components/admin/delete-button"
import { ImageUploader } from "@/components/admin/image-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { AdminCategory } from "@/lib/repositories/admin/categories"

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

interface CategoriesListProps {
  categories: AdminCategory[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [imageUploadId, setImageUploadId] = useState<string | null>(null)

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  async function startEdit(c: AdminCategory) {
    setEditingId(c.id)
    setEditName(c.name)
  }

  async function saveEdit(c: AdminCategory) {
    setSaving(true)
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: slugify(editName), image: c.image }),
    })
    setSaving(false)
    setEditingId(null)
    router.refresh()
  }

  async function toggleEnabled(c: AdminCategory) {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: c.name, slug: c.slug, image: c.image, enabled: !c.enabled }),
    })
    router.refresh()
  }

  async function createCategory() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug: slugify(newName) }),
    })
    setSaving(false)
    setNewName("")
    router.refresh()
  }

  async function uploadCategoryImage(formData: FormData, fieldName: string) {
    if (!imageUploadId) return
    const res = await fetch(`/api/admin/categories/${imageUploadId}/image`, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? "Error al subir imagen")
    }
    setImageUploadId(null)
    router.refresh()
  }

  async function deleteCategoryImage(categoryId: string) {
    await fetch(`/api/admin/categories/${categoryId}/image`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div>
      <AdminPageHeader title="Categorías" description={`${categories.length} categorías`} />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar categoría..." />
        <div className="flex items-center gap-2 sm:ml-auto">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva categoría..."
            className="h-9 flex-1 sm:w-48 text-sm"
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
          />
          <Button size="sm" onClick={createCategory} disabled={saving || !newName.trim()}>
            Agregar
          </Button>
        </div>
      </div>

      <AdminTable>
        <AdminTableHead columns={["Imagen", "Nombre", "Slug", "Activa", "Productos", ""]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay categorías" />
        ) : (
          <tbody>
            {filtered.map((c) => (
              <AdminTableRow key={c.id}>
                {/* Image column */}
                <AdminTableCell>
                  {imageUploadId === c.id ? (
                    <div className="w-36">
                      <ImageUploader
                        aspectRatio="4/5"
                        currentImageUrl={c.imageData ? `/api/images/category/${c.id}` : c.image}
                        onUpload={uploadCategoryImage}
                        fieldName="image"
                        onDelete={() => deleteCategoryImage(c.id)}
                        hint="JPG/PNG/WebP · 2MB"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-xs w-full"
                        onClick={() => setImageUploadId(null)}
                      >
                        Cerrar
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setImageUploadId(c.id)}
                      className="w-10 h-10 rounded-md overflow-hidden bg-muted ring-1 ring-border hover:ring-primary/40 transition-all relative flex items-center justify-center"
                      title="Cambiar imagen"
                    >
                      {c.imageData ? (
                        <Image
                          src={`/api/images/category/${c.id}`}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      ) : c.image ? (
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <ImageIcon size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  )}
                </AdminTableCell>

                {/* Name column */}
                <AdminTableCell>
                  {editingId === c.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm w-48"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(c)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                    />
                  ) : (
                    <span className="font-medium">{c.name}</span>
                  )}
                </AdminTableCell>

                <AdminTableCell muted>{c.slug}</AdminTableCell>

                {/* Enabled toggle */}
                <AdminTableCell>
                  <Switch
                    checked={c.enabled}
                    onCheckedChange={() => toggleEnabled(c)}
                    aria-label={`${c.name} activa`}
                  />
                </AdminTableCell>

                <AdminTableCell muted>{c._count.products}</AdminTableCell>

                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === c.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(c)} disabled={saving}>
                          <Check size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}>
                          <Pencil size={14} />
                        </Button>
                        <DeleteButton action={`/api/admin/categories/${c.id}`} label={c.name} />
                      </>
                    )}
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        )}
      </AdminTable>
    </div>
  )
}

