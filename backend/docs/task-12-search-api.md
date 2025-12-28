# Task 12: API Tra cứu nhanh URL

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Xây dựng API cho phép tra cứu URL trong danh sách đen (Blacklist) để kiểm tra link có phải lừa đảo không.

---

## Files đã tạo

```
src/
├── config/
│   └── database.js           # Kết nối MongoDB
├── controllers/
│   └── searchController.js   # Logic tra cứu
├── routes/
│   └── searchRoutes.js       # Định nghĩa routes
├── middlewares/
│   └── errorHandler.js       # Xử lý lỗi
└── server.js                 # Server chính
```

---

## API Endpoints

### 1. GET /api/search/check

Tra cứu 1 URL đơn lẻ.

**Request:**
```
GET /api/search/check?url=https://example-scam.com
```

**Query Parameters:**
- url (required): URL cần tra cứu

**Response - URL an toàn:**
```json
{
  "success": true,
  "isSafe": true,
  "message": "URL an toàn, không có trong danh sách đen",
  "data": null
}
```

**Response - URL lừa đảo:**
```json
{
  "success": true,
  "isSafe": false,
  "message": "Cảnh báo: URL này đã được xác nhận là lừa đảo",
  "data": {
    "url": "https://example-scam.com",
    "scamType": "phishing",
    "dangerLevel": "high",
    "description": "Website giả mạo ngân hàng",
    "reportCount": 15,
    "addedDate": "2025-12-20T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "URL không hợp lệ"
}
```

---

### 2. POST /api/search/bulk-check

Tra cứu nhiều URLs cùng lúc (tối đa 50).

**Request:**
```json
POST /api/search/bulk-check
Content-Type: application/json

{
  "urls": [
    "https://safe-site.com",
    "https://scam-site.com",
    "example.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "scamsFound": 1,
  "results": [
    {
      "url": "https://safe-site.com",
      "isSafe": true,
      "scamType": null,
      "dangerLevel": null
    },
    {
      "url": "https://scam-site.com",
      "isSafe": false,
      "scamType": "fake-shop",
      "dangerLevel": "high"
    },
    {
      "url": "example.com",
      "isSafe": true,
      "scamType": null,
      "dangerLevel": null
    }
  ]
}
```

---

## Luồng xử lý

### Single URL Check

```
User Input URL
    ↓
Validate URL format (isValidUrl)
    ↓
Normalize URL (normalizeUrl)
    ↓
Query Blacklist collection
    ↓
Return result (safe/scam)
```

### Bulk URL Check

```
Array of URLs
    ↓
Validate & Filter valid URLs
    ↓
Normalize all URLs
    ↓
Query Blacklist with $in operator
    ↓
Map results back to original URLs
    ↓
Return array of results
```

---

## Validation Rules

**URL Format:**
- Phải là string
- Phải match regex pattern
- Không được empty

**Bulk Check:**
- urls phải là array
- Tối đa 50 URLs
- Tối thiểu 1 URL

---

## Query Optimization

**Index sử dụng:**
```javascript
{ normalizedUrl: 1, isActive: 1 }
```

**Query pattern:**
```javascript
Blacklist.findOne({
  normalizedUrl: normalizedUrl,
  isActive: true
})
```

**Bulk query:**
```javascript
Blacklist.find({
  normalizedUrl: { $in: normalizedUrls },
  isActive: true
})
```

---

## Error Handling

**400 Bad Request:**
- URL thiếu hoặc invalid
- Array URLs empty
- Quá 50 URLs

**500 Internal Server Error:**
- Database connection error
- Query error

---

## Testing với Postman

### Test Case 1: URL an toàn

**Request:**
```
GET http://localhost:5000/api/search/check?url=google.com
```

**Expected:**
```json
{
  "success": true,
  "isSafe": true
}
```

---

### Test Case 2: URL lừa đảo

**Setup:** Tạo blacklist trước
```javascript
db.blacklists.insertOne({
  url: "https://fake-bank.com",
  normalizedUrl: "fake-bank.com",
  scamType: "phishing",
  dangerLevel: "critical",
  isActive: true
})
```

**Request:**
```
GET http://localhost:5000/api/search/check?url=https://fake-bank.com
```

**Expected:**
```json
{
  "success": true,
  "isSafe": false,
  "data": {
    "scamType": "phishing",
    "dangerLevel": "critical"
  }
}
```

---

### Test Case 3: URL không hợp lệ

**Request:**
```
GET http://localhost:5000/api/search/check?url=not-a-url
```

**Expected:**
```json
{
  "success": false,
  "message": "URL không hợp lệ"
}
```

---

### Test Case 4: Bulk check

**Request:**
```
POST http://localhost:5000/api/search/bulk-check
Content-Type: application/json

{
  "urls": ["google.com", "fake-bank.com", "facebook.com"]
}
```

**Expected:**
```json
{
  "success": true,
  "total": 3,
  "scamsFound": 1,
  "results": [...]
}
```

---

## Cách chạy server

### Install dependencies

```bash
cd backend
npm install
```

### Start server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server chạy tại: http://localhost:5000

---

## Integration với Frontend

```javascript
const checkUrl = async (url) => {
  const response = await fetch(
    `http://localhost:5000/api/search/check?url=${encodeURIComponent(url)}`
  );
  const data = await response.json();
  
  if (!data.isSafe) {
    alert(`Cảnh báo: ${data.data.scamType}`);
  }
};
```

---

## Performance

**Single query:** ~5-10ms
**Bulk query (50 URLs):** ~20-30ms

**Optimization:**
- Index trên normalizedUrl
- Select only needed fields
- Limit response size

---

## Security

**Rate Limiting:** Sẽ implement ở Task 19

**Input Validation:**
- Validate URL format
- Sanitize input
- Limit bulk size

**CORS:** Enabled cho phép frontend call

---

## Next Steps

Task 12 hoàn thành, chuẩn bị cho:
- Task 14: Public Newsfeed API
- Task 15: Report submission API
- Task 19: Rate limiting cho search endpoint

---

Last Updated: 28/12/2025
