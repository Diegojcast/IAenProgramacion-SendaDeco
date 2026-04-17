import type { WorkerWorkload } from "@/lib/repositories/admin/workers"

function loadColor(pct: number): { bar: string; text: string; label: string } {
  if (pct >= 86) return { bar: "bg-red-500",    text: "text-red-600",    label: "Alta" }
  if (pct >= 60) return { bar: "bg-yellow-400", text: "text-yellow-600", label: "Media" }
  return           { bar: "bg-green-500",  text: "text-green-600",  label: "Baja" }
}

interface WorkerWorkloadCardProps {
  workload: WorkerWorkload
}

export function WorkerWorkloadCard({ workload }: WorkerWorkloadCardProps) {
  const { availableHours, assignedHours, loadPercent } = workload
  const color = loadColor(loadPercent)

  const fmt = (h: number) =>
    Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Carga de trabajo · próximos 30 días
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Disponibles</p>
          <p className="text-sm font-medium">{fmt(availableHours)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Asignadas</p>
          <p className="text-sm font-medium">{fmt(assignedHours)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Carga</p>
          <p className={`text-sm font-semibold ${color.text}`}>
            {loadPercent}% — {color.label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color.bar}`}
          style={{ width: `${loadPercent}%` }}
        />
      </div>

      {availableHours === 0 && (
        <p className="text-xs text-muted-foreground">
          Sin disponibilidad cargada para los próximos 30 días.
        </p>
      )}
    </div>
  )
}
