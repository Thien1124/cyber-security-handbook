# Task 11: Thiết kế Blacklist & Report Schema

**DEV B** | **Status**: ✅ Hoàn thành | **Ngày**: 28/12/2025

---

## 📋 Mục tiêu

Thiết kế 2 MongoDB Schema chính:
1. **Blacklist Schema**: Lưu trữ danh sách URL lừa đảo đã được xác nhận
2. **Report Schema**: Lưu trữ báo cáo từ cộng đồng về các URL nghi ngờ

---

## 🗂️ Files đã tạo

```
src/models/
├── Blacklist.js    # Schema cho danh sách đen
├── Report.js       # Schema cho báo cáo
└── index.js        # Export tất cả models
```

---

## 1️⃣ Blacklist Schema

### Mục đích
Lưu trữ các URL lừa đảo đã được Admin xác nhận và phê duyệt.

### Cấu trúc dữ liệu

```javascript
{
  url: String,              // URL gốc
  normalizedUrl: String,    // URL đã chuẩn hóa (không có http, www)
  scamType: String,         // Loại lừa đảo
  dangerLevel: String,      // Mức độ nguy hiểm
  description: String,      // Mô tả chi tiết
  reportCount: Number,      // Số lượng báo cáo
  evidenceImages: [String], // Mảng URLs ảnh bằng chứng
  source: String,           // Nguồn (admin/community/auto-detect)
  isActive: Boolean,        // Trạng thái kích hoạt
  addedBy: ObjectId,        // Admin thêm vào
  relatedReports: [ObjectId], // Các báo cáo liên quan
  metadata: {               // Thông tin bổ sung
    ipAddress: String,
    country: String,
    domainAge: Number
  },
  createdAt: Date,          // Tự động
  updatedAt: Date           // Tự động
}
```

### Enum Values

#### scamType (10 loại)
```javascript
[
  'phishing',          // Lừa đảo thông tin cá nhân
  'fake-shop',         // Website bán hàng giả
  'investment-scam',   // Lừa đảo đầu tư
  'tech-support',      // Giả mạo hỗ trợ kỹ thuật
  'lottery-scam',      // Lừa đảo trúng thưởng
  'romance-scam',      // Lừa đảo tình cảm
  'malware',           // Phần mềm độc hại
  'crypto-scam',       // Lừa đảo tiền ảo
  'job-scam',          // Lừa đảo việc làm
  'other'              // Loại khác
]
```

#### dangerLevel (4 mức)
```javascript
['low', 'medium', 'high', 'critical']
```

#### source (3 nguồn)
```javascript
['admin', 'community', 'auto-detect']
```

### Indexes (Tối ưu tìm kiếm)

```javascript
// Index chính
{ normalizedUrl: 1, isActive: 1 }    // Tìm kiếm URL nhanh
{ scamType: 1, dangerLevel: 1 }      // Lọc theo loại và mức độ
{ createdAt: -1 }                     // Sắp xếp mới nhất
```

### Methods & Statics

#### Instance Methods
```javascript
// Tăng số lượng báo cáo
await blacklistDoc.incrementReportCount();
```

#### Static Methods
```javascript
// Tìm URL theo chuẩn hóa
const result = await Blacklist.findByNormalizedUrl('example.com');

// Lấy 20 scam mới nhất
const latest = await Blacklist.getLatestScams(20);
```

### Virtual Fields
```javascript
// Tính tuổi (số ngày) của bản ghi
blacklistDoc.age // => 5 (ngày)
```

---

## 2️⃣ Report Schema

### Mục đích
Lưu trữ báo cáo từ cộng đồng về các URL nghi ngờ lừa đảo, chờ Admin xét duyệt.

### Cấu trúc dữ liệu

