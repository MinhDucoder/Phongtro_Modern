# 🧪 QUICK TEST - READY NOW!

## 🚀 **SERVERS RUNNING**
- ✅ **Frontend**: `http://localhost:3000` (Next.js)
- ✅ **Backend**: `http://localhost:5000` (Express API)
- ✅ **Build**: All critical errors fixed

---

## ⚡ **5-MINUTE CORE TEST PLAN**

### **Step 1: JWT Authentication Test** (2 phút)
1. 🌐 Open: `http://localhost:3000/dang-nhap`
2. 🔐 Login với landlord account
3. ✅ **Expected**: Redirect to `/dashboard`
4. 🔄 **Test**: F5 refresh → should stay logged in
5. 🔍 **Check**: F12 → Application → localStorage → see `auth_tokens`

### **Step 2: Yêu Cầu Thuê Test** (2 phút)
1. 🌐 Navigate: `/dashboard/yeu-cau-thue`
2. ✅ **Expected**: No mock data, real API calls or empty state
3. 🔍 **Check**: F12 → Network → see `/rental-requests/landlord/*` calls
4. 📊 **Verify**: Stats cards show real numbers or 0 (not hardcoded)

### **Step 3: User Profile Test** (1 phút)
1. 🌐 Navigate: `/dashboard/profile`
2. ✅ **Expected**: Real user data displayed
3. ✏️ **Test**: Click "Chỉnh sửa" → change name → "Lưu"
4. ✅ **Expected**: Success toast, data updated
5. 🔍 **Check**: F12 → Network → see PATCH `/user/update`

---

## 🎯 **SUCCESS CRITERIA**

### **✅ PASS if:**
- Login works without errors
- Dashboard loads with real data (no mock)
- Profile update saves successfully
- No console errors in F12
- Network tab shows actual API calls

### **❌ FAIL if:**
- Build/compile errors
- Mock data still visible
- API calls return 500/404
- Console shows JavaScript errors
- Pages crash or won't load

---

## 🐛 **IF ISSUES FOUND:**

### **Common Fixes:**
1. **"Token not found"**: Check if backend is running on port 5000
2. **"Cannot connect"**: Verify API_BASE_URL in frontend
3. **Empty data**: Check if database has seed data
4. **404 errors**: Verify backend routes are registered

### **Debug Tools Available:**
- 🔧 **Token Debug**: `http://localhost:3000/debug/token`
- 📊 **Network Tab**: F12 → Network → filter "API"
- 📝 **Console**: F12 → Console for detailed errors

---

## 📋 **QUICK REPORT TEMPLATE:**

```
✅/❌ JWT Authentication: 
✅/❌ Yêu Cầu Thuê: 
✅/❌ User Profile: 
✅/❌ Overall Build: 

Issues found:
- [List any problems]

Ready for next features: YES/NO
```

---

## 🎉 **IF ALL TESTS PASS:**
➡️ Continue with remaining tasks:
- Task 4: SavedProperties.tsx
- Task 5: PaymentHistory.tsx  
- Task 6: Dashboard Overview

## 🔧 **IF TESTS FAIL:**
➡️ Report issues and I'll fix them before continuing

---

*🕐 Estimated Test Time: 5-10 minutes*
*🎯 Focus: Core functionality over perfection*
