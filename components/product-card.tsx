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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-border/30 shadow-sm shadow-foreground/[0.04]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="mt-5 space-y-2 px-0.5">
        <h3 className="text-sm font-normal text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-sm font-medium text-foreground tracking-wide">
          {formatPrice(product.price)}
        </p>
        <DeliveryBadge days={deliveryDays} />
      </div>
    </Link>
  )
}
