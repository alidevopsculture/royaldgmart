// server/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongodbURI = process.env.MONGODB_URI;
    
    if (!mongodbURI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(mongodbURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
