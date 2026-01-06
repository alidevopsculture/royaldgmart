// Client-side payment functions
export async function createRazorpayOrderClient(amount: number) {
  try {
    // Get token from cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.success) {
      throw new Error(data?.message || 'Failed to create payment order');
    }
    
    return data;
  } catch (error: any) {
    console.error('createRazorpayOrderClient error:', error);
    throw new Error(error.message || 'Failed to create payment order');
  }
}

export async function verifyRazorpayPaymentClient(paymentData: any, orderId: string) {
  try {
    if (!paymentData) {
      throw new Error('Payment data is required');
    }
    
    // Get token from cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({ ...paymentData, orderId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.success) {
      throw new Error(data?.message || 'Payment verification failed');
    }
    
    return data;
  } catch (error: any) {
    console.error('verifyRazorpayPaymentClient error:', error);
    throw new Error(error.message || 'Payment verification failed');
  }
}