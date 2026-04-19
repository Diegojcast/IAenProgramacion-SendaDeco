"use client"

import { useState, useTransition } from "react"
import { CalendarClock, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleOrderButtonProps {
  orderId: string
  hasWorkers: boolean
}

export function ScheduleOrderButton({ orderId, hasWorkers }: ScheduleOrderButtonProps) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSchedule = () => {
    setState("idle")
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/schedule`, {
          method: "POST",
        })
        if (res.ok) {
          setState("success")
          setTimeout(() => setState("idle"), 3000)
        } else {
          const body = await res.json().catch(() => ({}))
          setErrorMsg(body?.error ?? "Ocurrió un error. Intentá de nuevo.")
          setState("error")
        }
      } catch {
        setErrorMsg("Ocurrió un error. Intentá de nuevo.")
        setState("error")
      }
    })
  }

  if (!hasWorkers) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button type="button" variant="outline" size="sm" disabled className="gap-2 opacity-50">
          <CalendarClock size={14} />
          Generar agenda
        </Button>
        <p className="text-xs text-destructive text-right">
          Debe asignar al menos un trabajador antes de generar la agenda
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleSchedule}
        className="gap-2"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : state === "success" ? (
          <CheckCircle2 size={14} className="text-emerald-500" />
        ) : (
          <CalendarClock size={14} />
        )}
        {pending
          ? "Programando…"
          : state === "success"
          ? "Agenda generada"
          : state === "error"
          ? "Error al programar"
          : "Generar agenda"}
      </Button>
      {state === "success" && (
        <p className="text-xs text-muted-foreground">
          Las tareas se generaron y ya son visibles en Mi trabajo.
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-destructive">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
