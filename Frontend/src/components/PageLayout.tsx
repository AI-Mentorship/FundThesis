'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StockTicker from './StockTicker'

interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              Fundthesis
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
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
        </div>
      </nav>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Page Content */}
      {children}
    </div>
  )
}