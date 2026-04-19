import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"

const WA_LINK = "https://wa.me/5491157257644"
const IG_LINK = "https://www.instagram.com/by.senda.deco/"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center justify-center gap-10">
          <Link
            href="/"
            className="font-serif text-2xl font-medium text-foreground tracking-tight text-center"
          >
            Senda Deco
          </Link>

          {/* Contact section */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Contacto</p>

            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <a
                href={IG_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors duration-300"
              >
                <Instagram className="h-4 w-4 shrink-0" />
                <span>Instagram</span>
              </a>

            </div>

            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-secondary transition-colors duration-300"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Escribinos por WhatsApp
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

