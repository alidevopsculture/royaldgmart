require('dotenv').config();
const { MongoClient } = require('mongodb');

async function diagnoseConnection() {
    const uri = process.env.MONGODB_URI;
    console.log('🔍 Connection Diagnostics');
    console.log('========================');
    
    // Parse the URI to show components (without password)
    try {
        const url = new URL(uri);
        console.log('Protocol:', url.protocol);
        console.log('Host:', url.hostname);
        console.log('Username:', url.username);
        console.log('Password:', url.password ? '***' : 'NOT SET');
        console.log('Database:', url.pathname);
        console.log('Query params:', url.search);
        console.log('');
    } catch (e) {
        console.log('❌ Invalid URI format:', e.message);
        return;
    }
    
    // Try to connect with detailed error handling
    const client = new MongoClient(uri);
    
    try {
        console.log('⏳ Attempting connection...');
        await client.connect();
        console.log('✅ Connection successful!');
        
        // Test admin command
        const admin = client.db('admin');
        const result = await admin.command({ ping: 1 });
        console.log('✅ Ping successful:', result);
        
    } catch (error) {
        console.log('❌ Connection failed:');
        console.log('Error name:', error.name);
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        
        if (error.code === 8000 || error.codeName === 'AtlasError') {
            console.log('\n🚨 Authentication Error Detected!');
            console.log('This means one of the following:');
            console.log('1. Username or password is incorrect');
            console.log('2. Database user does not exist');
            console.log('3. Database user does not have proper permissions');
            console.log('\nPlease verify in MongoDB Atlas:');
            console.log('- Database Access → Check if user "ialimurtaza007" exists');
            console.log('- Network Access → Check if your IP is whitelisted');
        } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_NONAME') {
            console.log('\n🌐 Network/DNS Error Detected!');
            console.log('- Check your internet connection');
            console.log('- Verify the cluster hostname is correct');
        }
    } finally {
        await client.close();
    }
}

diagnoseConnection();