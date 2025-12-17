import { Profile } from '@/components/component/profile'
import { getUserData } from '@/actions/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getUserData()
  
  if (!user) {
    redirect('/auth?redirect=/profile&message=login-required')
  }
  
  return <Profile />
}