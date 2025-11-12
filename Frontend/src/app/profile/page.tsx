'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProfileCard, AccountInfoCard, PreferencesCard } from '@/components/ui/ProfileCard'
import { supabase, getCurrentUser } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberSince, setMemberSince] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser?.created_at) {
          const date = new Date(currentUser.created_at)
          setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
        }
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth')
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const profileInfo = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    memberSince: memberSince || 'Recently',
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
            <PreferencesCard onLogout={handleLogout} />
          </div>
        </div>
      </main>
      
    </div>
  )
}