const express = require('express');
const router = express.Router();
const GuestCart = require('../Models/GuestCartSchema');
const Product = require('../Models/ProductSchema');
const { v4: uuidv4 } = require('uuid');

// Get guest wholesale cart by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    let cart = await GuestCart.findOrCreate(sessionId);
    
    // Filter only wholesale products and clean up invalid ones
    const wholesaleProducts = cart.products.filter(item => 
      item.product && 
      require('mongoose').Types.ObjectId.isValid(item.product) &&
      item.product.category === 'WHOLESALE'
    );
    
    const wholesaleCart = {
      ...cart.toObject(),
      products: wholesaleProducts
    };
    
    res.json(wholesaleCart);
  } catch (error) {
    console.error('Error fetching guest wholesale cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to guest wholesale cart
router.post('/:sessionId/add', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { product: productId, quantity = 1, size } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
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

    let cart = await GuestCart.findOrCreate(sessionId);

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
    
    console.log('Product added to guest wholesale cart successfully:', {
      sessionId: sessionId,
      productId: productId,
      quantity: quantity
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding product to guest wholesale cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;