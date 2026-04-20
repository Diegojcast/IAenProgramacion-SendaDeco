import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: 'Senda Deco - Decoración hecha a mano',
  description: 'Descubre nuestra colección de decoración artesanal hecha a mano. Macramé, cemento, velas y más.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased text-[15px] sm:text-base leading-relaxed">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
