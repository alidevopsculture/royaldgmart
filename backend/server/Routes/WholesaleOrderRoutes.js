const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WholesaleOrder = require('../Models/WholesaleOrderSchema');
const Cart = require('../Models/CartSchema');
const Product = require('../Models/ProductSchema');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const { sendWholesaleOrderConfirmation } = require('../utility/emailService');
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

// Create wholesale order
router.post('/create', auth, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { shippingDetails, paymentMethod = 'cod' } = req.body;
    const userId = req.user.id;
    
    console.log('Creating wholesale order for user:', userId);
    
    // Parse shippingDetails if it's a string (from FormData)
    let parsedShippingDetails;
    try {
      parsedShippingDetails = typeof shippingDetails === 'string' ? JSON.parse(shippingDetails) : shippingDetails;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid shipping details format' });
    }
    
    if (!parsedShippingDetails || !parsedShippingDetails.firstName || !parsedShippingDetails.email) {
      return res.status(400).json({ message: 'Missing required shipping details' });
    }

    // Get user's cart and filter wholesale products
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const wholesaleProducts = cart.products.filter(item => 
      item.product && item.product.category === 'WHOLESALE'
    );

    if (wholesaleProducts.length === 0) {
      return res.status(400).json({ message: 'No wholesale products in cart' });
    }

    // Get wholesale settings from latest wholesale product
    const latestWholesaleProduct = await Product.findOne({ category: 'WHOLESALE' })
      .sort({ createdAt: -1 })
      .select('wholesaleDiscount taxRate shippingCharges');
    
    const settings = {
      discountPercentage: latestWholesaleProduct?.wholesaleDiscount || 10,
      taxPercentage: latestWholesaleProduct?.taxRate || 18,
      shippingCharges: latestWholesaleProduct?.shippingCharges || 100
    };
    
    // Calculate totals with product settings
    const subtotal = wholesaleProducts.reduce((total, item) => total + item.totalPrice, 0);
    const discount = (subtotal * settings.discountPercentage) / 100;
    const discountedSubtotal = subtotal - discount;
    const shipping = settings.shippingCharges;
    const tax = (discountedSubtotal * settings.taxPercentage) / 100;
    const total = discountedSubtotal + shipping + tax;

    // Create wholesale order
    const orderData = {
      user: userId,
      products: wholesaleProducts,
      shippingDetails: parsedShippingDetails,
      subtotal,
      discount,
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
    }

    const order = new WholesaleOrder(orderData);
    await order.save();

    // Remove wholesale products from cart
    cart.products = cart.products.filter(item => 
      !item.product || item.product.category !== 'WHOLESALE'
    );
    await cart.save();

    // Note: Wholesale order confirmation email will be sent when admin confirms the order

    res.status(201).json({ 
      success: true,
      message: 'Wholesale order placed successfully',
      orderId: order._id,
      total: order.total
    });
  } catch (error) {
    console.error('Wholesale order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create wholesale order',
      error: error.message 
    });
  }
});

// Get user's wholesale orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await WholesaleOrder.find({ user: userId })
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching wholesale orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wholesale orders', orders: [] });
  }
});

// Cancel wholesale order
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    
    if (!cancelReason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const order = await WholesaleOrder.findById(orderId);
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

    res.json({ success: true, message: 'Wholesale order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling wholesale order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update wholesale order status (Admin only)
router.put('/admin/:orderId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log('Wholesale status update request:', { orderId, status, body: req.body });

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected', 'returned', 'return_approved', 'return_initiated'];
    console.log('Valid wholesale statuses:', validStatuses);
    console.log('Wholesale status is valid:', validStatuses.includes(status));
    
    if (!validStatuses.includes(status)) {
      console.log('Invalid wholesale status error:', status);
      return res.status(400).json({ message: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}` });
    }

    const updateData = { status };
    
    if (status === 'delivered') {
      const order = await WholesaleOrder.findById(orderId);
      if (order && order.paymentMethod === 'cod') {
        updateData.paymentStatus = 'completed';
      }
    }

    const order = await WholesaleOrder.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'username email firstName lastName phone')
     .populate('products.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, message: 'Wholesale order status updated', order });
  } catch (error) {
    console.error('Error updating wholesale order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update wholesale order status' });
  }
});

// Return wholesale order
router.put('/:orderId/return', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnReason } = req.body;
    
    if (!returnReason) {
      return res.status(400).json({ message: 'Return reason is required' });
    }

    const order = await WholesaleOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'delivered' && order.status !== 'shipped') {
      return res.status(400).json({ message: 'Only delivered or shipped orders can be returned' });
    }

    order.status = 'returned';
    order.returnReason = returnReason;
    order.returnedAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Return request submitted successfully' });
  } catch (error) {
    console.error('Error submitting return request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Track wholesale order by ID (public route)
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await WholesaleOrder.findById(orderId)
      .populate('products.product', 'name price images')
      .select('_id status createdAt updatedAt total shippingDetails paymentMethod paymentStatus products');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error tracking wholesale order:', error);
    res.status(500).json({ success: false, message: 'Failed to track order' });
  }
});

module.exports = router;