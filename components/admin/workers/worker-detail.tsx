"use client"

import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { WorkerCalendar } from "@/components/admin/workers/worker-calendar"
import { WorkerWorkloadCard } from "@/components/admin/workers/worker-workload-card"
import type { AdminWorker, WorkerWorkload } from "@/lib/repositories/admin/workers"

interface WorkerDetailProps {
  worker: AdminWorker
  workload: WorkerWorkload
}

export function WorkerDetail({ worker, workload }: WorkerDetailProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminPageHeader
        title={`${worker.firstName} ${worker.lastName}`}
        description={worker.email}
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        <Link
          href={`/admin/workers/${worker.id}/edit`}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Datos
        </Link>
        <span className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
          Disponibilidad
        </span>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-wrap gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Email</p>
          <p className="text-sm">{worker.email}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Categorías</p>
          {worker.categories.length === 0 ? (
            <span className="text-sm text-muted-foreground">Sin categorías</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {worker.categories.map((c) => (
                <Badge key={c.id} variant="secondary">{c.name}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div>
        <h2 className="font-serif text-lg font-medium mb-4">Disponibilidad</h2>
        <WorkerWorkloadCard workload={workload} />
        <div className="mt-6">
          <WorkerCalendar workerId={worker.id} />
        </div>
      </div>
    </div>
  )
}
