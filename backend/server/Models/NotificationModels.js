const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  offerText: {
    type: String,
    required: true,
    trim: true
  },
  buttonText: {
    type: String,
    required: true,
    trim: true
  },
  buttonLink: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: 'from-purple-600 to-pink-600'
  },
  textColor: {
    type: String,
    default: 'text-white'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);