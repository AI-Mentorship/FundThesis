'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, authClient } from '@/lib/auth-client'

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { data, isLoading } = useSession()
  const isAuthenticated = !!data?.session

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Discover', href: '/discover' },
    { name: 'Insights', href: '/insights' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'LearnThesis', href: '/learn' },
    { name: 'EnviroThesis', href: '/enviro' },
  ]

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-black">
            Fundthesis
          </Link>
        </div>

        {/* Navigation Items - Only show if authenticated */}
        {isAuthenticated && (
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
        )}

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
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
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-500 hover:text-gray-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-medium bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
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
  )
}

export default Navbar
