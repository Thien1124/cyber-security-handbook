# Task 14: API Public Newsfeed

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Xây dựng API lấy danh sách link lừa đảo mới nhất để hiển thị trên trang chủ.

---

## Files đã tạo

```
src/
├── controllers/
│   └── newsfeedController.js
└── routes/
    └── newsfeedRoutes.js
```

---

## API Endpoints

### 1. GET /api/newsfeed

Lấy danh sách scam mới nhất với phân trang.

**Query Parameters:**
- limit (optional): Số bản ghi mỗi trang (default: 20, max: 50)
- page (optional): Số trang (default: 1)
- scamType (optional): Lọc theo loại lừa đảo
- dangerLevel (optional): Lọc theo mức độ nguy hiểm

**Request:**
```
GET /api/newsfeed?limit=10&page=1
GET /api/newsfeed?scamType=phishing&dangerLevel=high
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "url": "https://fake-bank.com",
      "scamType": "phishing",
      "dangerLevel": "critical",
      "description": "Website giả mạo ngân hàng",
      "reportCount": 25,
      "createdAt": "2025-12-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 100,
    "recordsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. GET /api/newsfeed/top

Lấy danh sách scam có số lượng báo cáo cao nhất.

**Query Parameters:**
- limit (optional): Số bản ghi (default: 10)

**Request:**
```
GET /api/newsfeed/top?limit=5
```

**Response:**
```json
{
  "success": true,
  "total": 5,
  "data": [
    {
      "url": "https://most-reported-scam.com",
      "scamType": "fake-shop",
      "dangerLevel": "high",
      "reportCount": 150,
      "createdAt": "2025-12-20T00:00:00.000Z"
    }
  ]
}
```

---

### 3. GET /api/newsfeed/by-type

Thống kê số lượng scam theo từng loại.

**Request:**
```
GET /api/newsfeed/by-type
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "scamType": "phishing",
      "count": 45
    },
    {
      "scamType": "fake-shop",
      "count": 32
    },
    {
      "scamType": "investment-scam",
      "count": 28
    }
  ]
}
```

---

## Query Optimization

**Index sử dụng:**
```javascript
{ createdAt: -1 }
{ isActive: 1, scamType: 1 }
{ reportCount: -1 }
```

**Pagination:**
```javascript
.skip((page - 1) * limit)
.limit(limit)
```

**Parallel queries:**
```javascript
Promise.all([
  Blacklist.find(query).skip(skip).limit(limit),
  Blacklist.countDocuments(query)
])
```

---

## Filter Options

**scamType:**
- phishing
- fake-shop
- investment-scam
- tech-support
- lottery-scam
- romance-scam
- malware
- crypto-scam
- job-scam
- other

**dangerLevel:**
- low
- medium
- high
- critical

---

## Use Cases

### Homepage Display

```javascript
fetch('/api/newsfeed?limit=10')
  .then(res => res.json())
  .then(data => {
    displayScams(data.data);
  });
```

### Filter by Type

```javascript
fetch('/api/newsfeed?scamType=phishing&limit=20')
  .then(res => res.json())
  .then(data => {
    displayPhishingScams(data.data);
  });
```

### Top Reported Scams Widget

```javascript
fetch('/api/newsfeed/top?limit=5')
  .then(res => res.json())
  .then(data => {
    displayTopScams(data.data);
  });
```

---

## Testing với Postman

### Test Case 1: Lấy newsfeed mặc định

**Request:**
```
GET http://localhost:5000/api/newsfeed
```

**Expected:**
- 20 bản ghi đầu tiên
- Sắp xếp theo createdAt mới nhất

---

### Test Case 2: Phân trang

**Request:**
```
GET http://localhost:5000/api/newsfeed?limit=5&page=2
```

**Expected:**
- 5 bản ghi
- Trang 2
- hasNextPage: true/false
- hasPrevPage: true

---

### Test Case 3: Filter theo scamType

**Request:**
```
GET http://localhost:5000/api/newsfeed?scamType=phishing
```

**Expected:**
- Chỉ trả về scam type phishing

---

### Test Case 4: Top scams

**Request:**
```
GET http://localhost:5000/api/newsfeed/top?limit=10
```

**Expected:**
- Sắp xếp theo reportCount giảm dần

---

### Test Case 5: Scams by type

**Request:**
```
GET http://localhost:5000/api/newsfeed/by-type
```

**Expected:**
```json
{
  "success": true,
  "data": [
    { "scamType": "phishing", "count": 45 },
    { "scamType": "fake-shop", "count": 32 }
  ]
}
```

---

## Performance

**Pagination:** O(n) với skip/limit
**Top scams:** O(n log n) với sort
**Aggregation:** O(n) với group

**Optimization:**
- Sử dụng lean() để giảm memory
- Select only needed fields
- Index trên createdAt và reportCount

---

## Validation

**Limit:**
- Mặc định: 20
- Tối đa: 50
- Nếu > 50: Return error 400

**Page:**
- Mặc định: 1
- Tối thiểu: 1

---

## Error Handling

**400 Bad Request:**
- limit > 50

**500 Internal Server Error:**
- Database error
- Query error

---

## Integration Frontend

```javascript
const fetchNewsfeed = async (page = 1, limit = 20) => {
  const response = await fetch(
    `http://localhost:5000/api/newsfeed?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data;
};

const NewsfeedComponent = () => {
  const [scams, setScams] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNewsfeed(page, 10).then(data => {
      setScams(data.data);
    });
  }, [page]);

  return (
    <div>
      {scams.map(scam => (
        <ScamCard key={scam._id} scam={scam} />
      ))}
      <Pagination currentPage={page} onChange={setPage} />
    </div>
  );
};
```

---

## Next Steps

Task 14 hoàn thành, chuẩn bị cho:
- Task 15: API gửi báo cáo
- Task 17: API thống kê
- Frontend integration

---

Last Updated: 28/12/2025
