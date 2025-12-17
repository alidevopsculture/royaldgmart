export async function createOrder(shippingDetails: any, paymentMethod: string = 'cod', paymentScreenshot?: File | null) {
  try {
    console.log('Creating order with:', { shippingDetails, paymentMethod, hasScreenshot: !!paymentScreenshot })
    
    // Validate API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }
    
    const formData = new FormData()
    formData.append('shippingDetails', JSON.stringify(shippingDetails))
    formData.append('paymentMethod', paymentMethod)
    
    if (paymentScreenshot) {
      formData.append('paymentScreenshot', paymentScreenshot)
    }
    
    // Get token from cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    console.log('Making request to:', `${apiUrl}/api/orders/create`);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }
    
    const res = await fetch(`${apiUrl}/api/orders/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    console.log('Response status:', res.status)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))
    
    let result
    const contentType = res.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      result = await res.json()
    } else {
      result = await res.text()
      console.log('Non-JSON response:', result)
    }
    
    console.log('Response body:', result)
    
    if (!res.ok) {
      let errorMsg = 'Failed to create order'
      
      if (typeof result === 'object' && result.message) {
        errorMsg = result.message
      } else if (typeof result === 'object' && result.error) {
        errorMsg = result.error
      } else if (typeof result === 'string') {
        errorMsg = result
      }
      
      // Handle specific HTTP status codes
      if (res.status === 401) {
        errorMsg = 'Please log in to place an order'
      } else if (res.status === 400) {
        errorMsg = errorMsg || 'Invalid order data'
      } else if (res.status === 500) {
        errorMsg = 'Server error. Please try again later.'
      }
      
      throw new Error(errorMsg)
    }

    // Validate response structure
    if (typeof result !== 'object' || !result.orderId) {
      throw new Error('Invalid response from server')
    }

    return result
  } catch (error: any) {
    console.error('[ERROR] createOrder:', error?.message || error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    
    throw new Error(error.message || 'Failed to create order')
  }
}