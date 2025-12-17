const nodemailer = require('nodemailer');

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
    subject: 'Order Confirmation - Royal Digital Mart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Order Confirmed!</h2>
        <p>Thank you for your order. Your order has been placed successfully.</p>
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

module.exports = { sendOTP, sendEmail, sendOrderConfirmation, sendWholesaleOrderConfirmation };