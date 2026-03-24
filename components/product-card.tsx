"use client"

import Image from "next/image"
import Link from "next/link"
import { type Product, formatProductDeliveryLabel, formatPrice } from "@/lib/data"
import { DeliveryBadge } from "./delivery-badge"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const deliveryDays = formatProductDeliveryLabel(product)

  return (
    <Link href={`/producto/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
        <DeliveryBadge days={deliveryDays} />
      </div>
    </Link>
  )
}
