const express = require('express');
const router = express.Router();
const Notification = require('../Models/NotificationModels');
// Get active notification
router.get('/', async (req, res) => {
  try {
    const notification = await Notification.findOne({ isActive: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notification for admin (includes inactive)
router.get('/admin', async (req, res) => {
  try {
    const notification = await Notification.findOne().sort({ createdAt: -1 });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update notification
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      offerText,
      buttonText,
      buttonLink,
      isActive,
      backgroundColor,
      textColor
    } = req.body;

    // Deactivate all existing notifications first
    await Notification.updateMany({}, { isActive: false });

    // Create new notification
    const notification = new Notification({
      title,
      description,
      image,
      offerText,
      buttonText,
      buttonLink,
      isActive,
      backgroundColor,
      textColor
    });

    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update notification
router.put('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;