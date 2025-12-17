'use server'

import { cookies } from 'next/headers'

export async function createWholesaleOrderClient(shippingDetails: any, paymentMethod: string = 'cod', paymentScreenshot?: File | null) {
  try {
    const formData = new FormData()
    formData.append('shippingDetails', JSON.stringify(shippingDetails))
    formData.append('paymentMethod', paymentMethod)
    
    if (paymentScreenshot) {
      formData.append('paymentScreenshot', paymentScreenshot)
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/create`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to create wholesale order')
    }

    return result
  } catch (error: any) {
    console.error('[ERROR] createWholesaleOrderClient:', error?.message || error);
    throw new Error(error.message || 'Failed to create wholesale order')
  }
}

export async function createWholesaleOrder(shippingDetails: any, paymentMethod: string = 'cod', paymentScreenshot?: File | null) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    const formData = new FormData()
    formData.append('shippingDetails', JSON.stringify(shippingDetails))
    formData.append('paymentMethod', paymentMethod)
    
    if (paymentScreenshot) {
      formData.append('paymentScreenshot', paymentScreenshot)
    }
    
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Cookie'] = `token=${token.value}`
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/create`, {
      method: 'POST',
      headers,
      body: formData
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to create wholesale order')
    }

    return result
  } catch (error: any) {
    console.error('[ERROR] createWholesaleOrder:', error?.message || error);
    throw new Error(error.message || 'Failed to create wholesale order')
  }
}

export async function fetchUserWholesaleOrders() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Cookie'] = `token=${token.value}`
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/my-orders`, {
      method: 'GET',
      headers
    });

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch wholesale orders')
    }
    
    return { success: true, orders: result.orders || result };
  } catch (error: any) {
    console.error('[ERROR] fetchUserWholesaleOrders:', error?.message || error);
    return { success: false, error: error.message, orders: [] };
  }
}

export async function cancelWholesaleOrder(orderId: string, cancelReason: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ cancelReason })
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to cancel wholesale order')
    }

    return result
  } catch (error: any) {
    console.error('[ERROR] cancelWholesaleOrder:', error?.message || error);
    throw new Error(error.message || 'Failed to cancel wholesale order')
  }
}

export async function returnWholesaleOrder(orderId: string, returnReason: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/${orderId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ returnReason })
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to return wholesale order')
    }

    return result
  } catch (error: any) {
    console.error('[ERROR] returnWholesaleOrder:', error?.message || error);
    throw new Error(error.message || 'Failed to return wholesale order')
  }
}

export async function fetchUserWholesaleOrdersClient() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/my-orders`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch wholesale orders')
    }
    
    return { success: true, orders: result.orders || result };
  } catch (error: any) {
    console.error('[ERROR] fetchUserWholesaleOrdersClient:', error?.message || error);
    return { success: false, error: error.message, orders: [] };
  }
}
