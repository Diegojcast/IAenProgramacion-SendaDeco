import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[72vh] min-h-[520px] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop"
        alt="Decoración hecha a mano - Interior con plantas y decoración artesanal"
        fill
        className="object-cover scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/55 to-background/20" />
      <div className="container relative h-full flex items-center px-5 md:px-8 py-16">
        <div className="max-w-xl space-y-8 md:space-y-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Artesanía · Argentina
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] font-medium leading-[1.15] text-foreground">
            Decoración hecha a mano
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed font-light">
            Piezas únicas que transforman tu hogar con calidez y una estética serena.
          </p>
          <div className="pt-2">
            <Link href="/productos">
              <Button size="lg" className="px-10">
                Ver colección
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
