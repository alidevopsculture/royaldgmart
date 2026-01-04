import { Suspense } from 'react'
import WholesaleOrderTracking from '@/components/component/wholesale-order-tracking'

function WholesaleOrderTrackingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  )
}

export default function WholesaleShippingPage() {
  return (
    <Suspense fallback={<WholesaleOrderTrackingFallback />}>
      <WholesaleOrderTracking />
    </Suspense>
  )
}
