# 🐛 Debug Stats API Issues

## 🔍 **Vấn đề hiện tại**
- Frontend gặp lỗi: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau"
- API endpoints hoạt động tốt khi test trực tiếp với curl
- Có thể là vấn đề CORS hoặc network

## ✅ **Đã kiểm tra**
1. **Server đang chạy**: ✅ `http://localhost:5000`
2. **API endpoints hoạt động**: ✅ 
   - `/api/v1/stats/overview` - 200 OK
   - `/api/v1/stats/real-time` - 200 OK  
   - `/api/v1/stats/trending` - 200 OK
3. **Frontend đang chạy**: ✅ `http://localhost:3000`
4. **CORS config**: ✅ Đã cấu hình cho localhost:3000

## 🛠️ **Debug Steps**

### **1. Kiểm tra Browser Console**
- Mở DevTools (F12)
- Xem tab Console để tìm lỗi chi tiết
- Xem tab Network để kiểm tra API calls

### **2. Test API trực tiếp**
```bash
# Test từ terminal
curl http://localhost:5000/api/v1/stats/overview
curl http://localhost:5000/api/v1/stats/real-time
curl http://localhost:5000/api/v1/stats/trending
```

### **3. Test từ Frontend**
- Truy cập `http://localhost:3000`
- Tìm section "Stats API Test"
- Click "Test API" và "Test URLs
- Xem kết quả trong console

### **4. Kiểm tra Network Tab**
- Mở DevTools → Network tab
- Reload trang
- Tìm các request đến `/api/v1/stats/*`
- Kiểm tra status code và response

## 🔧 **Possible Solutions**

### **Solution 1: CORS Issues**
Nếu lỗi CORS, thêm vào server:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### **Solution 2: Network Issues**
Nếu lỗi network, kiểm tra:
- Firewall settings
- Antivirus blocking requests
- Proxy settings

### **Solution 3: API URL Issues**
Nếu lỗi URL, thử:
```javascript
// Trong api.ts
export const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';
// hoặc
export const API_BASE_URL = 'http://localhost:5000/api/v1';
```

### **Solution 4: Timeout Issues**
Nếu lỗi timeout, tăng timeout:
```javascript
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
```

## 📊 **Debug Components Added**

### **StatsTest.tsx**
- Test API trực tiếp
- Test different URLs
- Show detailed error messages

### **Debug Console Logs**
- Added detailed logging in components
- API request/response logging
- Error handling improvements

## 🎯 **Next Steps**

1. **Check Browser Console** - Tìm lỗi chi tiết
2. **Test Debug Components** - Sử dụng StatsTest component
3. **Check Network Tab** - Xem API calls
4. **Try Different URLs** - Test với 127.0.0.1
5. **Check CORS Settings** - Đảm bảo CORS đúng

## 📝 **Files Modified for Debug**

- `phongtro-modern/src/components/stats/StatsTest.tsx` ✅
- `phongtro-modern/src/lib/debug-api.ts` ✅
- `phongtro-modern/src/app/page.tsx` (added StatsTest) ✅
- Enhanced error handling in components ✅

## 🔍 **Debug Commands**

```bash
# Test server
curl http://localhost:5000/api/v1/stats/overview

# Test frontend
curl http://localhost:3000

# Check if ports are open
netstat -an | findstr :5000
netstat -an | findstr :3000
```

---

**🎯 Mục tiêu**: Tìm và sửa lỗi API connection giữa frontend và backend để Statistics Dashboard hoạt động bình thường.


