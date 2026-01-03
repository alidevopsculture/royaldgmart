const express = require('express');
const Order = require('../Models/OrdersSchema');
const WholesaleOrder = require('../Models/WholesaleOrderSchema');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const { sendOrderStatusUpdate, sendOrderConfirmation } = require('../utility/emailService');
const router = express.Router();

// Get all regular orders (Admin only)
router.get('/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update regular order status (Admin only)
router.put('/orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'username email firstName lastName phone')
     .populate('products.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Send email notification to customer
    try {
      const customerEmail = order.shippingDetails.email;
      const customerName = `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`;
      
      if (status === 'confirmed') {
        // Send order confirmation email when admin confirms the order
        await sendOrderConfirmation(customerEmail, {
          orderId: order._id,
          total: order.total,
          paymentMethod: order.paymentMethod
        });
        console.log(`Order confirmation email sent to ${customerEmail}`);
      } else {
        // Send status update email for other status changes
        await sendOrderStatusUpdate(customerEmail, {
          orderId: order._id,
          status: order.status,
          total: order.total,
          customerName: customerName
        });
        console.log(`Status update email sent to ${customerEmail}`);
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the status update if email fails
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete regular order (Admin only)
router.delete('/orders/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all wholesale orders (Admin only)
router.get('/wholesale-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const orders = await WholesaleOrder.find()
      .populate('user', 'username email')
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update wholesale order status (Admin only)
router.put('/wholesale-orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { status } = req.body;
    const order = await WholesaleOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'username email firstName lastName phone')
     .populate('products.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Send email notification to customer for wholesale orders
    try {
      const customerEmail = order.shippingDetails.email;
      const customerName = `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`;
      
      if (status === 'confirmed') {
        // Send order confirmation email when admin confirms the wholesale order
        await sendOrderConfirmation(customerEmail, {
          orderId: order._id,
          total: order.total,
          paymentMethod: order.paymentMethod
        });
        console.log(`Wholesale order confirmation email sent to ${customerEmail}`);
      } else {
        // Send status update email for other status changes
        await sendOrderStatusUpdate(customerEmail, {
          orderId: order._id,
          status: order.status,
          total: order.total,
          customerName: customerName
        });
        console.log(`Wholesale status update email sent to ${customerEmail}`);
      }
    } catch (emailError) {
      console.error('Failed to send wholesale email:', emailError);
      // Don't fail the status update if email fails
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete wholesale order (Admin only)
router.delete('/wholesale-orders/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const order = await WholesaleOrder.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Wholesale order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;