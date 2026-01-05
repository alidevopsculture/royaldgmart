const express = require('express');
const router = express.Router();
const GuestCart = require('../Models/GuestCartSchema');
const Cart = require('../Models/CartSchema');
const Product = require('../Models/ProductSchema');
const { v4: uuidv4 } = require('uuid');

// Generate guest session ID
router.post('/session', async (req, res) => {
  try {
    const sessionId = uuidv4();
    res.json({ sessionId });
  } catch (error) {
    console.error('Error generating session ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cart by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    // Use the findOrCreate method
    let cart = await GuestCart.findOrCreate(sessionId);
    
    // Clean up any null/invalid products
    const validProducts = cart.products.filter(item => 
      item.product && require('mongoose').Types.ObjectId.isValid(item.product)
    );
    
    if (validProducts.length !== cart.products.length) {
      cart.products = validProducts;
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to guest cart
router.post('/:sessionId/add', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { product: productId, quantity = 1, size, color } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    // Validate productId
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

    // Use findOrCreate to get or create guest cart
    let cart = await GuestCart.findOrCreate(sessionId);

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
    
    console.log('Product added to guest cart successfully:', {
      sessionId: sessionId,
      productId: productId,
      quantity: quantity
    });

    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding product to guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update guest cart item
router.put('/:sessionId/update', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity, size, purchasePrice, totalPrice } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    let cart = await GuestCart.findOne({ sessionId });

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
    if (quantity !== undefined) cart.products[itemIndex].quantity = quantity;
    if (size !== undefined) cart.products[itemIndex].size = size;
    if (purchasePrice !== undefined) cart.products[itemIndex].purchasePrice = purchasePrice;
    if (totalPrice !== undefined) cart.products[itemIndex].totalPrice = totalPrice;

    cart.updatedAt = Date.now();
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating guest cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from guest cart
router.delete('/:sessionId/remove/:productId', async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const cart = await GuestCart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(item => 
      item.product && item.product.toString() !== productId.toString()
    );

    if (cart.products.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    const populatedCart = await cart.populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error removing item from guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear guest cart
router.delete('/:sessionId/clear', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const cart = await GuestCart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clean up corrupted guest cart
router.post('/:sessionId/cleanup', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const cart = await GuestCart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove items with null/invalid products
    const validProducts = cart.products.filter(item => 
      item.product && require('mongoose').Types.ObjectId.isValid(item.product)
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
    console.error('Error cleaning guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Transfer guest cart to user cart after login
router.post('/:sessionId/transfer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!sessionId || sessionId.length === 0) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if guest cart exists before transfer
    const guestCart = await GuestCart.findOne({ sessionId }).populate('products.product');
    if (!guestCart) {
      return res.status(404).json({ message: 'No guest cart found to transfer' });
    }

    console.log('Guest cart before transfer:', {
      sessionId,
      itemCount: guestCart.products.length,
      items: guestCart.products.map(item => ({
        productId: item.product ? item.product._id : 'null',
        quantity: item.quantity,
        hasProduct: !!item.product
      }))
    });

    // Transfer guest cart to user cart
    const userCart = await GuestCart.transferToUserCart(sessionId, userId);
    
    if (!userCart) {
      return res.status(200).json({ message: 'No valid items to transfer' });
    }

    const populatedCart = await userCart.populate('products.product');
    
    console.log('Guest cart transferred successfully:', {
      sessionId: sessionId,
      userId: userId,
      itemsTransferred: populatedCart.products.length
    });

    res.json({ 
      message: 'Cart transferred successfully', 
      cart: populatedCart 
    });
  } catch (error) {
    console.error('Error transferring guest cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
