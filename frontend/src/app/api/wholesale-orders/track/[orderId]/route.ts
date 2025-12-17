import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'
    const response = await fetch(`${backendUrl}/api/wholesale-orders/track/${orderId}`)
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error tracking wholesale order:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to track order' },
      { status: 500 }
    )
  }
}
