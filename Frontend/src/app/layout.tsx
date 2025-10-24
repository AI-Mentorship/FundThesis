'use client'

import "./globals.css"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StockTicker from '@/components/StockTicker'
import Footer from '@/components/Footer'
import { Merriweather } from 'next/font/google'

const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Discover', href: '/discover' },
    { name: 'Insights', href: '/insights' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'LearnThesis', href: '/learn' },
    { name: 'EnviroThesis', href: '/enviro' },
  ]

  return (
    <html lang="en" className={merriweather.className}>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Navbar */}
          <nav className="border-b border-gray-200 px-4 py-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-black">
                  Fundthesis
                </Link>
              </div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
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

              {/* Profile */}
              <div className="flex items-center">
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
              </div>

              {/* Mobile Menu Button */}
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

          {/* Stock Ticker */}
          <StockTicker />

          {/* Page Content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  )
}