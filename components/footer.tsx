import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 py-16 md:py-24 px-5">
      <div className="container max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center justify-center gap-10">
          <Link
            href="/"
            className="font-serif text-2xl font-medium text-foreground tracking-tight text-center"
          >
            Senda Deco
          </Link>
          
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <Link href="/productos" className="hover:text-foreground transition-colors duration-300">
              Productos
            </Link>
            <Link href="/productos?category=macrame" className="hover:text-foreground transition-colors duration-300">
              Macramé
            </Link>
            <Link href="/productos?category=cemento" className="hover:text-foreground transition-colors duration-300">
              Cemento
            </Link>
            <Link href="/productos?category=velas" className="hover:text-foreground transition-colors duration-300">
              Velas
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://pinterest.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Pinterest"
            >
              <PinterestIcon className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground tracking-wide text-center max-w-md mx-auto">
            © {new Date().getFullYear()} Senda Deco. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
