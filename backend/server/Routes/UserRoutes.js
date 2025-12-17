const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require("../Models/UserModels");
const Otp = require("../Models/OtpSchema");
const jwt = require("jsonwebtoken");
const { sendOTP, sendEmail } = require('../utility/emailService');
const router = express.Router();

// Send OTP for signup
router.post('/send-otp',
  [
    check('email').isEmail().withMessage('Invalid email address')
  ],
  async (req, res) => {
    console.log('📧 Send OTP request received');
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      console.log('📧 Email:', email);
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('⚠️ Email already registered');
        return res.status(400).json({ errors: [{ msg: 'Email already registered!' }] });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔢 OTP generated');
      
      // Save OTP to database
      await Otp.findOneAndDelete({ email }); // Remove existing OTP
      const otpDoc = new Otp({ email, otp });
      await otpDoc.save();
      console.log('💾 OTP saved to database');

      // Send OTP via email
      console.log('📤 Sending OTP email...');
      const emailSent = await sendOTP(email, otp);
      console.log('📤 Email sent result:', emailSent);
      
      if (!emailSent) {
        console.log('❌ Failed to send email');
        return res.status(500).json({ errors: [{ msg: 'Failed to send OTP' }] });
      }

      console.log('✅ About to send response');
      res.json({ message: 'OTP sent successfully' });
      console.log('✅ Response sent successfully');
    } catch (error) {
      console.error('💥 Error in send-otp:', error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Verify OTP and complete signup
router.post('/signup',
  [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    check('username').notEmpty().withMessage('Username is required'),
    check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res, next) => {
    const { email, password, username, confirmPassword, otp, role } = req.body;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify OTP
      const otpDoc = await Otp.findOne({ email, otp });
      if (!otpDoc) {
        return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
      }

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
      }

      user = new User({
        email,
        password,
        username,
        confirmPassword,
        role: email === process.env.ADMIN_EMAIL ? 'admin' : 'customer'
      });

      await user.save();
      
      // Delete OTP after successful signup
      await Otp.findOneAndDelete({ email, otp });
      
      const accessToken = generateAccessToken({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

      res.status(201).json({ accessToken: accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10d" });
}


let refreshTokens = [];

function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "10d" });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

router.post("/refreshToken", (req, res) => {
  if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid");
  refreshTokens = refreshTokens.filter(c => c != req.body.token);
  const accessToken = generateAccessToken({
    user: req.body.user
  });
  const refreshToken = generateRefreshToken({
    user: req.body.user
  });

  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

router.post('/login',
  [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Login attempt for:', req.body.email);
      console.log('Password provided:', req.body.password ? 'YES' : 'NO');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log('✅ Validation passed');
      console.log('🔍 Finding user in database...');
      
      let user = await User.findOne({ email });
      if (!user) {
        console.log('❌ User not found in database for email:', email);
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        hasPassword: user.password ? 'YES' : 'NO'
      });

      console.log('🔐 Comparing password...');
      console.log('Input password:', password);
      console.log('Stored hash length:', user.password ? user.password.length : 'NO HASH');
      
      let isMatch;
      try {
        console.log('⏳ Starting bcrypt.compare...');
        isMatch = await bcrypt.compare(password, user.password);
        console.log('✅ bcrypt.compare completed');
        console.log('Password match result:', isMatch);
      } catch (bcryptError) {
        console.error('❌ bcrypt.compare failed:', bcryptError);
        console.error('bcrypt error stack:', bcryptError.stack);
        return res.status(500).json({ errors: [{ msg: 'Authentication error' }] });
      }
      
      if (!isMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      console.log('✅ Password matched');
      console.log('🎫 Generating JWT token...');
      
      // Check if secrets are loaded
      console.log('ACCESS_TOKEN_SECRET available:', process.env.ACCESS_TOKEN_SECRET ? 'YES' : 'NO');
      console.log('ACCESS_TOKEN_SECRET length:', process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET.length : 0);
      
      const accessToken = generateAccessToken({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

      console.log('✅ Token generated successfully');
      console.log('Token length:', accessToken ? accessToken.length : 0);
      console.log('=== LOGIN SUCCESSFUL ===');
      
      res.json({ accessToken: accessToken });
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, errors: [{ msg: 'No token provided' }] });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, errors: [{ msg: 'User not found' }] });
    }

    res.json({ success: true, user: user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, errors: [{ msg: 'Invalid token' }] });
  }
});


// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ errors: [{ msg: 'No token provided' }] });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.user.id;

    const { firstName, lastName, phone, address, city, zipCode, country } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, address, city, zipCode, country },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Forgot password - send reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt: otpExpiry },
      { upsert: true, new: true }
    );

    await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`
    );

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await Otp.deleteOne({ email });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;
