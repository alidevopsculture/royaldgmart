const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const Order = require('../Models/OrdersSchema');
const Cart = require('../Models/CartSchema');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', auth, async (req, res) => {
  try {
    console.log('Creating Razorpay order with body:', req.body);
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount provided' });
    }
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ success: false, message: 'Payment service not configured' });
    }

    const options = {
      amount: Math.round(amount * 100), // Ensure integer
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    };

    console.log('Razorpay order options:', options);
    const razorpayOrder = await razorpay.orders.create(options);
    console.log('Razorpay order created:', razorpayOrder.id);
    
    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

router.post('/verify-payment', auth, async (req, res) => {
  try {
    console.log('Verifying payment with body:', req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' });
    }
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log('Payment signature verification:', {
      received: razorpay_signature,
      expected: expectedSign,
      match: razorpay_signature === expectedSign
    });

    if (razorpay_signature === expectedSign) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'completed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        });
        console.log('Order updated with payment details:', orderId);
        
        // Cart is preserved - user must manually remove items
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      console.error('Payment signature mismatch');
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

module.exports = router;