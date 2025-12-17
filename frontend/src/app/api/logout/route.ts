import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ERROR] logout API:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}