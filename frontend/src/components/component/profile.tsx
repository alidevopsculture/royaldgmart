"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { JSX, SVGProps, useEffect, useState } from "react"
import { getUserData, Logout } from "@/actions/auth"
import { LogOut, User, Mail, Package, Calendar, IndianRupee, X, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Cancel Order Dialog Component
function CancelOrderDialog({ orderId, orderType, onSuccess, onLocalUpdate }: { orderId: string, orderType: 'regular' | 'wholesale', onSuccess: () => void, onLocalUpdate?: (orderId: string, status: string, reason: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    // Update local state immediately
    if (onLocalUpdate) {
      onLocalUpdate(orderId, 'cancelled', reason)
    }
    
    toast.success('Order cancelled successfully')
    setOpen(false)
    setReason('')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for cancelling this order:</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Changed my mind, Found better price elsewhere, etc."
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep Order
            </Button>
            <Button onClick={handleCancel} disabled={!reason.trim()} className="bg-red-600 hover:bg-red-700">
              Cancel Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Return Order Dialog Component
function ReturnOrderDialog({ orderId, orderType, onSuccess, onLocalUpdate }: { orderId: string, orderType: 'regular' | 'wholesale', onSuccess: () => void, onLocalUpdate?: (orderId: string, status: string, reason: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleReturn = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for return')
      return
    }

    // Update local state immediately
    if (onLocalUpdate) {
      onLocalUpdate(orderId, 'returned', reason)
    }
    
    toast.success('Return request submitted successfully')
    setOpen(false)
    setReason('')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          Return Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Return Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for returning this order:</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Product damaged, Wrong size, Quality issues, etc."
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={!reason.trim()} className="bg-blue-600 hover:bg-blue-700">
              Submit Return Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })
  const router = useRouter()



  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    const loadUser = async () => {
      try {
        // First check if user is authenticated
        const userData = await getUserData()
        if (!userData) {
          router.push('/auth')
          return
        }
        
        // Then fetch complete profile data
        const { getUserProfileClient } = await import('@/actions/profile')
        const profileResult = await getUserProfileClient()
        
        if (profileResult.success && profileResult.user) {
          const fullUserData = profileResult.user
          setUser(fullUserData)
          setFormData({
            username: fullUserData.username || '',
            email: fullUserData.email || '',
            phone: fullUserData.phone || '',
            firstName: fullUserData.firstName || '',
            lastName: fullUserData.lastName || '',
            address: fullUserData.address || '',
            city: fullUserData.city || '',
            state: fullUserData.state || '',
            zipCode: fullUserData.zipCode || '',
            country: fullUserData.country || ''
          })
        } else {
          // Fallback to basic user data if profile fetch fails
          setUser(userData)
          setFormData({
            username: userData.username || '',
            email: userData.email || '',
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
        toast.error('Failed to load user data')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])



  const handleLogout = async () => {
    try {
      await Logout()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      toast.error('Please try again');
      return;
    }
    
    try {
      setLoading(true)
      
      console.log('Saving profile data:', formData);
      
      const { updateProfileClient, getUserProfileClient } = await import('@/actions/profile')
      const result = await updateProfileClient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        state: formData.state
      })
      
      console.log('Profile update result:', result);
      
      if (result && result.success) {
        toast.success('✅ Profile updated successfully!')
        
        // Refresh user data after successful update
        const profileResult = await getUserProfileClient()
        if (profileResult.success && profileResult.user) {
          setUser(profileResult.user)
          console.log('Profile refreshed:', profileResult.user);
        }
        
        // Clear any cached profile data for checkout sync
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userProfileCache')
          // Store updated profile data
          localStorage.setItem('userProfileCache', JSON.stringify(profileResult.user || result.user))
          window.dispatchEvent(new CustomEvent('profileUpdated'))
        }
      } else {
        console.error('Profile update failed:', result);
        toast.error(result?.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-indigo-400"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">Manage your account and personal information</p>
        </div>

        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-lg mb-8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{formData.firstName || user.username}</h2>
                  <p className="text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> Please fill in all your details correctly. This information will be used for checkout and order delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link href="/my-orders">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Button>
          </Link>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-indigo-600" />
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username *</Label>
                            <Input
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-indigo-600" />
                          Address Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Street Address *</Label>
                            <Textarea
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">ZIP Code *</Label>
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
                              <Input
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="mt-1 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}