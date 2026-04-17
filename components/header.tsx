"use client"

import Link from "next/link"
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 md:h-[4.25rem] items-center justify-between w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <nav className="flex flex-col gap-5 mt-10">
              <Link href="/" className="text-lg font-normal tracking-wide hover:text-primary transition-colors duration-300">
                Inicio
              </Link>
              <Link href="/productos" className="text-lg font-normal tracking-wide hover:text-primary transition-colors duration-300">
                Productos
              </Link>
              <Link href="/productos?category=macrame" className="text-muted-foreground hover:text-primary transition-colors duration-300 pl-1">
                Macramé
              </Link>
              <Link href="/productos?category=cemento" className="text-muted-foreground hover:text-primary transition-colors duration-300 pl-1">
                Cemento
              </Link>
              <Link href="/productos?category=velas" className="text-muted-foreground hover:text-primary transition-colors duration-300 pl-1">
                Velas
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300">
            Inicio
          </Link>
          <Link href="/productos" className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300">
            Productos
          </Link>
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-xl md:text-2xl font-medium text-foreground tracking-tight hover:text-primary transition-colors duration-300"
        >
          Senda Deco
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:flex text-muted-foreground">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-h-5 min-w-5 px-1 rounded-full bg-primary/90 text-[10px] font-medium text-primary-foreground flex items-center justify-center tabular-nums">
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
