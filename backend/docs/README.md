# 📚 Documentation - Cyber Security Backend

## Mục lục Tasks

Tài liệu hướng dẫn chi tiết cho từng task của dự án backend.

### 👤 P.Thiện: NGHIỆP VỤ LÕI & DỮ LIỆU

- [✅ Task 11: Thiết kế Blacklist & Report Schema](./task-11-schemas.md)
- [✅ Task 12: API Tra cứu nhanh URL](./task-12-search-api.md)
- [✅ Task 13: Helper Chuẩn hóa URL](./task-13-url-helper.md)
- [✅ Task 14: API Public Newsfeed](./task-14-newsfeed.md)
- [✅ Task 15: API Gửi báo cáo (Public)](./task-15-report-api.md)
- [✅ Task 16: Tích hợp Multer & Cloudinary](./task-16-upload.md)
- [✅ Task 17: API Thống kê](./task-17-statistics.md)
- [✅ Task 18: API CRUD Blacklist](./task-18-crud-blacklist.md)
- [✅ Task 19: Triển khai Rate Limiting](./task-19-rate-limiting.md)
- [✅ Task 20: Postman Collection Scripts](./task-20-postman.md)

---

## Cấu trúc thư mục Backend

```
backend/
├── src/
│   ├── models/          # Database models (Mongoose schemas)
│   ├── controllers/     # Business logic handlers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Helper functions
│   └── config/          # Configuration files
├── docs/                # Documentation
├── package.json
└── .env
```

---

## Quy ước đặt tên

- **Models**: PascalCase (VD: `Blacklist.js`, `Report.js`)
- **Controllers**: camelCase + Controller suffix (VD: `blacklistController.js`)
- **Routes**: kebab-case (VD: `blacklist-routes.js`)
- **Utils**: camelCase (VD: `urlNormalizer.js`)

---

## Workflow phát triển

1. Tạo Schema trong `models/`
2. Viết Controller logic trong `controllers/`
3. Định nghĩa Routes trong `routes/`
4. Test bằng Postman
5. Viết documentation trong `docs/`

---

_Cập nhật: 28/12/2025_
