# 🧪 TESTING CHECKLIST - Core Features

## 🎯 **Đã Hoàn Thành Cần Test:**

### ✅ **Task 1: JWT Token Management**
### ✅ **Task 2: YeuCauThueClient.tsx** 
### ✅ **Task 3: UserProfile.tsx**

---

## 🔧 **1. JWT TOKEN MANAGEMENT TEST**

### **A. Basic Authentication Flow**
- [ ] **Login Test**
  1. Mở `/dang-nhap`
  2. Đăng nhập với tài khoản landlord/admin
  3. ✅ **Expected**: Redirect về dashboard, token được lưu
  4. ✅ **Check**: F12 > Application > localStorage > thấy `auth_tokens`

- [ ] **Token Auto-Refresh Test**
  1. Mở `/debug/token` (debug page vừa tạo)
  2. Xem token status và thời gian hết hạn
  3. ✅ **Expected**: Token tự động refresh trước 5 phút hết hạn
  4. ✅ **Check**: Console log có thông báo refresh

- [ ] **Session Persistence Test**
  1. Đăng nhập thành công
  2. Refresh browser (F5)
  3. ✅ **Expected**: Vẫn đăng nhập, không bị redirect về login
  4. ✅ **Check**: Dashboard load bình thường

### **B. Advanced Token Test**
- [ ] **Token Expiry Handling**
  1. Login và đợi token hết hạn (hoặc manually clear token)
  2. Thử gọi API bất kỳ
  3. ✅ **Expected**: Auto redirect về login với toast message
  4. ✅ **Check**: URL có `?redirect=/dashboard`

- [ ] **401 Retry Logic**
  1. Mở Network tab trong F12
  2. Thực hiện actions trong dashboard
  3. ✅ **Expected**: Nếu có 401, sẽ thấy retry request với fresh token
  4. ✅ **Check**: 2 requests: 401 đầu tiên, 200 retry thành công

---

## 📋 **2. YÊU CẦU THUÊ (YeuCauThueClient.tsx) TEST**

### **A. Data Loading Test**
- [ ] **Real API Integration**
  1. Mở `/dashboard/yeu-cau-thue`
  2. ✅ **Expected**: Không còn mock data, load từ API thật
  3. ✅ **Check**: F12 Network > thấy calls tới `/rental-requests/landlord/requests`

- [ ] **Empty State Test**  
  1. Nếu chưa có yêu cầu thuê nào
  2. ✅ **Expected**: Hiển thị empty state đẹp với nút "Đăng tin cho thuê"
  3. ✅ **Check**: Không có crash hay error messages

- [ ] **Statistics Display**
  1. Kiểm tra 4 stat cards trên đầu
  2. ✅ **Expected**: Số liệu real từ API, không phải hardcoded
  3. ✅ **Check**: API call tới `/rental-requests/landlord/stats`

### **B. Functionality Test**
- [ ] **Filter by Status**
  1. Click các nút filter: "Tất cả", "Chờ xử lý", "Đã chấp nhận", "Đã từ chối"
  2. ✅ **Expected**: List được filter đúng theo status
  3. ✅ **Check**: Count trong nút khớp với số item hiển thị

- [ ] **Accept/Reject Actions**
  1. Có yêu cầu với status "pending"
  2. Click "Chấp nhận" hoặc "Từ chối" 
  3. ✅ **Expected**: API call success, status update, toast hiển thị
  4. ✅ **Check**: Network tab thấy PATCH request tới `/rental-requests/{id}/status`

---

## 👤 **3. USER PROFILE TEST**

### **A. Profile Loading**
- [ ] **Real Data Display**
  1. Mở `/dashboard/profile`
  2. ✅ **Expected**: Hiển thị thông tin user thật, không phải mockUser
  3. ✅ **Check**: F12 Network > thấy GET `/user/profile`

- [ ] **Profile Form Population**
  1. Click "Chỉnh sửa thông tin"
  2. ✅ **Expected**: Form được fill với data thật từ API
  3. ✅ **Check**: Các field có giá trị đúng với user đang login

### **B. Profile Update**
- [ ] **Update Profile Test**
  1. Chỉnh sửa full_name, phone, address
  2. Click "Lưu thay đổi"
  3. ✅ **Expected**: Success toast, data được update
  4. ✅ **Check**: PATCH `/user/update` trong Network tab

- [ ] **Change Password Test**
  1. Click "Đổi mật khẩu"
  2. Điền current password, new password, confirm
  3. Click "Đổi mật khẩu"
  4. ✅ **Expected**: Success toast, modal đóng
  5. ✅ **Check**: PATCH `/user/change-password` call

### **C. Error Handling**
- [ ] **Profile Update Error**
  1. Thử update với dữ liệu invalid (phone không đúng format)
  2. ✅ **Expected**: Error toast hiển thị message rõ ràng
  3. ✅ **Check**: Không crash, form vẫn editable

- [ ] **Wrong Password Error**
  1. Đổi mật khẩu với current password sai
  2. ✅ **Expected**: Error toast "Mật khẩu hiện tại không đúng"
  3. ✅ **Check**: Form vẫn hiển thị, không bị reset

---

## 🚨 **CRITICAL ISSUES TO WATCH FOR:**

### **Red Flags 🔴**
- [ ] Console errors về missing API endpoints
- [ ] Network 500/404 errors khi call API
- [ ] Mock data vẫn hiển thị thay vì real data
- [ ] Token không được lưu sau login
- [ ] Page crash khi refresh browser

### **Performance Issues 🟡**
- [ ] Loading states quá lâu (>3 seconds)  
- [ ] Multiple unnecessary API calls
- [ ] Memory leaks trong console
- [ ] UI freezing khi thực hiện actions

### **UX Issues 🟠**
- [ ] Empty states không user-friendly
- [ ] Error messages không rõ ràng
- [ ] Success actions không có feedback
- [ ] Forms không validate properly

---

## 📊 **TESTING REPORT TEMPLATE**

```
TESTING SESSION: [DATE]
TESTER: [NAME]

=== JWT TOKEN MANAGEMENT ===
✅ Login/Logout: PASS/FAIL
✅ Token Refresh: PASS/FAIL  
✅ Session Persistence: PASS/FAIL
❌ Issues found: [List any problems]

=== YÊU CẦU THUÊ ===
✅ API Integration: PASS/FAIL
✅ Empty State: PASS/FAIL
✅ Accept/Reject: PASS/FAIL  
❌ Issues found: [List any problems]

=== USER PROFILE ===
✅ Profile Loading: PASS/FAIL
✅ Profile Update: PASS/FAIL
✅ Change Password: PASS/FAIL
❌ Issues found: [List any problems]

=== OVERALL STATUS ===
✅ Ready for next tasks: YES/NO
❌ Critical blockers: [List any blockers]
📝 Notes: [Additional feedback]
```

---

## 🎯 **NEXT STEPS AFTER TESTING:**

### **If Tests PASS ✅**
- Continue với Task 4: SavedProperties.tsx
- Continue với Task 5: PaymentHistory.tsx  
- Continue với Task 6: Dashboard Overview

### **If Tests FAIL ❌**
- Fix critical issues first
- Re-test before continuing
- Document any workarounds needed

---

*🧪 Test thoroughly, report honestly! Quality > Speed*
