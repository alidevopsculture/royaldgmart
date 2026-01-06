import { Suspense } from 'react'
import { Profile } from '@/components/component/profile'
import { getUserData } from '@/actions/auth'
import { redirect } from 'next/navigation'

function ProfileFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600 shadow-lg"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-orange-400 opacity-75"></div>
      </div>
    </div>
  )
}

export default async function ProfilePage() {
  const user = await getUserData()
  
  if (!user) {
    redirect('/auth?redirect=/profile&message=login-required')
  }
  
  return (
    <Suspense fallback={<ProfileFallback />}>
      <Profile />
    </Suspense>
  )
}