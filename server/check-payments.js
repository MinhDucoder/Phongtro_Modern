// Script kiểm tra dữ liệu Payment trong MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './src/models/paymentSchema.js';
import User from './src/models/userSchema.js';

dotenv.config();

const checkPayments = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Đếm tổng số payments
    const totalPayments = await Payment.countDocuments();
    console.log(`\n📊 Tổng số giao dịch: ${totalPayments}`);

    if (totalPayments === 0) {
      console.log('\n⚠️  Không có giao dịch nào trong database!');
      console.log('\n💡 Tạo dữ liệu mẫu...\n');

      // Tìm user để gán payment
      const users = await User.find({ role: { $ne: 'admin' } }).limit(5);
      
      if (users.length === 0) {
        console.log('❌ Không có user nào để tạo payment mẫu');
        process.exit(0);
      }

      // Tạo payment mẫu
      const samplePayments = [
        {
          user: users[0]._id,
          packageName: 'Gói VIP 1 - 30 ngày',
          packageType: 'vip1',
          amount: 50000,
          currency: 'VND',
          status: 'completed',
          paymentMethod: 'momo',
          transactionId: `TXN${Date.now()}_1`,
          referenceId: `REF${Date.now()}_1`,
          packageDuration: 30,
          packageStartDate: new Date(),
          packageEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          completedAt: new Date(),
          notes: 'Thanh toán qua MoMo thành công'
        },
        {
          user: users[1]._id,
          packageName: 'Gói VIP 2 - 60 ngày',
          packageType: 'vip2',
          amount: 100000,
          currency: 'VND',
          status: 'completed',
          paymentMethod: 'bank',
          transactionId: `TXN${Date.now()}_2`,
          referenceId: `REF${Date.now()}_2`,
          packageDuration: 60,
          packageStartDate: new Date(),
          packageEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          completedAt: new Date(),
          notes: 'Chuyển khoản ngân hàng'
        },
        {
          user: users[2]._id,
          packageName: 'Gói VIP 3 - 90 ngày',
          packageType: 'vip3',
          amount: 200000,
          currency: 'VND',
          status: 'pending',
          paymentMethod: 'zalopay',
          transactionId: `TXN${Date.now()}_3`,
          referenceId: `REF${Date.now()}_3`,
          packageDuration: 90,
          packageStartDate: new Date(),
          packageEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          notes: 'Đang chờ xác nhận từ ZaloPay'
        },
        {
          user: users[3]._id,
          packageName: 'Gói VIP 1 - 30 ngày',
          packageType: 'vip1',
          amount: 50000,
          currency: 'VND',
          status: 'failed',
          paymentMethod: 'vnpay',
          transactionId: `TXN${Date.now()}_4`,
          referenceId: `REF${Date.now()}_4`,
          packageDuration: 30,
          packageStartDate: new Date(),
          packageEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          failedAt: new Date(),
          failureReason: 'Số dư không đủ',
          notes: 'Giao dịch thất bại - số dư không đủ'
        },
        {
          user: users[4]._id || users[0]._id,
          packageName: 'Gói VIP 2 - 60 ngày',
          packageType: 'vip2',
          amount: 100000,
          currency: 'VND',
          status: 'completed',
          paymentMethod: 'momo',
          transactionId: `TXN${Date.now()}_5`,
          referenceId: `REF${Date.now()}_5`,
          packageDuration: 60,
          packageStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          packageEndDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          notes: 'Gia hạn gói VIP thành công'
        }
      ];

      // Insert payments
      await Payment.insertMany(samplePayments);
      console.log(`✅ Đã tạo ${samplePayments.length} giao dịch mẫu`);
    }

    // Hiển thị thống kê
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    console.log('\n📈 Thống kê theo trạng thái:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} giao dịch, Tổng: ${stat.totalAmount.toLocaleString()}đ`);
    });

    // Hiển thị 5 giao dịch gần nhất
    const recentPayments = await Payment.find()
      .populate('user', 'full_name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log('\n📋 5 giao dịch gần nhất:');
    recentPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. ${payment.transactionId}`);
      console.log(`   User: ${payment.user?.full_name || 'N/A'} (${payment.user?.email || 'N/A'})`);
      console.log(`   Gói: ${payment.packageName}`);
      console.log(`   Số tiền: ${payment.amount.toLocaleString()}đ`);
      console.log(`   Trạng thái: ${payment.status}`);
      console.log(`   Phương thức: ${payment.paymentMethod}`);
      console.log(`   Ngày tạo: ${new Date(payment.createdAt).toLocaleString('vi-VN')}`);
    });

    // Tổng doanh thu
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log(`\n💰 Tổng doanh thu (completed): ${(totalRevenue[0]?.total || 0).toLocaleString()}đ`);

    console.log('\n✅ Kiểm tra hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

checkPayments();
