import { MongoClient } from 'mongodb';

async function testConnection() {
  try {
    // Connection details
    const username = 'himanshu89688_db_user';
    const password = 'ieSv9qQg4jkSFnCo';  // Note: In production, use environment variables
    const cluster = 'cluster0.p0smm2e.mongodb.net';
    const dbName = '3d-viewer';
    
    // Construct connection string
    const uri = mongodb+srv://:@/?retryWrites=true&w=majority;
    
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,  // 5 seconds timeout
      connectTimeoutMS: 10000,        // 10 seconds connection timeout
    });

    // Test connection
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database info
    const db = client.db();
    console.log('📊 Database Name:', db.databaseName);
    
    // List collections
    try {
      const collections = await db.listCollections().toArray();
      console.log('📂 Collections:', collections.map(c => c.name).join(', ') || 'No collections found');
    } catch (colError) {
      console.warn('⚠️ Could not list collections. Check database permissions.');
      console.error('Collection error:', colError.message);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Additional debug info
    if (error.code === 'ENOTFOUND') {
      console.log('🔍 Network issue: Could not resolve hostname. Check your internet connection.');
    } else if (error.code === 'ETIMEOUT') {
      console.log('⏱️  Connection timeout. Check if your IP is whitelisted in MongoDB Atlas.');
    } else if (error.message.includes('bad auth') || error.code === 8000) {
      console.log('🔑 Authentication failed. Please check:');
      console.log('1. Username and password are correct');
      console.log('2. The database user has proper permissions');
      console.log('3. The password is URL-encoded if it contains special characters');
    }
    
    return { success: false, error };
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the test
testConnection().then(({ success }) => {
  process.exit(success ? 0 : 1);
});
