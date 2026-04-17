/**
 * Centralized order status workflow.
 *
 * Single source of truth for valid transitions, shared by:
 *   - app/api/admin/orders/[id]/route.ts
 *   - app/api/worker/orders/[id]/route.ts
 *   - components/admin/orders/order-status-updater.tsx
 *   - components/worker/worker-order-status.tsx
 *
 * Valid forward chain:
 *   pendiente → en_produccion → listo → enviado → entregado
 *
 * "cancelado" is a terminal state reached only via the dedicated cancel action,
 * never via a status update — so it is NOT in this map.
 *
 * "confirmado" is an alternate entry point (same next step as pendiente).
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_produccion: "En producción",
  listo: "Listo",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

/**
 * Maps each non-terminal status to EXACTLY ONE valid next status.
 * Absence from the map means the status is terminal (no advance possible).
 */
export const ORDER_NEXT_STATUS: Readonly<Record<string, string>> = {
  pendiente: "en_produccion",
  confirmado: "en_produccion",
  en_produccion: "listo",
  listo: "enviado",
  enviado: "entregado",
}

/** Human-readable label for the advance action button. */
export const ORDER_ADVANCE_LABEL: Readonly<Record<string, string>> = {
  en_produccion: "Iniciar producción",
  listo: "Marcar como listo",
  enviado: "Marcar como enviado",
  entregado: "Marcar como entregado",
}

/**
 * Returns Tailwind bg+text classes for a color-coded status badge.
 * Uses only static class names so Tailwind can detect them at build time.
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "pendiente":    return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
    case "confirmado":   return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
    case "en_produccion":return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
    case "listo":        return "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
    case "enviado":      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400"
    case "entregado":    return "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
    case "cancelado":    return "bg-muted text-muted-foreground"
    default:             return "bg-muted text-muted-foreground"
  }
}

/**
 * Returns true only if `from → to` is the exact next step in the chain.
 * Does NOT include cancellation (handled as a separate action).
 */
export function isValidOrderTransition(from: string, to: string): boolean {
  return ORDER_NEXT_STATUS[from] === to
}

/**
 * Returns true for any transition an admin is allowed to make:
 * - Any non-cancelled status → any other non-cancelled status
 * - (Cancellation is handled via the separate "cancel" action)
 */
export function isValidAdminTransition(from: string, to: string): boolean {
  if (from === "cancelado") return false          // terminal — cannot leave
  if (to === "cancelado") return false            // use the cancel action instead
  return to in ORDER_STATUS_LABELS && to !== from
}

/**
 * Returns the single valid next status, or undefined if the status is terminal.
 */
export function getNextOrderStatus(current: string): string | undefined {
  return ORDER_NEXT_STATUS[current]
}
