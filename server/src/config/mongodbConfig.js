import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const uri = process.env.MONGODB_URI || 'mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN'

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  ssl: true,
  tls: true,
  retryWrites: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  directConnection: false,
  replicaSet: 'atlas-gepn3u-shard-0',  // từ lỗi log của bạn
  authMechanism: 'SCRAM-SHA-1'
}

export const connectDB = async () => {
  try {
    console.log('Attempting MongoDB connection...')
    const conn = await mongoose.connect(uri, clientOptions)
    console.log('✅MongoDB Connected:', conn.connection.host)
    return conn
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code
    })
    throw error
  }
}