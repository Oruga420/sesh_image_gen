import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import NavMenu from '@/components/Navigation/NavMenu'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'], 
  subsets: ['latin'],
  variable: '--font-poppins'
})

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
      <body className={`${inter.className} ${poppins.variable}`}>
        <DarkModeProvider>
          <NavMenu />
          <main className="min-h-screen">
            {children}
          </main>
        </DarkModeProvider>
      </body>
    </html>
  )
}