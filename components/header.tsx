"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-lg font-medium hover:text-primary transition-colors">
                Productos
              </Link>
              <Link href="/productos?category=macrame" className="text-muted-foreground hover:text-primary transition-colors">
                Macramé
              </Link>
              <Link href="/productos?category=cemento" className="text-muted-foreground hover:text-primary transition-colors">
                Cemento
              </Link>
              <Link href="/productos?category=velas" className="text-muted-foreground hover:text-primary transition-colors">
                Velas
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/productos" className="text-sm font-medium hover:text-primary transition-colors">
            Productos
          </Link>
        </nav>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/logo.png"
            alt="Senda Deco - Handmade"
            width={120}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Carrito</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
