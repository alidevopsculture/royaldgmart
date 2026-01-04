"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { getUserData, Logout } from "@/actions/auth"
import { User, Edit, RefreshCw, AlertTriangle, Package, Calendar, IndianRupee, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  products: Array<{
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    size?: string;
  }>;
}

export function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
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
    if (typeof window === 'undefined') return;
    
    const timer = setTimeout(() => {
      loadUser();
    }, 100);
    
    const loadUser = async () => {
      try {
        const userData = await getUserData()
        if (!userData) {
          router.push('/auth')
          return
        }
        
        try {
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
        } catch (profileError) {
          console.log('Profile fetch error:', profileError);
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
    
    loadUser();
    
    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      
      let token
      if (typeof window !== 'undefined') {
        try {
          token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        } catch (e) {
          token = localStorage.getItem('token')
        }
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Filter only regular orders (non-wholesale)
        const regularOrders = (data.orders || []).filter((order: any) => 
          !order.products?.some((item: any) => 
            item.product?.category === 'WHOLESALE'
          )
        )
        setOrders(regularOrders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleEditMode = () => {
    if (!editMode) {
      // Load latest checkout data when entering edit mode
      if (typeof window !== 'undefined') {
        const cachedProfile = localStorage.getItem('userProfileCache')
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile)
            setFormData({
              username: parsedProfile.username || formData.username,
              email: parsedProfile.email || formData.email,
              phone: parsedProfile.phone || '',
              firstName: parsedProfile.firstName || '',
              lastName: parsedProfile.lastName || '',
              address: parsedProfile.address || '',
              city: parsedProfile.city || '',
              state: parsedProfile.state || '',
              zipCode: parsedProfile.zipCode || '',
              country: parsedProfile.country || 'India'
            })
          } catch (e) {
            console.error('Failed to parse cached profile:', e)
          }
        }
      }
    }
    setEditMode(!editMode)
  }

  const handleLogout = async () => {
    try {
      await Logout()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfileCache', JSON.stringify(newFormData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: newFormData }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true)
      
      let token
      if (typeof window !== 'undefined') {
        try {
          token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        } catch (e) {
          token = localStorage.getItem('token')
        }
      }
      
      if (!token) {
        toast.error('Please login again')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
          state: formData.state
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUser(result.user)
        setFormData({
          username: result.user.username || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          address: result.user.address || '',
          city: result.user.city || '',
          state: result.user.state || '',
          zipCode: result.user.zipCode || '',
          country: result.user.country || ''
        })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfileCache', JSON.stringify(result.user))
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: result.user }))
        }
        
        setEditMode(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600 shadow-lg"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-orange-400 opacity-75"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {formData.firstName || user.username}!
            </h1>
            <p className="text-gray-600">Manage your account and personal information</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{formData.firstName || user.username}</h2>
                  <p className="text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleEditMode}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {editMode ? 'Cancel Edit' : 'Edit Profile & Address'}
                </Button>
                <Link href="/my-orders">
                  <Button variant="outline" className="flex items-center gap-2">
                    View Wholesale Orders
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> Please fill in all your details correctly. This information will be used for checkout and order delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {editMode && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Address Information</h4>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSave}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
            </div>
            <Button 
              onClick={loadOrders}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="p-6">
            {!orders.length && !ordersLoading ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
                <Button onClick={loadOrders} className="mt-4">
                  Load Orders
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Order #{order.orderId}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {order.totalAmount.toFixed(2)}
                          </div>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </div>
                      </div>
                    </div>
                    
                    {order.products && order.products.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          {order.products[0].product?.images?.[0] && (
                            <Image
                              src={order.products[0].product.images[0]}
                              alt={order.products[0].product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.products[0].product.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {order.products[0].quantity}
                            {order.products[0].size && ` • Size: ${order.products[0].size}`}
                            {order.products.length > 1 && ` • +${order.products.length - 1} more items`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-center">
                        <div className="w-full max-w-md">
                          <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
                            <span className="text-sm font-medium text-gray-700">Shipping</span>
                          </div>
                        </div>
                      </div>
                      {order.status === 'pending' && (
                        <div className="text-center mt-3">
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}