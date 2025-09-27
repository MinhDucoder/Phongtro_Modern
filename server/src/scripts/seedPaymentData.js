import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Payment from "../models/paymentSchema.js";
import User from "../models/userSchema.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedPaymentData = async () => {
  try {
    console.log('🌱 Starting to seed payment data...');

    // 1. Find or create test landlord user
    let landlord = await User.findOne({ email: 'landlord@test.com' });
    if (!landlord) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      landlord = await User.create({
        full_name: 'Chủ nhà Test',
        email: 'landlord@test.com',
        password: hashedPassword,
        phone: '0987654321',
        role: 'landlord',
        is_verified: true
      });
      console.log('✅ Created test landlord user');
    }

    // 2. Create sample payment records
    const paymentData = [
      {
        user: landlord._id,
        packageName: 'Gói Premium - 30 ngày',
        packageType: 'premium',
        amount: 150000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'vnpay',
        transactionId: 'VNPAY_20240120_123456',
        packageStartDate: new Date('2024-01-20'),
        packageEndDate: new Date('2024-02-19'),
        packageDuration: 30,
        invoice: {
          invoiceNumber: 'INV-2024-001',
          invoiceUrl: '/invoices/invoice_1.pdf'
        },
        completedAt: new Date('2024-01-20T14:30:00'),
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.100',
          deviceType: 'desktop'
        }
      },
      {
        user: landlord._id,
        packageName: 'Gói Cơ Bản - 7 ngày',
        packageType: 'free',
        amount: 50000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'momo',
        transactionId: 'MOMO_20240115_789012',
        packageStartDate: new Date('2024-01-15'),
        packageEndDate: new Date('2024-01-22'),
        packageDuration: 7,
        completedAt: new Date('2024-01-15T10:15:00')
      },
      {
        user: landlord._id,
        packageName: 'Gói VIP - 60 ngày',
        packageType: 'vip',
        amount: 300000,
        currency: 'VND',
        status: 'pending',
        paymentMethod: 'zalopay',
        transactionId: 'ZALOPAY_20240118_345678',
        packageStartDate: new Date('2024-01-18'),
        packageEndDate: new Date('2024-03-18'),
        packageDuration: 60
      },
      {
        user: landlord._id,
        packageName: 'Gói Premium - 30 ngày',
        packageType: 'premium',
        amount: 150000,
        currency: 'VND',
        status: 'failed',
        paymentMethod: 'bank_transfer',
        transactionId: 'BANK_20240110_901234',
        packageStartDate: new Date('2024-01-10'),
        packageEndDate: new Date('2024-02-09'),
        packageDuration: 30,
        failedAt: new Date('2024-01-10T09:20:00'),
        failureReason: 'Insufficient funds'
      },
      {
        user: landlord._id,
        packageName: 'Gói Gold - 15 ngày',
        packageType: 'gold',
        amount: 75000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'vnpay',
        transactionId: 'VNPAY_20240125_567890',
        packageStartDate: new Date('2024-01-25'),
        packageEndDate: new Date('2024-02-09'),
        packageDuration: 15,
        completedAt: new Date('2024-01-25T16:45:00')
      }
    ];

    // Clear existing payments for this user
    await Payment.deleteMany({ user: landlord._id });
    console.log('🗑️ Cleared existing payment data');

    // Insert new payment data
    const payments = await Payment.insertMany(paymentData);
    console.log(`✅ Created ${payments.length} payment records`);

    console.log('🎉 Payment data seeding completed!');
    console.log('📊 Payment Statistics:');
    console.log(`   - Total payments: ${payments.length}`);
    console.log(`   - Completed: ${payments.filter(p => p.status === 'completed').length}`);
    console.log(`   - Pending: ${payments.filter(p => p.status === 'pending').length}`);
    console.log(`   - Failed: ${payments.filter(p => p.status === 'failed').length}`);
    console.log(`   - Total amount: ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString('vi-VN')} VND`);

  } catch (error) {
    console.error('❌ Error seeding payment data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding
connectDB().then(() => seedPaymentData());



