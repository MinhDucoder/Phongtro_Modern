/**
 * Script để fix dữ liệu nearbyPlaces bị lỗi format trong database
 * 
 * Vấn đề: Dữ liệu nearbyPlaces bị lưu dưới dạng object với keys là số thay vì string
 * Ví dụ: {"0": "G", "1": "ầ", "2": "n", ...} thay vì {"name": "Gần bến xe buýt"}
 * 
 * Chạy script này để fix dữ liệu:
 * node server/scripts/fix-nearby-places-data.js
 */

const mongoose = require('mongoose');
const Room = require('../src/models/Room');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_modern', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixNearbyPlacesData() {
  try {
    console.log('🔍 Đang tìm kiếm dữ liệu nearbyPlaces bị lỗi...');
    
    // Tìm tất cả rooms có nearbyPlaces
    const rooms = await Room.find({ nearbyPlaces: { $exists: true, $ne: [] } });
    
    let fixedCount = 0;
    let totalProcessed = 0;
    
    for (const room of rooms) {
      let hasCorruptedData = false;
      const fixedNearbyPlaces = [];
      
      for (const place of room.nearbyPlaces) {
        totalProcessed++;
        
        // Kiểm tra xem có phải dữ liệu bị lỗi không
        if (typeof place === 'object' && place !== null) {
          const numericKeys = Object.keys(place).filter(key => !isNaN(Number(key)));
          
          if (numericKeys.length > 0) {
            // Đây là dữ liệu bị lỗi - string bị split thành object
            hasCorruptedData = true;
            
            // Reconstruct string từ numeric keys
            const sortedKeys = numericKeys.sort((a, b) => Number(a) - Number(b));
            const reconstructedName = sortedKeys.map(key => place[key]).join('');
            
            // Tạo object mới với format đúng
            const fixedPlace = {
              name: reconstructedName,
              type: 'nearby', // Default type
              distance: 'Gần đây'
            };
            
            fixedNearbyPlaces.push(fixedPlace);
            
            console.log(`✅ Fixed: "${reconstructedName}"`);
          } else {
            // Dữ liệu đã đúng format
            fixedNearbyPlaces.push(place);
          }
        } else {
          // Dữ liệu đã đúng format
          fixedNearbyPlaces.push(place);
        }
      }
      
      // Cập nhật room nếu có dữ liệu bị lỗi
      if (hasCorruptedData) {
        await Room.findByIdAndUpdate(room._id, {
          nearbyPlaces: fixedNearbyPlaces
        });
        
        fixedCount++;
        console.log(`📝 Updated room: ${room._id}`);
      }
    }
    
    console.log('\n🎉 Hoàn thành!');
    console.log(`📊 Tổng số places đã xử lý: ${totalProcessed}`);
    console.log(`🔧 Số rooms đã fix: ${fixedCount}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy script
fixNearbyPlacesData();
