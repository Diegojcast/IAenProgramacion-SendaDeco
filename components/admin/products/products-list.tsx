"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil } from "lucide-react"
import type { AdminProduct } from "@/lib/repositories/admin/products"
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
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"

interface ProductsListProps {
  products: AdminProduct[]
}

export function ProductsList({ products }: ProductsListProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.categories.some((c) => c.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div>
      <AdminPageHeader
        title="Productos"
        description={`${products.length} productos en catálogo`}
        action={
          <Button asChild size="sm">
            <Link href="/admin/products/new">+ Nuevo producto</Link>
          </Button>
        }
      />

      <div className="mb-4">
        <AdminSearch value={query} onChange={setQuery} placeholder="Buscar por nombre o categoría..." />
      </div>

      <AdminTable>
        <AdminTableHead columns={["Nombre", "Categorías", "Precio", "Stock por color", "Estado", ""]} />
        {filtered.length === 0 ? (
          <AdminTableEmpty label="No hay productos" />
        ) : (
          <tbody>
            {filtered.map((p) => (
              <AdminTableRow key={p.id}>
                <AdminTableCell>
                  <span className="font-medium text-foreground">{p.name}</span>
                </AdminTableCell>
                <AdminTableCell muted>
                  {p.categories.map((c) => c.name).join(", ") || "—"}
                </AdminTableCell>
                <AdminTableCell>{formatPrice(p.price)}</AdminTableCell>
                <AdminTableCell>
                  {p.colors.length === 0 ? (
                    <span className="text-muted-foreground text-xs">Sin variantes</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {p.colors.map(({ color, stock }) => (
                        <span
                          key={color.id}
                          className={`inline-flex items-center gap-1.5 text-xs ${stock === 0 ? "opacity-40" : ""}`}
                        >
                          {color.hex && (
                            <span
                              className="w-3 h-3 rounded-full border border-border shrink-0"
                              style={{ background: color.hex }}
                            />
                          )}
                          <span className={stock > 0 ? "font-medium" : "text-muted-foreground"}>
                            {color.name}
                          </span>
                          {stock === 0 ? (
                            <span className="text-[10px] text-muted-foreground">Sin stock</span>
                          ) : (
                            <span className="text-muted-foreground">{stock}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant={p.active ? "default" : "secondary"} className="text-xs">
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil size={14} />
                      </Link>
                    </Button>
                    <DeleteButton action={`/api/admin/products/${p.id}`} label={p.name} />
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
