import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/data"

export function CategoriesSection() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-8">
      <div className="container">
        <div className="mb-12 md:mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Explorar
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Colecciones
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos?category=${category.id}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-sm shadow-foreground/5 ring-1 ring-border/40">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-foreground/10 to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-white drop-shadow-sm">
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
