const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      console.log('Admin details:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
    } else {
      // Create admin user
      const adminUser = new User({
        username: 'admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Please change the password after first login');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();