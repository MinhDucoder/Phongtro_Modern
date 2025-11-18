import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Test configuration
export const testConfig = {
  mongoUri: process.env.MONGODB_URI || "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN",
  jwtSecret: process.env.JWT_SECRET || "asdfsadfsadf",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "asdfkljhasdfsadf",
  appPort: process.env.APP_PORT || 5000,
  appHost: process.env.APP_HOST || "localhost",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  meilisearch: {
    host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "masterKey",
    index: process.env.MEILISEARCH_INDEX || "posts",
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  pythonRsApi: process.env.PYTHON_RS_API_URL || "http://localhost:6000",
};

// Connect MongoDB
export async function connectTestDb() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testConfig.mongoUri);
      console.log("✅ Test MongoDB connected");
    }
  } catch (err) {
    console.error("❌ Test MongoDB connection failed:", err.message);
    throw err;
  }
}

// Disconnect MongoDB
export async function disconnectTestDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("✅ Test MongoDB disconnected");
    }
  } catch (err) {
    console.error("❌ Test MongoDB disconnection failed:", err.message);
  }
}

// Clear database collections
export async function clearDatabase() {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("✅ Database cleared");
  } catch (err) {
    console.error("❌ Clear database failed:", err.message);
  }
}

// Create test user
export async function createTestUser(userModel) {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "Test@123456",
    full_name: "Test User",
    phone: "0123456789",
    role: "user",
  };
  
  const user = await userModel.create(testUser);
  return { ...testUser, _id: user._id, id: user._id };
}

// Create test landlord
export async function createTestLandlord(userModel) {
  const testLandlord = {
    email: `landlord-${Date.now()}@example.com`,
    password: "Landlord@123456",
    full_name: "Test Landlord",
    phone: "0987654321",
    role: "landlord",
  };
  
  const user = await userModel.create(testLandlord);
  return { ...testLandlord, _id: user._id, id: user._id };
}

// Create test room
export async function createTestRoom(roomModel, landlordId) {
  const testRoom = {
    title: "Phòng trọ đẹp 20m2 gần trường ĐH",
    description: "Phòng trọ sạch sẽ, không khí thoáng mát",
    price: 2500000,
    area: 20,
    address: "123 Nguyễn Hữu Cảnh, Q. Bình Thạnh, TPHCM",
    city: "Ho Chi Minh",
    district: "Binh Thanh",
    propertyType: "phong_tro",
    roomType: "phong_don",
    landlord: landlordId,
    images: [],
    amenities: ["wifi", "aircon"],
  };
  
  const room = await roomModel.create(testRoom);
  return room;
}

// Create test post
export async function createTestPost(postModel, roomId, landlordId) {
  const testPost = {
    roomId,
    landlord: landlordId,
    status: "active",
    favouriteLevel: "free",
    options: [],
  };
  
  const post = await postModel.create(testPost);
  return post;
}

export default testConfig;
