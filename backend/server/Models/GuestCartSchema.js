const mongoose = require('mongoose');

// Define CART_ITEM_STATUS locally to avoid import issues
const CART_ITEM_STATUS = {
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Not_processed: 'Not processed'
};

const GuestCartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  }, 
  purchasePrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  priceWithTax: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: CART_ITEM_STATUS.Not_processed,
    enum: Object.values(CART_ITEM_STATUS)
  }
});

const GuestCartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  products: {
    type: [GuestCartItemSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // Expires after 7 days (in seconds)
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
GuestCartSchema.index({ sessionId: 1 });
GuestCartSchema.index({ 'products.product': 1 });
GuestCartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // TTL index

// Pre-save middleware to update the updatedAt field
GuestCartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create guest cart
GuestCartSchema.statics.findOrCreate = async function(sessionId) {
  let cart = await this.findOne({ sessionId }).populate('products.product');
  
  if (!cart) {
    try {
      cart = new this({
        sessionId,
        products: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      await cart.save();
    } catch (error) {
      // Handle duplicate key error - cart was created by another request
      if (error.code === 11000) {
        cart = await this.findOne({ sessionId }).populate('products.product');
      } else {
        throw error;
      }
    }
  }
  
  return cart;
};

// Static method to transfer guest cart to user cart
GuestCartSchema.statics.transferToUserCart = async function(sessionId, userId) {
  const Cart = require('./CartSchema');
  
  // Find the guest cart with populated products
  const guestCart = await this.findOne({ sessionId }).populate('products.product');
  
  if (!guestCart || guestCart.products.length === 0) {
    return null; // No guest cart to transfer
  }
  
  // Filter out items with null/invalid products
  const validItems = guestCart.products.filter(item => 
    item.product && item.product._id && mongoose.Types.ObjectId.isValid(item.product._id)
  );
  
  if (validItems.length === 0) {
    // Delete the guest cart if no valid items
    await this.deleteOne({ sessionId });
    return null;
  }
  
  // Find or create user cart
  let userCart = await Cart.findOrCreate(userId);
  
  // Transfer valid items from guest cart to user cart
  for (const guestItem of validItems) {
    const productId = guestItem.product._id.toString();
    
    // Check if product already exists in user cart with same size and color
    const existingItemIndex = userCart.products.findIndex(item => 
      item.product && item.product.toString() === productId && 
      item.size === guestItem.size && item.color === guestItem.color
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      userCart.products[existingItemIndex].quantity += guestItem.quantity;
      userCart.products[existingItemIndex].totalPrice = 
        userCart.products[existingItemIndex].purchasePrice * userCart.products[existingItemIndex].quantity;
    } else {
      // Add new item to user cart
      const newItem = {
        product: productId,
        quantity: guestItem.quantity,
        size: guestItem.size,
        color: guestItem.color,
        purchasePrice: guestItem.purchasePrice,
        totalPrice: guestItem.totalPrice,
        priceWithTax: guestItem.priceWithTax,
        totalTax: guestItem.totalTax,
        status: guestItem.status
      };
      userCart.products.push(newItem);
    }
  }
  
  userCart.updatedAt = Date.now();
  await userCart.save();
  
  // Delete the guest cart after successful transfer
  await this.deleteOne({ sessionId });
  
  return userCart;
};

const GuestCart = mongoose.model('GuestCart', GuestCartSchema);

module.exports = GuestCart;
