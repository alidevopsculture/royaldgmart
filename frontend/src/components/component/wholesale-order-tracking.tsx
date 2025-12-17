'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Truck, CheckCircle, Clock, Search, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function WholesaleOrderTracking() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
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
      const response = await fetch(`/api/wholesale-orders/track/${id}`)
      const data = await response.json()
      
      if (data.success && data.order) {
        setOrder(data.order)
      } else {
        toast.error('Wholesale order not found')
      }
    } catch (error) {
      toast.error('Error tracking wholesale order')
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-900">Track Wholesale Order</h1>
        </div>

        <Card className="mb-6 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Search className="w-5 h-5" />
              Enter Wholesale Order ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your wholesale order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => trackOrder(orderId)} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                {loading ? 'Tracking...' : 'Shipping'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {order && (
          <Card className="border-amber-200">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-amber-900">Wholesale Order #W{order._id.slice(-8)}</CardTitle>
                  <p className="text-amber-700 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 text-amber-900">Wholesale Order Details</h3>
                <div className="space-y-3">
                  {order.products?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">Qty: {item.quantity}</Badge>
                          <Badge className="text-xs bg-amber-100 text-amber-800">WHOLESALE</Badge>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.totalPrice?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {order.shippingDetails && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-amber-900">Shipping Address</h3>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="font-medium">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                    <p>{order.shippingDetails.address}</p>
                    <p>{order.shippingDetails.city}, {order.shippingDetails.zipCode}</p>
                    <p>{order.shippingDetails.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
