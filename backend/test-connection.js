require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();