# Task 18: API CRUD Blacklist

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

API quản lý CRUD cho Blacklist (Admin).

---

## Files đã tạo

```
src/
├── controllers/
│   └── blacklistController.js
└── routes/
    └── blacklistRoutes.js
```

---

## API Endpoints

### 1. GET /api/blacklist

Lấy danh sách blacklist với filter và phân trang.

**Query Parameters:**
- page (optional): Số trang (default: 1)
- limit (optional): Số bản ghi (default: 20)
- scamType (optional): Lọc theo loại
- dangerLevel (optional): Lọc theo mức độ
- search (optional): Tìm kiếm trong URL/description

**Request:**
```
GET /api/blacklist?page=1&limit=20&scamType=phishing&search=bank
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 200
  }
}
```

---

### 2. GET /api/blacklist/:id

Lấy chi tiết 1 bản ghi.

**Request:**
```
GET /api/blacklist/67890abcdef
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67890abcdef",
    "url": "https://scam.com",
    "scamType": "phishing",
    "dangerLevel": "high",
    "description": "...",
    "reportCount": 15
  }
}
```

---

### 3. POST /api/blacklist

Tạo blacklist mới.

**Request:**
```json
{
  "url": "https://new-scam.com",
  "scamType": "fake-shop",
  "dangerLevel": "high",
  "description": "Website bán hàng giả",
  "evidenceImages": ["https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thêm vào blacklist thành công",
  "data": {...}
}
```

---

### 4. PUT /api/blacklist/:id

Cập nhật blacklist.

**Request:**
```json
{
  "dangerLevel": "critical",
  "description": "Cập nhật mô tả"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "data": {...}
}
```

---

### 5. DELETE /api/blacklist/:id

Xóa blacklist (soft delete).

**Request:**
```
DELETE /api/blacklist/67890abcdef
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa thành công"
}
```

---

## Validation

**Create:**
- url, scamType, dangerLevel: Required
- URL format validation
- Duplicate check

**Update:**
- Partial update allowed
- Field validation

**Delete:**
- Soft delete (isActive = false)
- Không xóa vĩnh viễn

---

Last Updated: 28/12/2025
