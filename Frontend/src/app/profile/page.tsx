import React from 'react'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProfileCard, AccountInfoCard, PreferencesCard } from '@/components/ui/ProfileCard'

export default function ProfilePage() {
  const profileInfo = {
    name: "John Doe",
    email: "investor@fundthesis.com",
    memberSince: "September 2025",
    riskTolerance: "Moderate",
    investmentStyle: "Long-term Growth"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader title="Profile" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard profile={profileInfo} />
          </div>

          <div className="lg:col-span-2">
            <AccountInfoCard profile={profileInfo} className="mb-6" />
            <PreferencesCard />
          </div>
        </div>
      </main>
      
    </div>
  )
}