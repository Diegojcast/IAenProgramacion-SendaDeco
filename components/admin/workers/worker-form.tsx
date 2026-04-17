"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { WorkerDefaultSchedule } from "@/components/admin/workers/worker-default-schedule"
import type { AdminWorker } from "@/lib/repositories/admin/workers"

interface WorkerFormProps {
  worker?: AdminWorker
  categories: { id: string; name: string }[]
}

export function WorkerForm({ worker, categories }: WorkerFormProps) {
  const router = useRouter()
  const isEdit = !!worker

  const [firstName, setFirstName] = useState(worker?.firstName ?? "")
  const [lastName, setLastName] = useState(worker?.lastName ?? "")
  const [email, setEmail] = useState(worker?.email ?? "")
  const [selectedCats, setSelectedCats] = useState<Set<string>>(
    new Set(worker?.categories.map((c) => c.id) ?? [])
  )
  const [isAdmin, setIsAdmin] = useState(worker?.isAdmin ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCategory(id: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Todos los campos son obligatorios.")
      return
    }

    setSaving(true)
    const body = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      isAdmin,
      categoryIds: Array.from(selectedCats),
    }

    try {
      const res = await fetch(
        isEdit ? `/api/admin/workers/${worker.id}` : "/api/admin/workers",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? "Error al guardar")
      }
      router.push("/admin/workers")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <AdminPageHeader
        title={isEdit ? "Editar trabajador" : "Nuevo trabajador"}
        description={isEdit ? `${worker.firstName} ${worker.lastName}` : undefined}
      />

      {/* Tab bar — only for existing workers */}
      {isEdit && worker && (
        <div className="flex gap-1 border-b border-border mb-6">
          <span className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
            Datos
          </span>
          <Link
            href={`/admin/workers/${worker.id}`}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Disponibilidad
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="María"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="García"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@ejemplo.com"
            required
          />
        </div>

        {/* Is admin */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="isAdmin"
            checked={isAdmin}
            onCheckedChange={(checked) => setIsAdmin(checked === true)}
          />
          <Label htmlFor="isAdmin" className="cursor-pointer font-normal">
            Es administrador
          </Label>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>Categorías</Label>
            <div className="rounded-lg border border-border p-4 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={selectedCats.has(c.id)}
                    onCheckedChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear trabajador"}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/workers">Cancelar</Link>
          </Button>
        </div>
      </form>

      {/* Weekly default schedule — only for existing workers */}
      {isEdit && worker && (
        <div className="mt-8">
          <WorkerDefaultSchedule workerId={worker.id} />
        </div>
      )}
    </div>
  )
}
