import { Suspense } from 'react'
import WholesaleOrderConfirmation from '@/components/component/wholesale-order-confirmation'

function WholesaleOrderConfirmationFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  )
}

export default function WholesaleOrderConfirmationPage() {
  return (
    <Suspense fallback={<WholesaleOrderConfirmationFallback />}>
      <WholesaleOrderConfirmation />
    </Suspense>
  )
}