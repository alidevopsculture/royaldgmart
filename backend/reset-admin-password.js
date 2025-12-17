require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./server/Models/UserModels');

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const newPassword = 'admin123'; // Change this to your desired password

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await User.updateOne(
            { email: adminEmail },
            { password: hashedPassword }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Admin password reset successfully!');
            console.log(`Email: ${adminEmail}`);
            console.log(`New Password: ${newPassword}`);
        } else {
            console.log('❌ Admin user not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();