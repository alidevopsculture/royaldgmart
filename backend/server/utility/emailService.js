const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  // Always log OTP in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    console.log(`\n=== OTP VERIFICATION ===`);
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`========================\n`);
  }
  
  // Production email sending
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Royal Digital Mart - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Royal Digital Mart!</h2>
        <p>Your verification code is:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const sendEmail = async (to, subject, text) => {
  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV MODE] Email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const sendOrderConfirmation = async (email, orderDetails) => {
  const orderIdShort = orderDetails.orderId.toString().slice(-8);
  const trackingId = orderDetails.orderId.toString();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Accepted - Royal Digital Mart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Order Accepted!</h2>
        <p>Your order has been accepted by Royal Digital Mart.</p>
        <div style="background: #F3F4F6; padding: 20px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderIdShort}</p>
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
        </div>
        <p>Use the Tracking ID to track your order at <a href="https://royaldgmart.com/shipping" style="color: #4F46E5;">Shipping Page</a></p>
        <p>We'll notify you once your order is shipped.</p>
        <p>Thank you for shopping with Royal Digital Mart!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return false;
  }
};

const sendWholesaleOrderConfirmation = async (email, orderDetails) => {
  const orderIdShort = orderDetails.orderId.toString().slice(-8);
  const trackingId = orderDetails.orderId.toString();
  const productsHtml = orderDetails.products.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Wholesale Order Confirmation - Royal Digital Mart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Wholesale Order Confirmed!</h2>
        <p>Dear ${orderDetails.customerName},</p>
        <p>Thank you for your wholesale order. Your order has been placed successfully.</p>
        
        <div style="background: #FEF3C7; padding: 20px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #W${orderIdShort}</p>
          <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${trackingId}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
        </div>

        <p>Use the Tracking ID to track your order at <a href="https://royaldgmart.com/wholesale-shipping" style="color: #F59E0B;">W-Shipping Page</a></p>

        <h3 style="color: #374151;">Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #F3F4F6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E5E7EB;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #E5E7EB;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E5E7EB;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <div style="background: #F3F4F6; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Subtotal:</span><span>₹${orderDetails.subtotal}</span></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between; color: #059669;"><span>Discount:</span><span>-₹${orderDetails.discount}</span></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Shipping:</span><span>₹${orderDetails.shipping}</span></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Tax:</span><span>₹${orderDetails.tax}</span></p>
          <p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 2px solid #D1D5DB; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;"><span>Total:</span><span>₹${orderDetails.total}</span></p>
        </div>

        <p>We'll notify you once your order is shipped.</p>
        <p>Thank you for choosing Royal Digital Mart for your wholesale needs!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Wholesale order confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Wholesale order confirmation email error:', error);
    return false;
  }
};

const sendOrderStatusUpdate = async (email, orderDetails) => {
  const orderIdShort = orderDetails.orderId.toString().slice(-8);
  const status = orderDetails.status;
  
  const statusMessages = {
    pending: { title: 'Order Received', message: 'Your order has been received and is being processed.' },
    confirmed: { title: 'Order Confirmed', message: 'Your order has been confirmed and will be prepared for shipping.' },
    shipped: { title: 'Order Shipped', message: 'Your order has been shipped and is on its way to you.' },
    delivered: { title: 'Order Delivered', message: 'Your order has been successfully delivered.' },
    cancelled: { title: 'Order Cancelled', message: 'Your order has been cancelled.' },
    returned: { title: 'Order Returned', message: 'Your return request has been processed.' }
  };

  const statusInfo = statusMessages[status] || { title: 'Order Update', message: `Your order status has been updated to ${status}.` };
  
  const statusColor = {
    pending: '#F59E0B',
    confirmed: '#3B82F6', 
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
    returned: '#F97316'
  }[status] || '#6B7280';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${statusInfo.title} - Royal Digital Mart`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${statusInfo.title}</h2>
        <p>Dear ${orderDetails.customerName},</p>
        <p>${statusInfo.message}</p>
        
        <div style="background: #F3F4F6; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
        </div>

        <p>You can track your order at <a href="https://royaldgmart.com/shipping" style="color: #4F46E5;">Shipping Page</a> using your Order ID.</p>
        
        ${status === 'shipped' ? '<p>Expected delivery: 3-5 business days</p>' : ''}
        ${status === 'delivered' ? '<p>Thank you for shopping with us! We hope you love your purchase.</p>' : ''}
        
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you for choosing Royal Digital Mart!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Order status update email error:', error);
    return false;
  }
};

const sendAdminOrderNotification = async (orderDetails) => {
  const orderIdShort = orderDetails.orderId.toString().slice(-8);
  const productsHtml = orderDetails.products.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">
        <a href="https://royaldgmart.com/product-view/${item.product?._id}" style="color: #4F46E5; text-decoration: none;">${item.product?.name || 'Unknown Product'}</a>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.size || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.color || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right;">₹${item.totalPrice}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Order Received - #${orderIdShort}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">🚨 New Order Alert!</h2>
        <p>A new order has been placed on Royal Digital Mart.</p>
        
        <div style="background: #FEF2F2; padding: 20px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
          <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${orderDetails.orderId}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${orderDetails.customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${orderDetails.customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderDetails.customerPhone}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${orderDetails.paymentMethod.toUpperCase()}</p>
        </div>

        <h3 style="color: #374151;">Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #F3F4F6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E5E7EB;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #E5E7EB;">Qty</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #E5E7EB;">Size</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #E5E7EB;">Color</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E5E7EB;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <div style="background: #F3F4F6; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Shipping Address:</strong></p>
          <p style="margin: 5px 0;">${orderDetails.shippingAddress}</p>
        </div>

        <p><strong>Action Required:</strong> Please review and confirm this order in the admin panel.</p>
        <p><a href="https://royaldgmart.com/dashboard/orders" style="color: #DC2626;">View Order in Admin Panel</a></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent for order ${orderIdShort}`);
    return true;
  } catch (error) {
    console.error('Admin notification email error:', error);
    return false;
  }
};

module.exports = { sendOTP, sendEmail, sendOrderConfirmation, sendWholesaleOrderConfirmation, sendOrderStatusUpdate, sendAdminOrderNotification };