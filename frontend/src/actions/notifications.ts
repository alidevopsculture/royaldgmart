'use server'

import { cookies } from 'next/headers'

export interface NotificationData {
  _id?: string
  title: string
  description: string
  image: string
  offerText: string
  buttonText: string
  buttonLink: string
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export async function saveNotification(data: NotificationData) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'
    const response = await fetch(`${apiUrl}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to save notification')
    }

    return await response.json()
  } catch (error) {
    console.error('Error saving notification:', error)
    throw error
  }
}

export async function getNotification() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'
    const response = await fetch(`${apiUrl}/api/notifications/admin`)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching notification:', error)
    return null
  }
}

export async function getActiveNotification() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'
    const response = await fetch(`${apiUrl}/api/notifications`)
    
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching active notification:', error)
    return null
  }
}