```javascript
{
  url: String,              // URL được báo cáo
  normalizedUrl: String,    // URL chuẩn hóa
  reason: String,           // Lý do báo cáo (10-2000 ký tự)
  scamType: String,         // Loại lừa đảo
  evidenceImages: [String], // Ảnh bằng chứng
  
  reporterInfo: {           // Thông tin người báo cáo
    name: String,
    email: String,
    phone: String,
    isAnonymous: Boolean
  },
  reporterUserId: ObjectId, // Nếu đã đăng nhập
  
  status: String,           // pending/approved/rejected/processing
  priority: String,         // low/normal/high/urgent
  
  adminNotes: String,       // Ghi chú của Admin
  reviewedBy: ObjectId,     // Admin xét duyệt
  reviewedAt: Date,         // Thời gian xét duyệt
  
  ipAddress: String,        // IP người gửi (chống spam)
  userAgent: String,        // Trình duyệt
  
  duplicateOf: ObjectId,    // Nếu trùng lặp
  isDuplicate: Boolean,     // Flag trùng lặp
  
  createdAt: Date,          // Tự động
  updatedAt: Date           // Tự động
}
```

### Enum Values

#### status (4 trạng thái)
```javascript
['pending', 'approved', 'rejected', 'processing']
```

#### priority (4 mức)
```javascript
['low', 'normal', 'high', 'urgent']
```

### Validation Rules

- `reason`: 10-2000 ký tự
- `email`: Regex validation
- `reporterInfo.name`: Max 100 ký tự
- `adminNotes`: Max 1000 ký tự

### Indexes

```javascript
{ status: 1, createdAt: -1 }          // Lọc theo trạng thái
{ normalizedUrl: 1 }                  // Tìm theo URL
{ reviewedBy: 1, reviewedAt: -1 }     // Lọc theo Admin
```

### Methods & Statics

#### Instance Methods
```javascript
// Phê duyệt báo cáo
await reportDoc.approve(adminId, 'Đã xác nhận là lừa đảo');

// Từ chối báo cáo
await reportDoc.reject(adminId, 'Không đủ bằng chứng');
```

#### Static Methods
```javascript
// Lấy 50 báo cáo chờ duyệt
const pending = await Report.getPendingReports(50);

// Kiểm tra URL đã được báo cáo chưa
const duplicate = await Report.checkDuplicate('example.com');
```

### Virtual Fields
```javascript
// Số ngày chờ duyệt
reportDoc.pendingDays // => 3 (ngày)
```

### Pre-save Hook

Tự động phát hiện báo cáo trùng lặp:
```javascript
// Trước khi lưu, tự động kiểm tra duplicate
// Nếu có báo cáo pending cùng URL => đánh dấu isDuplicate
```

---

## 🔗 Mối quan hệ giữa Schemas

```
Report (pending) 
    ↓ Admin Approve
Blacklist (active)
    ↑
    └─ relatedReports: [Report IDs]
```

**Workflow**:
1. User gửi Report → Status: `pending`
2. Admin xét duyệt → `approve()` hoặc `reject()`
3. Nếu approve → Tạo bản ghi mới trong Blacklist
4. Blacklist lưu reference đến Report gốc

---

## 📊 Use Cases

### Blacklist Schema
- ✅ Tra cứu URL có trong danh sách đen không
- ✅ Hiển thị Newsfeed 20 scam mới nhất
- ✅ Lọc theo loại lừa đảo / mức độ nguy hiểm
- ✅ Admin CRUD quản lý danh sách

### Report Schema
- ✅ User gửi báo cáo (có/không đăng nhập)
- ✅ Admin lấy danh sách báo cáo chờ duyệt
- ✅ Admin approve/reject báo cáo
- ✅ Tự động phát hiện báo cáo trùng lặp
- ✅ Thống kê số lượng báo cáo

---

## 🧪 Ví dụ sử dụng

### Tạo Blacklist mới
```javascript
import { Blacklist } from './models/index.js';

const newScam = await Blacklist.create({
  url: 'https://fake-shop-scam.com',
  normalizedUrl: 'fake-shop-scam.com',
  scamType: 'fake-shop',
  dangerLevel: 'high',
  description: 'Website bán hàng giả mạo',
  source: 'community',
  addedBy: adminId
});
```

