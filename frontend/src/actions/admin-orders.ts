'use server'

export async function getAdminOrders() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error deleting order:', error)
    return { success: false, error: 'Failed to delete order' }
  }
}