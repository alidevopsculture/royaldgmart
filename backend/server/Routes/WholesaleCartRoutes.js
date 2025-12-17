const express = require('express');
const router = express.Router();
const Cart = require('../Models/CartSchema');
const Product = require('../Models/ProductSchema');

// Get wholesale cart by user ID with calculations
router.get('/:userId', async (req, res) => {
  try {
    if (!req.params.userId || !require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    let cart = await Cart.findOrCreate(req.params.userId);
    
    // Filter only wholesale products
    const wholesaleProducts = cart.products.filter(item => 
      item.product && item.product.category === 'WHOLESALE'
    );
    
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
    const tax = (discountedSubtotal * settings.taxPercentage) / 100;
    const shipping = settings.shippingCharges;
    const total = discountedSubtotal + tax + shipping;
    
    const wholesaleCart = {
      ...cart.toObject(),
      products: wholesaleProducts,
      calculations: {
        subtotal,
        discount,
        discountPercentage: settings.discountPercentage,
        tax,
        taxPercentage: settings.taxPercentage,
        shipping,
        shippingCharges: settings.shippingCharges,
        total
      }
    };
    
    res.json(wholesaleCart);
  } catch (error) {
    console.error('Error fetching wholesale cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to wholesale cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { product: productId, quantity = 1, size } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.category !== 'WHOLESALE') {
      return res.status(400).json({ message: 'Product is not a wholesale item' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    let cart = await Cart.findOrCreate(req.params.userId);

    const existingItemIndex = cart.products.findIndex(item => 
      item.product && item.product.toString() === productId.toString() && item.size === size
    );

    let purchasePrice = product.price;
    if (size) {
      const sizeInfo = product.availableSizesColors.find(s => s.size === size);
      if (sizeInfo && sizeInfo.combination_price) {
        purchasePrice = sizeInfo.combination_price;
      }
    }

    if (existingItemIndex !== -1) {
      cart.products[existingItemIndex].quantity += quantity;
      cart.products[existingItemIndex].purchasePrice = purchasePrice;
      cart.products[existingItemIndex].totalPrice = purchasePrice * cart.products[existingItemIndex].quantity;
    } else {
      const newItem = {
        product: productId,
        quantity,
        size: size || null,
        purchasePrice: purchasePrice,
        totalPrice: purchasePrice * quantity,
        priceWithTax: 0,
        totalTax: 0,
        status: 'Not processed'
      };
      cart.products.push(newItem);
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    
    console.log('Product added to wholesale cart successfully:', {
      userId: req.params.userId,
      productId: productId,
      quantity: quantity
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding product to wholesale cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;