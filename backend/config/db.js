import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

    // Use in-memory MongoDB for local default when real MongoDB isn't available
    if (connStr.includes('localhost') || connStr.includes('127.0.0.1')) {
      try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (in-memory): ${conn.connection.host}`);
        return;
      } catch (memErr) {
        console.warn('In-memory MongoDB failed, trying configured URI:', memErr.message);
      }
    }

    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
