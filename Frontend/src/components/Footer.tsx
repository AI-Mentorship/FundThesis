import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-3">Fundthesis</h3>
            <p className="text-gray-400">
              AI-powered financial insights for smarter investing decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-gray-400 hover:text-white transition-colors">
                  Insights
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Learn</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/learn" className="text-gray-400 hover:text-white transition-colors">
                  LearnThesis
                </Link>
              </li>
              <li>
                <Link href="/enviro" className="text-gray-400 hover:text-white transition-colors">
                  EnviroThesis
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 Fundthesis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer