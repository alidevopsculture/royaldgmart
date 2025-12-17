'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, getUserData } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const user = await getUserData()
        if (user && user.role === 'admin') {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.log('No admin session found')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAdminAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn({ email, password })
      if (result === 'Login successfully!') {
        const user = await getUserData()
        if (user && user.role === 'admin') {
          router.push('/dashboard')
        } else {
          setError('Access denied. Admin privileges required.')
        }
      } else {
        setError(result)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-600 bg-slate-800">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                placeholder="admin@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Default: admin@gmail.com / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}