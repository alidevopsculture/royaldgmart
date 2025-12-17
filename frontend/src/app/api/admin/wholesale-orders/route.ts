import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesale-orders`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch wholesale orders' }, { status: 500 })
  }
}