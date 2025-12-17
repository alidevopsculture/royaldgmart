const express = require('express');
const Review = require('../Models/ReviewSchema');
const { authenticateToken: auth } = require('../MiddleWare/auth');
const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    })
    .populate('user', 'firstName lastName username')
    .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment
    });

    await review.save();
    await review.populate('user', 'firstName lastName username');
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Get all reviews (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reviews = await Review.find()
      .populate('user', 'firstName lastName username email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Reply to review (Admin only)
router.put('/admin/:reviewId/reply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { reviewId } = req.params;
    const { adminReply } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { adminReply },
      { new: true }
    ).populate('user', 'firstName lastName username')
     .populate('product', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error replying to review:', error);
    res.status(500).json({ message: 'Failed to reply to review' });
  }
});

// Delete review (Admin only)
router.delete('/admin/:reviewId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router;