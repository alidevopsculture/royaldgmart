"use client"

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { JSX, SVGProps, useEffect, useState } from "react"
import { getUserData } from "@/actions/auth"
import { Package, Calendar, IndianRupee, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Cancel Order Dialog Component
function CancelOrderDialog({ orderId, orderType, onSuccess, onLocalUpdate }: { orderId: string, orderType: 'regular' | 'wholesale', onSuccess: () => void, onLocalUpdate?: (orderId: string, status: string, reason: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

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
        <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
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
        <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
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

export function MyOrders() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [orderUpdates, setOrderUpdates] = useState<{[key: string]: {status: string, reason?: string}}>({})
  const [ordersLoading, setOrdersLoading] = useState(false)
  const router = useRouter()

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      let ordersData = []
      
      try {
        const { fetchUserOrdersClient } = await import('@/actions/orders')
        const ordersResult = await fetchUserOrdersClient()
        if (ordersResult && ordersResult.success && Array.isArray(ordersResult.orders)) {
          ordersData = ordersResult.orders
        }
      } catch (apiError) {
        console.log('API failed, using localStorage')
      }
      
      if (ordersData.length === 0) {
        const savedOrders = localStorage.getItem('userOrders')
        if (savedOrders) {
          ordersData = JSON.parse(savedOrders)
        }
      }
      
      const updatedOrders = ordersData.map((order: any) => {
        const update = orderUpdates[order._id]
        if (update) {
          return {
            ...order,
            status: update.status,
            cancelReason: update.status === 'cancelled' ? update.reason : order.cancelReason,
            returnReason: update.status === 'returned' ? update.reason : order.returnReason
          }
        }
        return order
      })
      
      setOrders(updatedOrders)
      if (updatedOrders.length > 0) {
        localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    const savedUpdates = localStorage.getItem('orderUpdates')
    if (savedUpdates) {
      setOrderUpdates(JSON.parse(savedUpdates))
    }
    
    const loadUser = async () => {
      try {
        const userData = await getUserData()
        if (!userData) {
          router.push('/auth')
          return
        }
        setUser(userData)
        
        await loadOrders()
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

  useEffect(() => {
    let interval: NodeJS.Timeout
    let deleteInterval: NodeJS.Timeout
    let statusSyncInterval: NodeJS.Timeout
    
    interval = setInterval(() => {
      loadOrders()
    }, 30000)
    
    deleteInterval = setInterval(() => {
      const deleteSync = localStorage.getItem('adminDeleteSync')
      if (deleteSync) {
        const { orderId, type, action } = JSON.parse(deleteSync)
        if (type === 'regular' && action === 'delete') {
          setOrders(prev => prev.filter(order => order._id !== orderId))
          localStorage.removeItem('adminDeleteSync')
          localStorage.removeItem('userOrders')
          toast.success('Order deleted by admin')
        }
      }
    }, 500)
    
    statusSyncInterval = setInterval(() => {
      const statusSync = localStorage.getItem('userOrdersSync')
      if (statusSync) {
        const { timestamp, orderId, status, type } = JSON.parse(statusSync)
        if (Date.now() - timestamp < 5000 && type === 'regular') {
          setOrders(prev => {
            const updated = prev.map(order => 
              order._id === orderId ? { ...order, status } : order
            )
            localStorage.setItem('userOrders', JSON.stringify(updated))
            return updated
          })
          localStorage.removeItem('userOrdersSync')
        }
      }
    }, 1000)
    
    return () => {
      if (interval) clearInterval(interval)
      if (deleteInterval) clearInterval(deleteInterval)
      if (statusSyncInterval) clearInterval(statusSyncInterval)
    }
  }, [orderUpdates])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
          <div className="mt-4">
            <Link href="/my-orders/wholesale-order">
              <Button variant="outline" className="mr-4">
                View Wholesale Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white border border-gray-200 rounded-lg mb-8">

          {/* Regular Orders */}
          <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" />
                  Order History
                </h3>
                <Button 
                  onClick={loadOrders}
                  variant="outline"
                  size="sm"
                  disabled={ordersLoading}
                  className="flex items-center gap-2"
                >
                  {ordersLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh
                </Button>
              </div>
              
              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders yet</p>
                  <p className="text-gray-400">Start shopping to see your orders here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Order #{order._id.slice(-8)}</h4>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex justify-between sm:block sm:text-right">
                          <div className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                            <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                            {order.total.toFixed(2)}
                          </div>
                          <div className="flex flex-row sm:flex-col gap-1 mt-1">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'return_initiated' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'return_initiated' ? 'Return Initiated' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' :
                              order.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                              order.paymentMethod === 'upi' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentMethod === 'cod' ? '💰 COD' :
                               order.paymentMethod === 'card' ? '💳 Card' :
                               order.paymentMethod === 'upi' ? '📱 UPI' : 'Payment'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {order.products.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                              {item.product?.images?.[0] && (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{item.product?.name}</h5>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              ₹{item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
                        <Link href={`/shipping?orderId=${order._id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            Shipping
                          </Button>
                        </Link>
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <CancelOrderDialog 
                            orderId={order._id} 
                            orderType="regular" 
                            onSuccess={() => {}}
                            onLocalUpdate={(id, status, reason) => {
                              const newUpdates = { ...orderUpdates, [id]: { status, reason } }
                              setOrderUpdates(newUpdates)
                              localStorage.setItem('orderUpdates', JSON.stringify(newUpdates))
                              
                              setOrders(prev => {
                                const updated = prev.map(o => 
                                  o._id === id ? { ...o, status, cancelReason: reason } : o
                                )
                                localStorage.setItem('userOrders', JSON.stringify(updated))
                                localStorage.setItem('adminOrdersSync', JSON.stringify({ timestamp: Date.now(), orderId: id, status, reason, type: 'regular' }))
                                return updated
                              })
                              
                              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/cancel`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ cancelReason: reason })
                              }).catch(() => console.log('Backend sync failed'))
                            }}
                          />
                        )}
                        
                        {(order.status === 'delivered' || order.status === 'shipped') && (
                          <ReturnOrderDialog 
                            orderId={order._id} 
                            orderType="regular" 
                            onSuccess={() => {}}
                            onLocalUpdate={(id, status, reason) => {
                              const newUpdates = { ...orderUpdates, [id]: { status, reason } }
                              setOrderUpdates(newUpdates)
                              localStorage.setItem('orderUpdates', JSON.stringify(newUpdates))
                              
                              setOrders(prev => {
                                const updated = prev.map(o => 
                                  o._id === id ? { ...o, status, returnReason: reason } : o
                                )
                                localStorage.setItem('userOrders', JSON.stringify(updated))
                                localStorage.setItem('adminOrdersSync', JSON.stringify({ timestamp: Date.now(), orderId: id, status, reason, type: 'regular' }))
                                return updated
                              })
                              
                              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/return`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ returnReason: reason })
                              }).catch(() => console.log('Backend sync failed'))
                            }}
                          />
                        )}
                      </div>
                      
                      {order.status === 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-red-600">
                            <strong>Cancelled:</strong> {order.cancelReason || 'No reason provided'}
                          </div>
                        </div>
                      )}
                      {order.status === 'returned' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-orange-600">
                            <strong>Returned:</strong> {order.returnReason || 'No reason provided'}
                          </div>
                        </div>
                      )}
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