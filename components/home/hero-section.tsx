import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop"
        alt="Decoración hecha a mano - Interior con plantas y decoración artesanal"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      <div className="container relative h-full flex items-center px-4">
        <div className="max-w-lg space-y-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-foreground text-balance">
            Decoración hecha a mano
          </h1>
          <p className="text-muted-foreground text-lg">
            Piezas únicas que transforman tu hogar con calidez y autenticidad artesanal.
          </p>
          <Link href="/productos">
            <Button size="lg" className="rounded-full px-8">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
