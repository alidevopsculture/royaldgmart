import { Suspense } from 'react'
import OrderTracking from '@/components/component/order-tracking'

function OrderTrackingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function ShippingPage() {
  return (
    <Suspense fallback={<OrderTrackingFallback />}>
      <OrderTracking />
    </Suspense>
  )
}
