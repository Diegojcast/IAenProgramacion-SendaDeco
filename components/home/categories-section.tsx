import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/data"

export function CategoriesSection() {
  return (
    <section className="py-16 px-4">
      <div className="container">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-8">
          Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos?category=${category.id}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg font-medium text-white">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
