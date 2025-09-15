import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import NavMenu from '@/components/Navigation/NavMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sesh Image Gen',
  description: 'Advanced AI Image Generation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavMenu />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}