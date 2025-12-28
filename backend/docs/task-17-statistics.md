# Task 17: API Thống kê

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Xây dựng API trả về thống kê tổng quan cho Dashboard.

---

## Files đã tạo

```
src/
├── controllers/
│   └── statsController.js
└── routes/
    └── statsRoutes.js
```

---

## API Endpoints

### 1. GET /api/stats

Thống kê tổng quan.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBlacklist": 1250,
      "totalReports": 3420,
      "pendingReports": 45,
      "approvedReports": 2800,
      "rejectedReports": 575
    },
    "scamsByType": [
      { "type": "phishing", "count": 450 },
      { "type": "fake-shop", "count": 320 },
      { "type": "investment-scam", "count": 280 }
    ],
    "scamsByDangerLevel": [
      { "level": "high", "count": 520 },
      { "level": "critical", "count": 380 },
      { "level": "medium", "count": 250 }
    ],
    "recentActivity": [
      {
        "url": "https://latest-scam.com",
        "scamType": "phishing",
        "createdAt": "2025-12-28T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. GET /api/stats/trending

Scams trending theo thời gian.

**Query Parameters:**
- days (optional): Số ngày (default: 7)

**Request:**
```
GET /api/stats/trending?days=30
```

**Response:**
```json
{
  "success": true,
  "period": "30 ngày qua",
  "data": [
    {
      "url": "https://trending-scam.com",
      "scamType": "crypto-scam",
      "dangerLevel": "high",
      "reportCount": 85,
      "createdAt": "2025-12-20T00:00:00.000Z"
    }
  ]
}
```

---

### 3. GET /api/stats/reports

Thống kê báo cáo.

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "status": "pending", "count": 45 },
      { "status": "approved", "count": 2800 },
      { "status": "rejected", "count": 575 }
    ],
    "byType": [
      { "type": "phishing", "count": 1200 },
      { "type": "fake-shop", "count": 850 }
    ]
  }
}
```

---

## Use Cases

### Dashboard Overview

```javascript
const fetchStats = async () => {
  const response = await fetch('/api/stats');
  const { data } = await response.json();
  
  displayOverview(data.overview);
  displayChart(data.scamsByType);
};
```

### Trending Chart

```javascript
const fetchTrending = async (days) => {
  const response = await fetch(`/api/stats/trending?days=${days}`);
  const { data } = await response.json();
  
  displayTrendingChart(data);
};
```

---

## Aggregation Queries

**Scams by type:**
```javascript
Blacklist.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$scamType', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

**Reports by status:**
```javascript
Report.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```

---

Last Updated: 28/12/2025
