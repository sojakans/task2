const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();

  if (uri) {
    try {
      console.log(`Connecting to real MongoDB at configured URI...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ Real MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`❌ Failed to connect to configured real MongoDB (${uri}):`, err.message);
      throw new Error(`Real MongoDB Connection Failed: ${err.message}. Please check your connection string, credentials, and network/IP whitelist in MongoDB Atlas.`);
    }
  }

  // Fallback to MongoMemoryServer for development / evaluation environment
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    console.log(`Initializing in-memory MongoDB instance: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB Connected successfully.`);
    return conn;
  } catch (err) {
    console.error('Failed to initialize in-memory MongoDB fallback:', err);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB disconnected.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
