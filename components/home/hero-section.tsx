import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop"
const FALLBACK_ALT =
  "Decoración hecha a mano - Interior con plantas y decoración artesanal"

export async function HeroSection() {
  const settings = await prisma.homepageSettings
    .findUnique({ where: { id: "main" }, select: { heroImageData: true, heroAlt: true } })
    .catch(() => null)

  const heroSrc = settings?.heroImageData ? "/api/images/homepage/hero" : FALLBACK_HERO
  const heroAlt = settings?.heroAlt || FALLBACK_ALT

  return (
    <section className="relative h-[65vh] sm:h-[72vh] min-h-[460px] sm:min-h-[520px] w-full overflow-hidden">
      <Image
        src={heroSrc}
        alt={heroAlt}
        fill
        className="object-cover scale-105"
        priority
        unoptimized={!!settings?.heroImageData}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/55 to-background/20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex items-center py-12 md:py-16">
        <div className="max-w-xs sm:max-w-md md:max-w-xl space-y-5 sm:space-y-8 md:space-y-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Artesanía · Argentina
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-medium leading-[1.15] text-foreground">
            Decoración hecha a mano
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md leading-relaxed font-light">
            Piezas únicas que transforman tu hogar con calidez y una estética serena.
          </p>
          <div className="pt-1 sm:pt-2">
            <Link href="/productos">
              <Button size="lg" className="px-8 sm:px-10">
                Ver colección
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
