const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Order = require('../Models/OrdersSchema');
const Cart = require('../Models/CartSchema');
const GuestCart = require('../Models/GuestCartSchema');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendAdminOrderNotification } = require('../utility/emailService');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/payment-screenshots');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Test auth endpoint
router.get('/test-auth', auth, async (req, res) => {
  res.json({ message: 'Auth working', user: req.user });
});

// Create new order
router.post('/create', auth, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    let { shippingDetails, paymentMethod = 'cod' } = req.body;
    
    console.log('Raw request body:', req.body);
    console.log('Raw shippingDetails type:', typeof shippingDetails);
    console.log('Raw shippingDetails value:', shippingDetails);
    
    // Parse shippingDetails if it's a string (from FormData)
    if (typeof shippingDetails === 'string') {
      try {
        shippingDetails = JSON.parse(shippingDetails);
        console.log('Parsed shippingDetails:', shippingDetails);
      } catch (e) {
        console.log('Failed to parse shippingDetails:', e);
        return res.status(400).json({ message: 'Invalid shipping details format' });
      }
    }
    
    const userId = req.user.id;
    console.log('Creating order for user:', req.user);
    console.log('User ID for order:', userId);
    console.log('Final shipping details:', shippingDetails);
    console.log('Payment method:', paymentMethod);
    console.log('Payment screenshot:', req.file ? req.file.filename : 'None');

    // Validate required fields
    if (!shippingDetails || !shippingDetails.firstName || !shippingDetails.email) {
      console.log('Validation failed:', {
        hasShippingDetails: !!shippingDetails,
        hasFirstName: shippingDetails ? !!shippingDetails.firstName : false,
        hasEmail: shippingDetails ? !!shippingDetails.email : false
      });
      return res.status(400).json({ message: 'Missing required shipping details' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    console.log('Found cart:', cart ? 'Yes' : 'No');
    console.log('Cart products count:', cart ? cart.products.length : 0);
    console.log('Cart details:', JSON.stringify(cart, null, 2));
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Filter out products that don't exist
    const validProducts = cart.products.filter(item => item.product);
    if (validProducts.length === 0) {
      return res.status(400).json({ message: 'No valid products in cart' });
    }

    // Calculate totals using valid products
    const subtotal = validProducts.reduce((total, item) => total + item.totalPrice, 0);
    const shipping = 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    // Create order
    const orderData = {
      user: userId,
      products: validProducts,
      shippingDetails,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    };
    
    // Add payment screenshot if provided
    if (req.file) {
      orderData.paymentScreenshot = req.file.filename;
      console.log('Payment screenshot saved:', req.file.filename);
    }
    
    const order = new Order(orderData);

    await order.save();
    console.log('Order created with ID:', order._id, 'for user:', order.user);

    // Send admin notification email
    try {
      const customerName = `${shippingDetails.firstName} ${shippingDetails.lastName}`;
      const shippingAddress = `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}, ${shippingDetails.country}`;
      
      console.log('Sending admin notification for order:', order._id);
      
      await sendAdminOrderNotification({
        orderId: order._id,
        customerName: customerName,
        customerEmail: shippingDetails.email,
        customerPhone: shippingDetails.phone,
        total: order.total,
        paymentMethod: order.paymentMethod,
        products: validProducts,
        shippingAddress: shippingAddress
      });
      
      console.log('Admin notification sent successfully for order:', order._id);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the order if email fails
    }

    // Cart is preserved - user must manually remove items
    // Note: Order confirmation email will be sent when admin confirms the order

    res.status(201).json({ 
      success: true,
      message: 'Order placed successfully',
      orderId: order._id,
      total: order.total
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// Public order tracking (no auth required)
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Tracking order:', orderId);
    
    const order = await Order.findById(orderId)
      .populate('products.product', 'name price images')
      .select('-user -__v'); // Exclude sensitive user data

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
});

// Get order status for payment polling
router.get('/:orderId/status', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).select('paymentStatus status');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ 
      paymentStatus: order.paymentStatus,
      orderStatus: order.status 
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ message: 'Failed to fetch order status' });
  }
});
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('User object:', req.user);
    console.log('Fetching orders for user ID:', userId);
    
    // First, let's see all orders in the database
    const allOrders = await Order.find({});
    console.log('All orders in DB:', allOrders.map(o => ({ id: o._id, user: o.user })));
    
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });

    console.log('Found orders for user:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Alternative route for user orders
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching orders for user ID:', userId);
    
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });

    console.log('Found orders for user:', orders.length);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get all orders (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find()
      .populate('user', 'username email firstName lastName phone')
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update order status (Admin only)
router.put('/admin/:orderId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log('Status update request:', { orderId, status, body: req.body });

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected', 'returned', 'return_approved', 'return_initiated'];
    console.log('Valid statuses:', validStatuses);
    console.log('Status is valid:', validStatuses.includes(status));
    
    if (!validStatuses.includes(status)) {
      console.log('Invalid status error:', status);
      return res.status(400).json({ message: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}` });
    }

    const updateData = { status };
    
    // Auto-complete payment for COD orders when delivered
    if (status === 'delivered') {
      const order = await Order.findById(orderId);
      if (order && order.paymentMethod === 'cod') {
        updateData.paymentStatus = 'completed';
      }
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'username email firstName lastName phone')
     .populate('products.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
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

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Delete order (Admin only)
router.delete('/:orderId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

// Cancel order
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    
    if (!cancelReason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason;
    order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Return order
router.put('/:orderId/return', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnReason, status } = req.body;
    
    if (!returnReason) {
      return res.status(400).json({ message: 'Return reason is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow returns for confirmed, delivered, or shipped orders
    if (!['confirmed', 'delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({ message: 'Only confirmed, delivered or shipped orders can be returned' });
    }

    order.status = 'return_initiated';
    order.returnReason = returnReason;
    order.returnInitiatedAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Return request submitted successfully' });
  } catch (error) {
    console.error('Error submitting return request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;