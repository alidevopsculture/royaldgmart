import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
      method: 'GET',
      headers: {
        'Cookie': `token=${token}`,
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: response.status })
    }

    const orders = await response.json()
    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
