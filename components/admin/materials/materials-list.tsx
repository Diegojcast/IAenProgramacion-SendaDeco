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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminMaterial } from "@/lib/repositories/admin/materials"

const UNITS = ["unidades", "kg", "metros", "litros"]

export function MaterialsList({ materials }: { materials: AdminMaterial[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editUnit, setEditUnit] = useState("")
  const [editStock, setEditStock] = useState("")
  const [newName, setNewName] = useState("")
  const [newUnit, setNewUnit] = useState("unidades")
  const [newStock, setNewStock] = useState("0")
  const [saving, setSaving] = useState(false)

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  )

  function startEdit(m: AdminMaterial) {
    setEditingId(m.id)
    setEditName(m.name)
    setEditUnit(m.unit)
    setEditStock(String(m.stock))
  }

  async function saveEdit(m: AdminMaterial) {
    setSaving(true)
    await fetch(`/api/admin/materials/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, unit: editUnit, stock: parseFloat(editStock) }),
    })
    setSaving(false)
    setEditingId(null)
    router.refresh()
  }

  async function createMaterial() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch("/api/admin/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), unit: newUnit, stock: parseFloat(newStock) }),
    })
    setSaving(false)
    setNewName("")
    setNewStock("0")
    router.refresh()
  }

  return (
    <div>
      <AdminPageHeader title="Materiales" description={`${materials.length} materiales`} />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar material..." />
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Material..." className="h-9 flex-1 min-w-[100px] sm:w-36 text-sm" />
          <Select value={newUnit} onValueChange={setNewUnit}>
            <SelectTrigger className="h-9 w-24 sm:w-28 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="Stock" className="h-9 w-16 sm:w-20 text-sm" />
          <Button size="sm" onClick={createMaterial} disabled={saving || !newName.trim()}>Agregar</Button>
        </div>
      </div>

      <AdminTable>
        <AdminTableHead columns={["Nombre", "Unidad", "Stock", "Productos", ""]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay materiales" />
        ) : (
          <tbody>
            {filtered.map((m) => (
              <AdminTableRow key={m.id}>
                <AdminTableCell>
                  {editingId === m.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm w-40" autoFocus />
                  ) : (
                    <span className="font-medium">{m.name}</span>
                  )}
                </AdminTableCell>
                <AdminTableCell muted>
                  {editingId === m.id ? (
                    <Select value={editUnit} onValueChange={setEditUnit}>
                      <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    m.unit
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  {editingId === m.id ? (
                    <Input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="h-8 text-sm w-20" />
                  ) : (
                    <span className={m.stock < 5 ? "text-destructive font-medium" : ""}>{m.stock}</span>
                  )}
                </AdminTableCell>
                <AdminTableCell muted>{m._count.products}</AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === m.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(m)} disabled={saving}><Check size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X size={14} /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(m)}><Pencil size={14} /></Button>
                        <DeleteButton action={`/api/admin/materials/${m.id}`} label={m.name} />
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
