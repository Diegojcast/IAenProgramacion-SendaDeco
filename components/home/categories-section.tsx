import Image from "next/image"
import Link from "next/link"
import { getCategories } from "@/lib/repositories/categories"
import { ImagePlaceholder } from "@/components/ui/image-placeholder"

export async function CategoriesSection() {
  const categories = await getCategories()
  return (
    <section className="py-20 md:py-28 pt-10 md:pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Explorar
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Colecciones
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {categories.map((category) => {
            // Prefer binary image from DB, then legacy URL
            const imgSrc = category.hasDbImage
              ? `/api/images/category/${category.id}`
              : category.image ?? null

            return (
              <Link
                key={category.id}
                href={`/productos?category=${category.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-sm shadow-foreground/5 ring-1 ring-border/40">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      unoptimized={category.hasDbImage}
                    />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-foreground/10 to-transparent opacity-90" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-serif text-xl md:text-2xl font-medium text-white drop-shadow-sm">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
