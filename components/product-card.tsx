"use client"

import Link from "next/link"
import { type Product, formatProductDeliveryLabel, formatPrice } from "@/lib/data"
import { DeliveryBadge } from "./delivery-badge"
import { ProductImageCarousel } from "@/components/product/product-image-carousel"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const deliveryDays = formatProductDeliveryLabel(product)

  return (
    <Link href={`/producto/${product.id}`} className="group block">
      <ProductImageCarousel
        productId={product.id}
        imageIds={product.imageIds}
        alt={product.name}
        className="aspect-square rounded-2xl"
      />
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
