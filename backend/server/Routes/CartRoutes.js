const express = require('express');
const router = express.Router();
const Cart = require('../Models/CartSchema');
const Product = require('../Models/ProductSchema');

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    // Validate userId
    if (!req.params.userId || !require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Use the findOrCreate method
    let cart = await Cart.findOrCreate(req.params.userId);
    
    // Clean up any null/invalid products
    const validProducts = cart.products.filter(item => 
      item.product !== null && item.product !== undefined && require('mongoose').Types.ObjectId.isValid(item.product)
    );
    
    if (validProducts.length !== cart.products.length) {
      cart.products = validProducts;
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { product: productId, quantity = 1, size, color } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Validate userId and productId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find the product to get its price and other details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Use findOrCreate to get or create cart
    let cart = await Cart.findOrCreate(req.params.userId);

    // Check if product already exists in cart with the same size and color
    const existingItemIndex = cart.products.findIndex(item => 
      item.product && item.product.toString() === productId.toString() && 
      item.size === size && item.color === color
    );

    // Calculate price based on product and size
    let purchasePrice = product.price;
    if (size) {
      const sizeInfo = product.availableSizesColors.find(s => s.size === size);
      if (sizeInfo && sizeInfo.combination_price) {
        purchasePrice = sizeInfo.combination_price;
      }
    }

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      cart.products[existingItemIndex].quantity += quantity;
      cart.products[existingItemIndex].purchasePrice = purchasePrice;
      cart.products[existingItemIndex].totalPrice = purchasePrice * cart.products[existingItemIndex].quantity;
    } else {
      // Add new item to the cart
      const newItem = {
        product: productId,
        quantity,
        size: size || null,
        color: color || null,
        purchasePrice: purchasePrice,
        totalPrice: purchasePrice * quantity,
        priceWithTax: 0, // Will be calculated during checkout
        totalTax: 0, // Will be calculated during checkout
        status: 'Not processed'
      };
      cart.products.push(newItem);
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before sending response
    const populatedCart = await cart.populate('products.product');
    
    console.log('Product added to cart successfully:', {
      userId: req.params.userId,
      productId: productId,
      quantity: quantity
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update cart item
router.put('/:userId/update', async (req, res) => {
  try {
    const { productId, quantity, size, purchasePrice, totalPrice } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Validate IDs
    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    let cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(item =>
      item.product && item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Find the product to check if it's still available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Validate size if provided
    if (size !== undefined) {
      // If size is provided, check if it's valid for this product
      if (size !== null && product.availableSizesColors) {
        const sizeInfo = product.availableSizesColors.find(s => s.size === size);
        if (!sizeInfo) {
          return res.status(400).json({ message: 'Invalid size for this product' });
        }
      }
    }

    // Validate quantity if provided
    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Update item
    if (quantity !== undefined) {
      cart.products[itemIndex].quantity = quantity;
      // Recalculate totalPrice when quantity changes
      cart.products[itemIndex].totalPrice = cart.products[itemIndex].purchasePrice * quantity;
    }
    if (size !== undefined) cart.products[itemIndex].size = size;
    if (purchasePrice !== undefined) {
      cart.products[itemIndex].purchasePrice = purchasePrice;
      // Recalculate totalPrice when purchasePrice changes
      cart.products[itemIndex].totalPrice = purchasePrice * cart.products[itemIndex].quantity;
    }
    if (totalPrice !== undefined) cart.products[itemIndex].totalPrice = totalPrice;

    cart.updatedAt = Date.now();
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/:userId/remove/:productId', async (req, res) => {
  try {
    // Validate IDs
    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(item => 
      item.product && item.product.toString() !== req.params.productId.toString()
    );

    if (cart.products.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clean up corrupted cart
router.post('/:userId/cleanup', async (req, res) => {
  try {
    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove items with null/invalid products
    const validProducts = cart.products.filter(item => 
      item.product !== null && item.product !== undefined && require('mongoose').Types.ObjectId.isValid(item.product)
    );
    
    cart.products = validProducts;
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    
    res.json({ 
      message: 'Cart cleaned successfully', 
      cart: populatedCart,
      removedItems: cart.products.length - validProducts.length
    });
  } catch (error) {
    console.error('Error cleaning cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/:userId/clear', async (req, res) => {
  try {
    // Validate userId
    if (!require('mongoose').Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const cart = await Cart.findOne({ user: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;