
import mongoose from 'mongoose'
const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
}

export const connectDB = async () => {
  try {
  await mongoose.connect(uri, { ...clientOptions, ssl: true, tls: true })
    await mongoose.connection.db.admin().command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

//mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN