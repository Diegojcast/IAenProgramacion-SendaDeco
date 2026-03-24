import { Clock, Hammer, Package, Truck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = "pendiente" | "en_produccion" | "listo" | "enviado" | "entregado"

type OrderStepperProps = {
  currentStatus: OrderStatus
}

const steps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "pendiente", label: "Pendiente", icon: Clock },
  { status: "en_produccion", label: "En producción", icon: Hammer },
  { status: "listo", label: "Listo", icon: Package },
  { status: "enviado", label: "Enviado", icon: Truck },
  { status: "entregado", label: "Entregado", icon: CheckCircle2 },
]

export function OrderStepper({ currentStatus }: OrderStepperProps) {
  const currentIndex = steps.findIndex(s => s.status === currentStatus)

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.status} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground",
                isCurrent && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                "text-xs text-center",
                isActive ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
