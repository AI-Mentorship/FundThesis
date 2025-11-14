'use client'

import './globals.css'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StockTicker from '@/components/StockTicker'
import Footer from '@/components/Footer'
import { Merriweather } from 'next/font/google'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Discover', href: '/discover' },
  { name: 'Insights', href: '/insights' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'LearnThesis', href: '/learn' },
  { name: 'EnviroThesis', href: '/enviro' },
]

function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out of Supabase', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="border-b border-gray-200 px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              Fundthesis
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                  pathname === item.href
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-gray-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : user ? (
              <>
                <span className="hidden text-sm text-gray-500 md:inline">
                  {user.email ?? 'Account'}
                </span>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                    pathname === '/profile'
                      ? 'text-black border-b-2 border-black pb-1'
                      : 'text-gray-500'
                  }`}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                  pathname === '/auth'
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-gray-500'
                }`}
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <StockTicker />

      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={merriweather.className}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <AppFrame>{children}</AppFrame>
        </AuthProvider>
      </body>
    </html>
  )
}