### Tạo Report mới
```javascript
import { Report } from './models/index.js';

const newReport = await Report.create({
  url: 'https://suspicious-site.com',
  normalizedUrl: 'suspicious-site.com',
  reason: 'Website này yêu cầu thông tin thẻ tín dụng nghi ngờ',
  scamType: 'phishing',
  reporterInfo: {
    name: 'Nguyễn Văn A',
    email: 'user@example.com',
    isAnonymous: false
  },
  ipAddress: req.ip
});
```

### Tra cứu URL
```javascript
// Kiểm tra URL có trong blacklist không
const isScam = await Blacklist.findByNormalizedUrl('example.com');

if (isScam) {
  console.log(`⚠️ Nguy hiểm: ${isScam.scamType} - ${isScam.dangerLevel}`);
}
```

### Lấy báo cáo chờ duyệt
```javascript
const pendingReports = await Report.getPendingReports(20);

console.log(`Có ${pendingReports.length} báo cáo chờ xét duyệt`);
```

### Admin phê duyệt
```javascript
const report = await Report.findById(reportId);

// Phê duyệt
await report.approve(adminId, 'Đã xác minh là lừa đảo');

// Tạo Blacklist từ Report
const blacklist = await Blacklist.create({
  url: report.url,
  normalizedUrl: report.normalizedUrl,
  scamType: report.scamType,
  dangerLevel: 'high',
  evidenceImages: report.evidenceImages,
  source: 'community',
  addedBy: adminId,
  relatedReports: [report._id]
});
```

---

## ⚙️ Cài đặt & Dependencies

### Package cần thiết
```json
{
  "dependencies": {
    "mongoose": "^8.0.3"
  }
}
```

### Import trong code
```javascript
// Cách 1: Import riêng lẻ
import Blacklist from './models/Blacklist.js';
import Report from './models/Report.js';

// Cách 2: Import tất cả (recommended)
import { Blacklist, Report } from './models/index.js';
```

---

## 🔒 Bảo mật & Validation

### Built-in Validation
- ✅ Required fields
- ✅ String length limits (minlength, maxlength)
- ✅ Enum validation
- ✅ Email format validation
- ✅ Unique constraint (normalizedUrl trong Blacklist)

### Indexes cho Performance
- ✅ Composite indexes cho queries phổ biến
- ✅ Single field indexes cho lookups
- ✅ Text indexes (có thể thêm sau cho full-text search)

---

## 📝 Notes & Best Practices

### 1. URL Normalization
- Luôn lưu cả `url` (gốc) và `normalizedUrl` (chuẩn hóa)
- normalizedUrl dùng cho so sánh và tìm kiếm
- Loại bỏ: protocol, www, trailing slash, query params (tùy case)

### 2. Duplicate Detection
- Report tự động check duplicate khi save
- Giúp giảm spam và merge reports
- Priority tự động set 'low' cho duplicates

### 3. Soft Delete
- Dùng `isActive` flag thay vì xóa hoàn toàn
- Giữ lại lịch sử và có thể khôi phục

### 4. Audit Trail
- Lưu `reviewedBy`, `reviewedAt` để audit
- Lưu `addedBy` để track Admin actions

### 5. Performance
- Index thường xuyên dùng fields
- Limit số lượng kết quả trả về
- Select only needed fields

---

## 🚀 Next Steps

Các tasks tiếp theo sẽ sử dụng 2 schemas này:

- **Task 12**: API Tra cứu URL → Dùng `Blacklist.findByNormalizedUrl()`
- **Task 13**: Helper chuẩn hóa URL → Tạo `normalizedUrl` field
- **Task 14**: Newsfeed → Dùng `Blacklist.getLatestScams()`
- **Task 15**: Gửi báo cáo → Tạo `Report` mới
- **Task 18**: CRUD Blacklist → Thao tác trực tiếp với Blacklist

---

## 📞 Liên hệ

- **Developer**: DEV B
- **Email**: [your-email]
- **Last Updated**: 28/12/2025

---

_Happy Coding! 🎉_
