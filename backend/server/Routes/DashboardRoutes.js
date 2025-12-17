const express = require('express');
const Order = require('../Models/OrdersSchema');
const User = require('../Models/UserModels');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const router = express.Router();

// Get dashboard statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate total sales
    const totalSalesResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    // Get new orders count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get top selling product
    const topProductResult = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { 
          _id: '$products.product', 
          totalSold: { $sum: '$products.quantity' } 
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
      { $lookup: { 
          from: 'products', 
          localField: '_id', 
          foreignField: '_id', 
          as: 'productInfo' 
        } 
      }
    ]);
    const topSellingProduct = topProductResult[0]?.productInfo[0]?.name || 'No data';

    // Get customer growth (new customers this month)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const customerGrowth = await User.countDocuments({
      createdAt: { $gte: thisMonth },
      role: 'customer'
    });

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id user total createdAt status products');

    const formattedOrders = recentOrders.map(order => ({
      _id: order._id,
      customer: order.user?.firstName 
        ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
        : order.user?.username || 'Unknown',
      date: order.createdAt,
      total: order.total,
      products: order.products.length,
      status: order.status
    }));

    res.json({
      totalSales: totalSales.toFixed(2),
      newOrders,
      topSellingProduct,
      customerGrowth,
      recentOrders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;