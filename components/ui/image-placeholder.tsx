import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  className?: string
  label?: string
}

/**
 * Minimalist placeholder shown when a product/category has no image.
 */
export function ImagePlaceholder({
  className,
  label = "Sin imagen",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
        className
      )}
    >
      <ImageIcon size={28} strokeWidth={1.25} />
      <span className="text-xs">{label}</span>
    </div>
  )
}
