'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck, Home, Star } from 'lucide-react'
import Link from 'next/link'

export default function WholesaleOrderConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const total = searchParams.get('total')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
    }
  }, [orderId, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Wholesale Order Confirmed!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your wholesale purchase
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Wholesale Order ID</p>
            <p className="font-mono text-lg font-semibold text-gray-900">
              #W{orderId?.slice(-8)}
            </p>
          </div>

          {total && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-amber-600">
                ₹{parseFloat(total).toFixed(2)}
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Wholesale Benefits</h4>
                <p className="text-sm text-green-700 mt-1">
                  You saved with wholesale pricing! Enjoy bulk discounts on your order.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">What's Next?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We'll process your wholesale order and send confirmation details via email.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Delivery Info</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Wholesale orders are delivered within 5-10 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href={`/wholesale-shipping?orderId=${orderId}`} className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Track Your Wholesale Order
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}