# Task 15: API Gửi báo cáo

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Xây dựng API cho phép người dùng vãng lai gửi báo cáo về link nghi ngờ lừa đảo.

---

## Files đã tạo

```
src/
├── controllers/
│   └── reportController.js
├── routes/
│   └── reportRoutes.js
└── middlewares/
    └── validation.js
```

---

## API Endpoints

### 1. POST /api/reports

Gửi báo cáo mới.

**Request Body:**
```json
{
  "url": "https://suspicious-site.com",
  "reason": "Website này yêu cầu thông tin thẻ tín dụng một cách đáng ngờ",
  "scamType": "phishing",
  "reporterInfo": {
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "isAnonymous": false
  }
}
```

**Required Fields:**
- url
- reason (10-2000 ký tự)
- scamType

**Optional Fields:**
- reporterInfo (có thể để trống cho anonymous)

**Response - Success:**
```json
{
  "success": true,
  "message": "Báo cáo đã được gửi thành công",
  "data": {
    "reportId": "67890abcdef123456",
    "status": "pending",
    "isDuplicate": false
  }
}
```

**Response - Duplicate:**
```json
{
  "success": true,
  "message": "Báo cáo đã được ghi nhận. URL này đã được báo cáo trước đó.",
  "data": {
    "reportId": "67890abcdef123456",
    "status": "pending",
    "isDuplicate": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "reason",
      "message": "Lý do phải từ 10-2000 ký tự"
    }
  ]
}
```

---

### 2. GET /api/reports/status/:reportId

Kiểm tra trạng thái báo cáo.

**Request:**
```
GET /api/reports/status/67890abcdef123456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "submittedAt": "2025-12-28T10:00:00.000Z",
    "reviewedAt": "2025-12-28T15:30:00.000Z",
    "adminNotes": null
  }
}
```

**Status values:**
- pending: Chờ xét duyệt
- processing: Đang xử lý
- approved: Đã duyệt
- rejected: Từ chối

---

### 3. GET /api/reports/user

Lấy danh sách báo cáo của user theo email.

**Query Parameters:**
- email (required)

**Request:**
```
GET /api/reports/user?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "_id": "...",
      "url": "https://scam1.com",
      "scamType": "phishing",
      "status": "approved",
      "createdAt": "2025-12-28T10:00:00.000Z",
      "reviewedAt": "2025-12-28T15:30:00.000Z"
    }
  ]
}
```

---

## Validation Rules

**url:**
- Required
- Must be valid URL format
- Normalized before save

**reason:**
- Required
- Min: 10 characters
- Max: 2000 characters

**scamType:**
- Required
- Must be one of: phishing, fake-shop, investment-scam, tech-support, lottery-scam, romance-scam, malware, crypto-scam, job-scam, other

**reporterInfo.name:**
- Optional
- Max: 100 characters

**reporterInfo.email:**
- Optional
- Must be valid email format
- Auto normalized

**reporterInfo.phone:**
- Optional

---

## Auto Processing

### Duplicate Detection

Tự động kiểm tra URL đã được báo cáo chưa:
```javascript
const duplicate = await Report.checkDuplicate(normalizedUrl);
```

Nếu duplicate:
- isDuplicate: true
- priority: low
- duplicateOf: original report ID

---

### IP Tracking

Lưu IP address để chống spam:
```javascript
ipAddress: req.ip || req.connection.remoteAddress
```

---

### User Agent

Lưu thông tin trình duyệt:
```javascript
userAgent: req.get('user-agent')
```

---

## Anonymous Reporting

User có thể báo cáo ẩn danh:
```json
{
  "url": "https://scam.com",
  "reason": "Lừa đảo",
  "scamType": "phishing",
  "reporterInfo": {
    "isAnonymous": true
  }
}
```

Hoặc không gửi reporterInfo:
```json
{
  "url": "https://scam.com",
  "reason": "Lừa đảo",
  "scamType": "phishing"
}
```

---

## Testing với Postman

### Test Case 1: Gửi báo cáo thành công

**Request:**
```
POST http://localhost:5000/api/reports
Content-Type: application/json

{
  "url": "https://fake-bank.com",
  "reason": "Website giả mạo ngân hàng, yêu cầu nhập mật khẩu",
  "scamType": "phishing",
  "reporterInfo": {
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Expected:**
- Status: 201
- reportId được trả về
- status: pending

---

### Test Case 2: URL không hợp lệ

**Request:**
```json
{
  "url": "not-a-url",
  "reason": "This is a scam site",
  "scamType": "phishing"
}
```

**Expected:**
- Status: 400
- message: "URL không hợp lệ"

---

### Test Case 3: Lý do quá ngắn

**Request:**
```json
{
  "url": "https://scam.com",
  "reason": "Scam",
  "scamType": "phishing"
}
```

**Expected:**
- Status: 400
- errors: "Lý do phải từ 10-2000 ký tự"

---

### Test Case 4: Báo cáo trùng lặp

**Setup:** Gửi report cho cùng 1 URL 2 lần

**Expected:**
- Lần 1: isDuplicate: false
- Lần 2: isDuplicate: true, message chứa "đã được báo cáo trước đó"

---

### Test Case 5: Kiểm tra trạng thái

**Request:**
```
GET http://localhost:5000/api/reports/status/67890abcdef123456
```

**Expected:**
- Status hiện tại
- Thời gian submit và review

---

### Test Case 6: Lấy báo cáo theo email

**Request:**
```
GET http://localhost:5000/api/reports/user?email=test@example.com
```

**Expected:**
- Danh sách tất cả reports của email đó
- Sắp xếp mới nhất trước

---

## Integration Frontend

### Submit Report Form

```javascript
const submitReport = async (formData) => {
  const response = await fetch('http://localhost:5000/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: formData.url,
      reason: formData.reason,
      scamType: formData.scamType,
      reporterInfo: {
        name: formData.name,
        email: formData.email,
        isAnonymous: formData.isAnonymous,
      },
    }),
  });

  const data = await response.json();

  if (data.success) {
    alert(`Báo cáo đã gửi! ID: ${data.data.reportId}`);
  }
};
```

### Check Report Status

```javascript
const checkStatus = async (reportId) => {
  const response = await fetch(
    `http://localhost:5000/api/reports/status/${reportId}`
  );
  const data = await response.json();
  return data.data.status;
};
```

---

## Security

**Rate Limiting:**
Sẽ implement ở Task 19 để chống spam

**IP Tracking:**
Lưu IP để phát hiện abuse

**Validation:**
Express-validator kiểm tra tất cả input

**Email Normalization:**
Tự động lowercase và trim

---

## Workflow

```
User Submit Report
    ↓
Validate Input (express-validator)
    ↓
Validate URL (isValidUrl)
    ↓
Normalize URL (normalizeUrl)
    ↓
Check Duplicate (Report.checkDuplicate)
    ↓
Save Report with status: pending
    ↓
Return reportId
```

---

## Database

**Report Document:**
```javascript
{
  url: "https://scam.com",
  normalizedUrl: "scam.com",
  reason: "...",
  scamType: "phishing",
  reporterInfo: {...},
  status: "pending",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  isDuplicate: false,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Next Steps

Task 15 hoàn thành, chuẩn bị cho:
- Task 16: Upload ảnh bằng chứng (Cloudinary)
- Task 17: API thống kê
- Task 19: Rate limiting cho report endpoint
- Admin API để approve/reject reports (DEV A)

---

Last Updated: 28/12/2025
