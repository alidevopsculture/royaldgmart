const { sendAdminOrderNotification } = require('./server/utility/emailService');

// Test admin notification email
async function testAdminNotification() {
  try {
    console.log('Testing admin notification email...');
    
    const result = await sendAdminOrderNotification({
      orderId: '507f1f77bcf86cd799439011',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      total: 1299.99,
      paymentMethod: 'cod',
      products: [
        {
          product: { name: 'Test Saree', _id: 'prod123' },
          quantity: 1,
          totalPrice: 1299.99
        }
      ],
      shippingAddress: 'Test Address, Test City, Test State 123456, India'
    });
    
    if (result) {
      console.log('✅ Admin notification sent successfully!');
    } else {
      console.log('❌ Admin notification failed to send');
    }
  } catch (error) {
    console.error('❌ Error testing admin notification:', error);
  }
}

testAdminNotification();