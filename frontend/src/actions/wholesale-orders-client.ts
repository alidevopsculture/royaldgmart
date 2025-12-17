export async function createWholesaleOrderClient(shippingDetails: any, paymentMethod: string = 'cod', paymentScreenshot?: File | null) {
  try {
    console.log('Creating wholesale order with:', { shippingDetails, paymentMethod, hasScreenshot: !!paymentScreenshot });
    
    const formData = new FormData()
    formData.append('shippingDetails', JSON.stringify(shippingDetails))
    formData.append('paymentMethod', paymentMethod)
    
    if (paymentScreenshot) {
      formData.append('paymentScreenshot', paymentScreenshot)
      console.log('Added payment screenshot:', paymentScreenshot.name);
    }

    // Get token from cookie or try alternative methods
    let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    // If no token found in cookies, try to get it from localStorage as fallback
    if (!token) {
      token = localStorage.getItem('token') || undefined || undefined;
    }
    
    if (!token) {
      throw new Error('Please login to place wholesale order');
    }

    console.log('Making request to wholesale order API...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    console.log('Response status:', res.status);
    const result = await res.json()
    console.log('Response data:', result);
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to create wholesale order')
    }

    return result
  } catch (error: any) {
    console.error('Wholesale order creation error:', error)
    throw new Error(error.message || 'Failed to create wholesale order')
  }
}

export async function fetchUserWholesaleOrdersClient() {
  try {
    // Get token from cookie or localStorage
    let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) {
      token = localStorage.getItem('token') || undefined || undefined;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wholesale-orders/my-orders`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json()
    
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch wholesale orders')
    }
    
    return { success: true, orders: result.orders || [] }
  } catch (error: any) {
    console.error('Error fetching wholesale orders:', error)
    return { success: false, error: error.message, orders: [] }
  }
}
