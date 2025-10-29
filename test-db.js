const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb+srv://himanshu89688_db_user:ieSv9qQg4jkSFnCo@cluster0.p0smm2e.mongodb.net/3d-viewer?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection().catch(console.error);
