"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Check, X } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminColor } from "@/lib/repositories/admin/colors"

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function ColorsList({ colors }: { colors: AdminColor[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editHex, setEditHex] = useState("")
  const [newName, setNewName] = useState("")
  const [newHex, setNewHex] = useState("")
  const [saving, setSaving] = useState(false)

  const filtered = colors.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  function startEdit(c: AdminColor) {
    setEditingId(c.id)
    setEditName(c.name)
    setEditHex(c.hex ?? "")
  }

  async function saveEdit(c: AdminColor) {
    setSaving(true)
    await fetch(`/api/admin/colors/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: slugify(editName), hex: editHex || undefined }),
    })
    setSaving(false)
    setEditingId(null)
    router.refresh()
  }

  async function createColor() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch("/api/admin/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug: slugify(newName), hex: newHex || undefined }),
    })
    setSaving(false)
    setNewName("")
    setNewHex("")
    router.refresh()
  }

  return (
    <div>
      <AdminPageHeader title="Colores" description={`${colors.length} colores`} />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar color..." />
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre..." className="h-9 flex-1 min-w-[100px] sm:w-36 text-sm" />
          <Input value={newHex} onChange={(e) => setNewHex(e.target.value)} placeholder="#hex" className="h-9 w-20 sm:w-24 text-sm" />
          <Button size="sm" onClick={createColor} disabled={saving || !newName.trim()}>Agregar</Button>
        </div>
      </div>

      <AdminTable>
        <AdminTableHead columns={["Color", "Nombre", "Slug", "Productos", ""]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay colores" />
        ) : (
          <tbody>
            {filtered.map((c) => (
              <AdminTableRow key={c.id}>
                <AdminTableCell>
                  {(editingId === c.id ? editHex : c.hex) && (
                    <span
                      className="w-6 h-6 rounded-full border border-border inline-block"
                      style={{ background: editingId === c.id ? editHex : (c.hex ?? "") }}
                    />
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  {editingId === c.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm w-36" autoFocus />
                  ) : (
                    <span className="font-medium">{c.name}</span>
                  )}
                </AdminTableCell>
                <AdminTableCell muted>
                  {editingId === c.id ? (
                    <Input value={editHex} onChange={(e) => setEditHex(e.target.value)} placeholder="#hex" className="h-8 text-sm w-24" />
                  ) : (
                    c.slug
                  )}
                </AdminTableCell>
                <AdminTableCell muted>{c._count.productColors}</AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === c.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(c)} disabled={saving}><Check size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X size={14} /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}><Pencil size={14} /></Button>
                        <DeleteButton action={`/api/admin/colors/${c.id}`} label={c.name} />
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
