'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, CheckCircle, Clock, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUserData } from '@/actions/auth'
import toast from 'react-hot-toast'

export default function OrderTracking() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    if (orderIdParam) {
      setOrderId(orderIdParam)
      trackOrder(orderIdParam)
    }
  }, [searchParams])

  const trackOrder = async (id: string) => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/track/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.order) {
          setOrder(result.order)
        } else {
          toast.error('Order not found')
        }
      } else {
        toast.error('Order not found')
      }
    } catch (error) {
      toast.error('Error tracking order')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmed': return <Package className="w-5 h-5 text-blue-600" />
      case 'shipped': return <Truck className="w-5 h-5 text-purple-600" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'returned': return 'bg-orange-100 text-orange-800'
      case 'return_initiated': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter Order ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => trackOrder(orderId)} disabled={loading}>
                {loading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order._id.slice(-8)}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border-2 ${order.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Order Placed</span>
                  </div>
                  <p className="text-sm text-gray-600">Your order has been received</p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${order.status === 'confirmed' ? 'border-blue-300 bg-blue-50' : order.status === 'shipped' || order.status === 'delivered' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Confirmed</span>
                  </div>
                  <p className="text-sm text-gray-600">Order confirmed & processing</p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${order.status === 'shipped' ? 'border-purple-300 bg-purple-50' : order.status === 'delivered' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Shipped</span>
                  </div>
                  <p className="text-sm text-gray-600">Order is on the way</p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  order.status === 'delivered' ? 'border-green-300 bg-green-50' :
                  order.status === 'cancelled' ? 'border-red-300 bg-red-50' :
                  order.status === 'returned' ? 'border-orange-300 bg-orange-50' :
                  order.status === 'return_initiated' ? 'border-blue-300 bg-blue-50' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {order.status === 'cancelled' ? (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✕</span>
                      </div>
                    ) : order.status === 'returned' ? (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">↩</span>
                      </div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <span className="font-medium">
                      {order.status === 'cancelled' ? 'Cancelled' :
                       order.status === 'returned' ? 'Returned' :
                       order.status === 'return_initiated' ? 'Return Initiated' : 'Delivered'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.status === 'cancelled' ? 'Order was cancelled' :
                     order.status === 'returned' ? 'Order was returned' :
                     order.status === 'return_initiated' ? 'Return process started' :
                     'Order delivered successfully'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Details</h3>
                <div className="space-y-3">
                  {order.products?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.totalPrice?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {(order.cancelReason || order.returnReason) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Request Status</h3>
                  {order.cancelReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium text-red-800">Cancellation Request</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2">Reason: {order.cancelReason}</p>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        order.status === 'cancelled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'cancelled' ? 'Cancellation approved' : 'Pending Admin Review'}
                      </div>
                    </div>
                  )}
                  {order.returnReason && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-orange-800">Return Request</span>
                      </div>
                      <p className="text-sm text-orange-700 mb-2">Reason: {order.returnReason}</p>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        order.status === 'returned' ? 'bg-green-100 text-green-800' :
                        order.status === 'return_approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'return_initiated' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'returned' ? 'Return completed' :
                         order.status === 'return_approved' ? 'Return request has been approved, we will update you shortly' :
                         order.status === 'return_initiated' ? 'Return initiated' :
                         'Pending Admin Review'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {order.shippingDetails && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <p>{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                  <p>{order.shippingDetails.address}</p>
                  <p>{order.shippingDetails.city}, {order.shippingDetails.zipCode}</p>
                  <p>{order.shippingDetails.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}