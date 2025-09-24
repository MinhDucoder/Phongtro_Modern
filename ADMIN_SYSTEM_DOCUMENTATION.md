# 🔐 Admin Management System - PhongTroVN

## Tổng quan
Hệ thống quản trị viên cho phép admin quản lý users, posts và thực hiện kiểm duyệt nội dung một cách hiệu quả.

## 🏗️ Kiến trúc

### Backend (Node.js/Express)
```
server/src/
├── controllers/
│   ├── AdminUserController.js      # Quản lý users
│   ├── AdminPostController.js      # Quản lý posts
│   └── ModerationController.js     # Kiểm duyệt nội dung
├── routes/v1/admin.js             # Admin routes
├── middlewares/checkToken.js       # Auth & admin middleware
└── models/                        # Updated schemas
```

### Frontend (Next.js)
```
src/
├── app/api/admin/                 # API proxy routes
├── components/admin/              # Admin components
└── app/admin/                     # Admin pages
```

## 🚀 Chức năng chính

### 1. 👥 Quản lý Users

#### API Endpoints
```javascript
GET    /api/v1/admin/users                    # Danh sách users
GET    /api/v1/admin/users/recent             # Hoạt động gần đây
GET    /api/v1/admin/users/:id                # Chi tiết user
PUT    /api/v1/admin/users/:id                # Cập nhật user
PATCH  /api/v1/admin/users/:id/ban            # Cấm/bỏ cấm user
DELETE /api/v1/admin/users/:id                # Xóa user
```

#### Features
- ✅ **Danh sách & tìm kiếm**: Phân trang, filter theo role/status
- ✅ **Thống kê**: Tổng users, đã xác thực, chủ nhà, bị cấm
- ✅ **Quản lý trạng thái**: Ban/unban, verify/unverify
- ✅ **Bulk actions**: Thao tác hàng loạt
- ✅ **Chi tiết user**: Xem thông tin đầy đủ

#### Frontend Component
```jsx
import AdminUserManagement from '@/components/admin/AdminUserManagement';
```

### 2. 📝 Quản lý Posts

#### API Endpoints
```javascript
GET    /api/v1/admin/posts                    # Danh sách posts
GET    /api/v1/admin/posts/pending            # Posts chờ duyệt
GET    /api/v1/admin/posts/analytics          # Thống kê posts
GET    /api/v1/admin/posts/:id                # Chi tiết post
PATCH  /api/v1/admin/posts/:id/status         # Duyệt/từ chối post
PATCH  /api/v1/admin/posts/:id/favourite      # Cập nhật cấp độ
DELETE /api/v1/admin/posts/:id                # Xóa post
PATCH  /api/v1/admin/posts/bulk               # Bulk actions
```

#### Features
- ✅ **Kiểm duyệt**: Approve/reject posts với lý do
- ✅ **Quản lý cấp độ**: Free, Silver, Gold, Platinum
- ✅ **Thống kê**: Theo trạng thái, thời gian, cấp độ
- ✅ **Tìm kiếm**: Theo nội dung, chủ nhà, địa chỉ
- ✅ **Bulk moderation**: Duyệt/từ chối hàng loạt

### 3. ⚖️ Hệ thống Kiểm duyệt

#### API Endpoints
```javascript
GET    /api/v1/admin/moderation/dashboard     # Tổng quan
GET    /api/v1/admin/moderation/queue         # Hàng đợi kiểm duyệt
GET    /api/v1/admin/moderation/history       # Lịch sử kiểm duyệt
GET    /api/v1/admin/moderation/stats         # Thống kê moderator
PATCH  /api/v1/admin/moderation/:id/approve   # Duyệt nhanh
PATCH  /api/v1/admin/moderation/:id/reject    # Từ chối nhanh
PATCH  /api/v1/admin/moderation/bulk          # Bulk moderation
```

#### Features
- ✅ **Priority Queue**: Tự động ưu tiên theo thời gian chờ
- ✅ **Dashboard**: Tổng quan công việc kiểm duyệt
- ✅ **Quick Actions**: Duyệt/từ chối nhanh
- ✅ **History tracking**: Lưu lịch sử kiểm duyệt
- ✅ **Performance stats**: Thống kê hiệu suất moderator

## 🔒 Bảo mật & Phân quyền

