"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Table Shell ──────────────────────────────────────────────────────────────

interface AdminTableProps {
  children: React.ReactNode
  className?: string
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[540px]">{children}</table>
      </div>
    </div>
  )
}

// ── Head ─────────────────────────────────────────────────────────────────────

interface AdminTableHeadProps {
  columns: string[]
}

export function AdminTableHead({ columns }: AdminTableHeadProps) {
  return (
    <thead className="bg-muted/50 border-b border-border">
      <tr>
        {columns.map((col) => (
          <th
            key={col}
            className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// ── Row ──────────────────────────────────────────────────────────────────────

interface AdminTableRowProps {
  children: React.ReactNode
  className?: string
}

export function AdminTableRow({ children, className }: AdminTableRowProps) {
  return (
    <tr className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", className)}>
      {children}
    </tr>
  )
}

// ── Cell ─────────────────────────────────────────────────────────────────────

interface AdminTableCellProps {
  children: React.ReactNode
  className?: string
  muted?: boolean
}

export function AdminTableCell({ children, className, muted }: AdminTableCellProps) {
  return (
    <td className={cn("px-4 py-3", muted && "text-muted-foreground", className)}>
      {children}
    </td>
  )
}

// ── Search ───────────────────────────────────────────────────────────────────

interface AdminSearchProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function AdminSearch({ placeholder = "Buscar...", value, onChange }: AdminSearchProps) {
  return (
    <div className="relative w-full max-w-xs">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9 h-9 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function AdminTableEmpty({ label }: { label: string }) {
  return (
    <tbody>
      <tr>
        <td colSpan={99} className="px-4 py-12 text-center text-sm text-muted-foreground">
          {label}
        </td>
      </tr>
    </tbody>
  )
}
