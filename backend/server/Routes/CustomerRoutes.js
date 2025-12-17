const express = require('express');
const User = require('../Models/UserModels');
const Order = require('../Models/OrdersSchema');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const router = express.Router();

// Get all customers (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const customers = await User.find({ role: 'customer' })
      .select('username email firstName lastName phone createdAt')
      .sort({ createdAt: -1 });

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

        return {
          _id: customer._id,
          name: customer.firstName 
            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
            : customer.username,
          email: customer.email,
          phone: customer.phone || 'N/A',
          totalOrders,
          totalSpent: totalSpent.toFixed(2),
          joinedDate: customer.createdAt
        };
      })
    );

    res.json(customersWithStats);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

module.exports = router;