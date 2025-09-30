# 🔧 JWT Token Management Testing Guide

## 📋 **What Was Implemented**

### **1. TokenManager Class**
- **Singleton Pattern**: Ensures only one token manager instance
- **Automatic Refresh**: Refreshes tokens 5 minutes before expiry
- **localStorage Persistence**: Tokens survive browser refresh
- **Error Handling**: Graceful fallback on refresh failure

### **2. Enhanced apiRequest Function**
- **Automatic Token Injection**: Adds Bearer token to all requests
- **401 Retry Logic**: Automatically tries to refresh token on 401 errors
- **Session Expiry Events**: Dispatches custom events for session management

### **3. Session Management**
- **useTokenRefresh Hook**: Handles session expiry with toasts and redirects
- **AuthContext Integration**: Synced with existing auth state
- **DashboardGuard Enhancement**: Multi-layer validation

### **4. Debug Tools**
- **TokenDebug Component**: Real-time token status monitoring
- **Test Page**: `/debug/token` for development testing

---

## 🧪 **How to Test**

### **Step 1: Start the Development Server**
```bash
cd phongtro-modern
npm run dev
```

### **Step 2: Access Debug Page**
1. Login as a landlord/admin user
2. Navigate to: `http://localhost:3000/debug/token`
3. You should see the Token Debug Panel

### **Step 3: Test Token Functionality**

#### **Test A: Basic Token Status**
- ✅ Check "Authentication Status" shows correct user info
- ✅ Check "Token Status" shows "Has Token: Yes" and "Is Expired: No"
- ✅ Verify localStorage contains token data

#### **Test B: Manual Token Refresh**
- ✅ Click "Manual Token Refresh" button
- ✅ Should see "Token refreshed successfully" toast
- ✅ Token status should remain valid

#### **Test C: Token Expiry Simulation**
1. **Manually expire token in localStorage**:
   ```javascript
   // Open browser console and run:
   const tokens = JSON.parse(localStorage.getItem('auth_tokens'));
   tokens.expiresAt = Date.now() - 1000; // 1 second ago
   localStorage.setItem('auth_tokens', JSON.stringify(tokens));
   ```
2. ✅ Click "Refresh Status" - should show "Is Expired: Yes"
3. ✅ Click "Test API Call" - should automatically refresh token
4. ✅ Token status should become valid again

#### **Test D: Clear Tokens**
- ✅ Click "Clear Tokens" button
- ✅ Token status should show "Has Token: No"
- ✅ Should be redirected to login page

#### **Test E: Navigation with Expired Token**
1. Login and navigate to dashboard
2. Expire token using console method above
3. ✅ Navigate to different dashboard pages
4. ✅ Should automatically refresh token or redirect to login

### **Step 4: Test Real Dashboard Usage**

#### **Test F: Dashboard Access Control**
1. ✅ Access `/dashboard` without login → redirected to login
2. ✅ Login as regular user → redirected to home
3. ✅ Login as landlord/admin → access granted

#### **Test G: API Calls with Auto-Refresh**
1. Navigate to dashboard pages (analytics, posts, etc.)
2. ✅ All API calls should work normally
3. ✅ Expire token and refresh page
4. ✅ APIs should auto-refresh token and continue working

---

## 🔍 **What to Look For**

### **✅ Success Indicators**
- No 401 errors in console after token refresh
- Seamless user experience (no manual re-login required)
- Toast notifications for session expiry
- Proper redirects with return URLs
- Token persistence across browser refresh

### **❌ Potential Issues**
- Token refresh infinite loops
- Multiple refresh requests simultaneously
- Failed cleanup on logout
- Missing Authorization headers
- Storage quota exceeded

---

## 🚨 **Testing Edge Cases**

### **Test H: Network Issues**
1. **Offline Token Refresh**:
   - Go offline (dev tools → Network → Offline)
   - Trigger token refresh
   - ✅ Should handle gracefully with error message

2. **Slow Network**:
   - Throttle network to slow 3G
   - ✅ Token refresh should still work with timeout

### **Test I: Multiple Tabs**
1. Open dashboard in 2+ tabs
2. Logout from one tab
3. ✅ Other tabs should detect session expiry
4. ✅ All tabs should redirect to login

### **Test J: Backend Down**
1. Stop the backend server
2. Try API calls
3. ✅ Should show proper error messages
4. ✅ Should not break the frontend

---

## 🔧 **Debug Information**

### **Browser Console Logs**
Look for these log messages:
```
✅ "Attempting token refresh due to 401..."
✅ "Session expired event received: ..."  
✅ "Token refreshed successfully"
❌ "Token refresh failed: ..."
❌ "Phiên làm việc đã hết hạn"
```

### **Network Tab**
Monitor these requests:
- `POST /api/v1/auth/refresh-token`
- Authorization headers on all API calls
- Retry patterns on 401 responses

### **localStorage Inspection**
Check `auth_tokens` key:
```javascript
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...", 
  "expiresAt": 1234567890000
}
```

---

## 📝 **Test Results Checklist**

Mark each test as you complete it:

**Basic Functionality:**
- [ ] Debug panel loads correctly
- [ ] Token status displays accurately  
- [ ] Manual refresh works
- [ ] API test calls succeed
- [ ] Clear tokens works
- [ ] localStorage persistence works

**Advanced Scenarios:**
- [ ] Auto-refresh on expiry
- [ ] Session expiry handling
- [ ] Dashboard access control
- [ ] Navigation with expired tokens
- [ ] Multi-tab synchronization

**Edge Cases:**
- [ ] Network errors handled
- [ ] Backend unavailable scenarios
- [ ] Token corruption recovery
- [ ] Refresh token expiry

**Security:**
- [ ] Tokens properly cleared on logout
- [ ] No token leakage in console
- [ ] Proper cleanup on errors
- [ ] Authorization headers present

---

## 🎯 **Next Steps**

After successful testing:
1. ✅ Mark Task 1 complete in TODO list
2. 🔄 Move to Task 2: Replace Mock Data with Real APIs
3. 📊 Update progress in main TODO file
4. 🚀 Deploy to staging environment for integration testing

**If tests fail**: Check browser console, network tab, and debug panel for error details. Common issues are usually related to backend API compatibility or token format mismatches.
