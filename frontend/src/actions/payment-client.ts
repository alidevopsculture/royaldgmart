// Client-side payment functions
export async function createRazorpayOrderClient(amount: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create payment order');
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create payment order');
  }
}

export async function verifyRazorpayPaymentClient(paymentData: any, orderId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...paymentData, orderId }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Payment verification failed');
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Payment verification failed');
  }
}