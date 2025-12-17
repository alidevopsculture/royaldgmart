const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductSchema');

// Get wholesale settings from the latest wholesale product
router.get('/', async (req, res) => {
  try {
    const latestWholesaleProduct = await Product.findOne({ category: 'WHOLESALE' })
      .sort({ createdAt: -1 })
      .select('wholesaleDiscount taxRate shippingCharges');
    
    if (!latestWholesaleProduct) {
      return res.json({
        wholesaleDiscount: 10,
        taxRate: 18,
        shippingCharges: 100
      });
    }
    
    res.json({
      wholesaleDiscount: latestWholesaleProduct.wholesaleDiscount || 10,
      taxRate: latestWholesaleProduct.taxRate || 18,
      shippingCharges: latestWholesaleProduct.shippingCharges || 100
    });
  } catch (error) {
    console.error('Error fetching wholesale settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;