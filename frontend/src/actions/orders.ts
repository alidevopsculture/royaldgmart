export async function fetchUserOrdersClient() {
  try {
    // Get token from cookies for authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Call backend API directly, not the Next.js API route
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }

    const orders = await res.json();
    return { success: true, orders };
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message, orders: [] };
  }
}

export async function cancelOrder(orderId: string, cancelReason: string) {
  try {
    // Get token from cookies for authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ cancelReason })
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to cancel order')
    }

    return result
  } catch (error: any) {
    console.error('Cancel order error:', error)
    throw new Error(error.message || 'Failed to cancel order')
  }
}

export async function returnOrder(orderId: string, returnReason: string) {
  try {
    // Get token from cookies for authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ returnReason })
    })

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to return order')
    }

    return result
  } catch (error: any) {
    console.error('Return order error:', error)
    throw new Error(error.message || 'Failed to return order')
  }
}