### Middleware Authentication
```javascript
// Require admin role
adminRoute.use(authenticate);
adminRoute.use(isAdmin);
```

### Frontend Protection
```jsx
// Admin guard component
import AdminGuard from '@/components/auth/AdminGuard';

<AdminGuard>
  <AdminUserManagement />
</AdminGuard>
```

## 📊 Database Schema Updates

### User Schema
```javascript
// Added fields
is_deleted: { type: Boolean, default: false },
deleted_at: { type: Date },
ban_reason: { type: String },
banned_at: { type: Date }
```

### Post Schema
```javascript
// Added moderation fields
moderatedAt: { type: Date },
moderatedBy: { type: ObjectId, ref: "User" },
rejectionReason: { type: String },
is_deleted: { type: Boolean, default: false },
deleted_at: { type: Date },
deletion_reason: { type: String },
deleted_by: { type: ObjectId, ref: "User" }
```

## 🎨 UI/UX Components

### Responsive Design
- 📱 Mobile-friendly tables
- 🎯 Intuitive filters & search
- 📊 Visual statistics cards
- ⚡ Real-time updates
- 🔄 Loading states

### Key Features
- **Smart Filters**: Role, status, date range
- **Bulk Operations**: Checkbox selection
- **Modal Dialogs**: Detailed actions
- **Toast Notifications**: User feedback
- **Pagination**: Performance optimized

## 🚦 Usage Guide

### 1. Setup Backend
```bash
# Install dependencies
cd server && npm install

# Start server
npm run dev
```

### 2. Setup Frontend
```bash
# Install dependencies  
cd phongtro-modern && npm install

# Add environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" >> .env.local

# Start frontend
npm run dev
```

### 3. Access Admin Panel
```
URL: http://localhost:3000/admin
Login: Admin account required
```

## 📈 Performance & Scaling

### Backend Optimizations
- **Pagination**: Limit results per page
- **Indexing**: Database indexes on search fields
- **Aggregation**: MongoDB aggregation for statistics
- **Caching**: Future Redis implementation ready

### Frontend Optimizations
- **Lazy Loading**: Components load on demand
- **Debounced Search**: Reduce API calls
- **Virtual Scrolling**: Handle large datasets
- **State Management**: Optimistic updates

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with admin account
- [ ] View user statistics
- [ ] Search and filter users
- [ ] Ban/unban user with reason
- [ ] Verify/unverify user
- [ ] View posts requiring moderation
- [ ] Approve/reject posts
- [ ] Bulk operations
- [ ] View moderation history

### API Testing
```bash
# Test user management
curl -H "Cookie: accessToken=..." \
  "http://localhost:5000/api/v1/admin/users"

# Test post management
curl -H "Cookie: accessToken=..." \
  "http://localhost:5000/api/v1/admin/posts"
```

## 🔄 Future Enhancements

### Planned Features
- [ ] **Advanced Analytics**: Charts & graphs
- [ ] **Automated Moderation**: AI content filtering  
- [ ] **Role Management**: Custom admin roles
- [ ] **Audit Logs**: Complete action history
- [ ] **Email Notifications**: Auto-notify users
- [ ] **Bulk Import/Export**: CSV operations
- [ ] **API Rate Limiting**: Prevent abuse
- [ ] **Real-time Updates**: WebSocket integration

### Performance Improvements
- [ ] **Redis Caching**: Session & data caching
- [ ] **Database Optimization**: Query performance
- [ ] **CDN Integration**: Static asset delivery
- [ ] **Background Jobs**: Heavy operations

## 📞 Support & Maintenance

### Monitoring
- Server logs: `server/logs/`
- Error tracking: Built-in error handling
- Performance metrics: Response times logged

### Troubleshooting
1. **403 Forbidden**: Check admin role in user account
2. **401 Unauthorized**: Verify login session
3. **500 Server Error**: Check backend logs
4. **API Timeouts**: Check server status

## 🏆 Summary

Hệ thống admin đã hoàn thiện với:
- ✅ **Full CRUD operations** cho users & posts
- ✅ **Advanced filtering & search**
- ✅ **Bulk actions** cho hiệu quả cao
- ✅ **Comprehensive moderation system**
- ✅ **Real-time statistics & analytics**
- ✅ **Responsive UI/UX design**
- ✅ **Security & role-based access**

System sẵn sàng cho production với khả năng mở rộng tốt! 🚀