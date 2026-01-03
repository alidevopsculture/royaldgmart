const { sendOrderStatusUpdate } = require('./server/utility/emailService');

// Test the email functionality
async function testEmailNotification() {
  try {
    console.log('Testing order status update email...');
    
    const result = await sendOrderStatusUpdate('test@example.com', {
      orderId: '507f1f77bcf86cd799439011',
      status: 'shipped',
      total: 1299.99,
      customerName: 'Test Customer'
    });
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed to send');
    }
  } catch (error) {
    console.error('❌ Error testing email:', error);
  }
}

testEmailNotification();