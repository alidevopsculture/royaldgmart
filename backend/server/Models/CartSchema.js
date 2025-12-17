const mongoose = require('mongoose');

// Define CART_ITEM_STATUS locally to avoid import issues
const CART_ITEM_STATUS = {
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Not_processed: 'Not processed'
};

const CartItemSchema = new mongoose.Schema({
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

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: {
    type: [CartItemSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
CartSchema.index({ user: 1 });
CartSchema.index({ 'products.product': 1 });

// Pre-save middleware to update the updatedAt field
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create cart
CartSchema.statics.findOrCreate = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('products.product');
  
  if (!cart) {
    cart = new this({
      user: userId,
      products: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    await cart.save();
  }
  
  return cart;
};

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;