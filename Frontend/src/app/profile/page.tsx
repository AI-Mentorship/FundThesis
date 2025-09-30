import React from 'react'
import Navbar from '@/components/Navbar'
import StockTicker from '@/components/StockTicker'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StockTicker />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
                <p className="text-gray-600">investor@fundthesis.com</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">September 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Tolerance</span>
                  <span className="font-medium text-gray-900">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Style</span>
                  <span className="font-medium text-gray-900">Long-term Growth</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Notifications</span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enabled</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Two-Factor Authentication</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Disabled</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}