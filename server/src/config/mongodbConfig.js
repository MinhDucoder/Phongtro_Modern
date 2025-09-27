
import mongoose from 'mongoose'
const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
}

export const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      ...clientOptions,
      ssl: true,
      tls: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Stack:', error.stack);
    console.log('⚠️  Server will continue running but database operations will fail.');
    return false;
  }
};
