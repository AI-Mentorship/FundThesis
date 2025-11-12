import React from 'react'

interface ProfileInfo {
  name: string
  email: string
  memberSince: string
  riskTolerance: string
  investmentStyle: string
}

interface ProfileCardProps {
  profile: ProfileInfo
  className?: string
}

export function ProfileCard({ profile, className = "" }: ProfileCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
      </div>
    </div>
  )
}

interface AccountInfoCardProps {
  profile: ProfileInfo
  className?: string
}

export function AccountInfoCard({ profile, className = "" }: AccountInfoCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Member Since</span>
          <span className="font-medium text-gray-900">{profile.memberSince}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Risk Tolerance</span>
          <span className="font-medium text-gray-900">{profile.riskTolerance}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Investment Style</span>
          <span className="font-medium text-gray-900">{profile.investmentStyle}</span>
        </div>
      </div>
    </div>
  )
}

interface PreferencesCardProps {
  className?: string
  onLogout?: () => void
}

export function PreferencesCard({ className = "", onLogout }: PreferencesCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Email Notifications</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Enabled
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Two-Factor Authentication</span>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Disabled
          </button>
        </div>
        {onLogout && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

