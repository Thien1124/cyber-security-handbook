# Task 19: Rate Limiting

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Triển khai rate limiting để chống spam và bảo vệ API.

---

## Files đã tạo

```
src/
└── middlewares/
    └── rateLimiter.js
```

---

## Rate Limiters

### 1. generalLimiter

Áp dụng cho toàn bộ API.

**Config:**
- Window: 15 phút
- Max requests: 100
- Message: "Quá nhiều request, vui lòng thử lại sau 15 phút"

---

### 2. searchLimiter

Áp dụng cho /api/search endpoints.

**Config:**
- Window: 1 phút
- Max requests: 30
- Message: "Quá nhiều request tra cứu, vui lòng thử lại sau 1 phút"

**Applied to:**
- GET /api/search/check
- POST /api/search/bulk-check

---

### 3. reportLimiter

Áp dụng cho submit reports.

**Config:**
- Window: 15 phút
- Max requests: 5
- Message: "Quá nhiều báo cáo, vui lòng thử lại sau 15 phút"

**Applied to:**
- POST /api/reports

---

### 4. uploadLimiter

Áp dụng cho upload ảnh.

**Config:**
- Window: 15 phút
- Max requests: 10
- Message: "Quá nhiều upload, vui lòng thử lại sau 15 phút"

**Applied to:**
- POST /api/upload

---

### 5. strictLimiter

Rate limit nghiêm ngặt cho sensitive endpoints.

**Config:**
- Window: 1 phút
- Max requests: 5
- Message: "Quá nhiều request, vui lòng thử lại sau 1 phút"

---

## Implementation

**Global:**
```javascript
app.use(generalLimiter);
```

**Route-specific:**
```javascript
router.post('/', reportLimiter, createReport);
router.get('/check', searchLimiter, searchUrl);
```

---

## Response Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640000000
```

---

## Error Response

```json
{
  "success": false,
  "message": "Quá nhiều request, vui lòng thử lại sau 15 phút"
}
```

**Status Code:** 429 Too Many Requests

---

## Configuration

**Environment variables (optional):**
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Testing

**Test rate limit:**
```bash
for i in {1..35}; do
  curl http://localhost:5000/api/search/check?url=test.com
done
```

Request thứ 31 sẽ bị block.

---

Last Updated: 28/12/2025
