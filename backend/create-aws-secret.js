#!/usr/bin/env node

const { execSync } = require('child_process');
require('dotenv').config();

const secrets = {
  MONGODB_URI: process.env.MONGODB_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};

try {
  console.log('Creating AWS secret: rdgm-backend-prod');
  
  const command = `aws secretsmanager create-secret --name rdgm-backend-prod --description "RDGM Backend Production Secrets" --secret-string '${JSON.stringify(secrets)}' --region ap-south-1`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ AWS secret created successfully!');
} catch (error) {
  if (error.message.includes('ResourceExistsException')) {
    console.log('Secret already exists, updating...');
    try {
      const updateCommand = `aws secretsmanager update-secret --secret-id rdgm-backend-prod --secret-string '${JSON.stringify(secrets)}' --region ap-south-1`;
      execSync(updateCommand, { stdio: 'inherit' });
      console.log('✅ AWS secret updated successfully!');
    } catch (updateError) {
      console.error('❌ Failed to update secret:', updateError.message);
    }
  } else {
    console.error('❌ Failed to create secret:', error.message);
  }
}