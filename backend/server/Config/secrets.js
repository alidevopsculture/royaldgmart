const { execSync } = require('child_process');

async function loadSecrets() {
  try {
    // Check if running in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Loading secrets from AWS Secrets Manager...');
      
      // Fetch secrets from AWS Secrets Manager
      const secretString = execSync(
        'aws secretsmanager get-secret-value --secret-id rdgm-backend-prod --region ap-south-1 --query SecretString --output text',
        { encoding: 'utf8' }
      );

      const secrets = JSON.parse(secretString);
      
      // Set environment variables from secrets
      process.env.MONGODB_URI = secrets.MONGODB_URI;
      process.env.ACCESS_TOKEN_SECRET = secrets.ACCESS_TOKEN_SECRET;
      process.env.REFRESH_TOKEN_SECRET = secrets.REFRESH_TOKEN_SECRET;
      process.env.ADMIN_EMAIL = secrets.ADMIN_EMAIL;
      process.env.ADMIN_PASSWORD = secrets.ADMIN_PASSWORD;
      process.env.AWS_ACCESS_KEY_ID = secrets.AWS_ACCESS_KEY_ID;
      process.env.AWS_SECRET_ACCESS_KEY = secrets.AWS_SECRET_ACCESS_KEY;
      process.env.S3_BUCKET_NAME = secrets.S3_BUCKET_NAME;
      process.env.AWS_REGION = secrets.AWS_REGION;
      process.env.EMAIL_USER = secrets.EMAIL_USER;
      process.env.EMAIL_PASS = secrets.EMAIL_PASS;
      
      console.log('✅ Secrets loaded successfully from AWS');
    } else {
      console.log('🔧 Development mode: Using local .env file');
    }
  } catch (error) {
    console.error('❌ Failed to load secrets from AWS:', error.message);
    console.log('📁 Falling back to local .env file');
  }
}

module.exports = { loadSecrets };