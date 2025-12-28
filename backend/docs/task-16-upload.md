# Task 16: Tích hợp Multer & Cloudinary

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Xử lý upload ảnh bằng chứng lừa đảo lên Cloudinary.

---

## Files đã tạo

```
src/
├── config/
│   └── cloudinary.js
├── controllers/
│   └── uploadController.js
├── routes/
│   └── uploadRoutes.js
└── middlewares/
    └── upload.js
uploads/
```

---

## Cấu hình Cloudinary

**File: .env**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Lấy credentials:**
1. Đăng ký tại https://cloudinary.com
2. Dashboard > Account Details
3. Copy Cloud Name, API Key, API Secret

---

## API Endpoints

### 1. POST /api/upload

Upload 1-5 ảnh.

**Request:**
```
POST /api/upload
Content-Type: multipart/form-data

images: [file1, file2, file3]
```

**Response:**
```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "images": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg"
    ],
    "count": 2
  }
}
```

---

### 2. DELETE /api/upload

Xóa ảnh từ Cloudinary.

**Request:**
```json
DELETE /api/upload
Content-Type: application/json

{
  "publicId": "scam-reports/image-123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa ảnh thành công"
}
```

---

## Validation

**File types:**
- jpg, jpeg, png, webp, gif

**File size:**
- Max: 5MB per file

**Quantity:**
- Max: 5 files per request

**Auto processing:**
- Resize: Max 1200x1200 (giữ tỷ lệ)
- Quality: Auto optimize
- Format: Auto convert

---

## Multer Configuration

**Storage:**
```javascript
diskStorage({
  destination: 'uploads/',
  filename: fieldname-timestamp-random.ext
})
```

**Limits:**
```javascript
{
  fileSize: 5 * 1024 * 1024
}
```

**Filter:**
```javascript
allowedTypes: /jpeg|jpg|png|webp|gif/
```

---

## Cloudinary Configuration

**Upload settings:**
```javascript
{
  folder: 'scam-reports',
  resource_type: 'auto',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [
    { width: 1200, height: 1200, crop: 'limit' },
    { quality: 'auto' }
  ]
}
```

---

## Workflow

```
User Upload Files
    ↓
Multer saves to uploads/ folder
    ↓
Upload to Cloudinary
    ↓
Delete local files
    ↓
Return Cloudinary URLs
```

---

## Integration với Report API

**Submit report with images:**

Step 1: Upload images
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { data } = await uploadRes.json();
const imageUrls = data.images;
```

Step 2: Submit report
```javascript
await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://scam.com',
    reason: 'Lừa đảo',
    scamType: 'phishing',
    evidenceImages: imageUrls
  })
});
```

---

## Testing với Postman

### Test Case 1: Upload ảnh thành công

**Request:**
```
POST http://localhost:5000/api/upload
Body: form-data
  - images: [file1.jpg]
  - images: [file2.png]
```

**Expected:**
- Status: 200
- Array URLs từ Cloudinary

---

### Test Case 2: File không hợp lệ

**Request:**
```
POST /api/upload
Body: form-data
  - images: [document.pdf]
```

**Expected:**
- Status: 400
- Error: "Chỉ chấp nhận file ảnh"

---

### Test Case 3: File quá lớn

**Request:**
```
Upload file > 5MB
```

**Expected:**
- Status: 400
- Error: "File too large"

---

### Test Case 4: Quá 5 ảnh

**Request:**
```
Upload 6 files
```

**Expected:**
- Status: 400
- Error: "Tối đa 5 ảnh mỗi lần upload"

---

## Error Handling

**Multer errors:**
- LIMIT_FILE_SIZE: File quá lớn
- LIMIT_UNEXPECTED_FILE: Field name sai

**Cloudinary errors:**
- Upload failed: Network error
- Invalid credentials: Check .env

**Cleanup:**
- Auto delete local files sau upload
- Xóa files nếu có lỗi

---

## Frontend Example

### Upload Form

```javascript
const handleImageUpload = async (files) => {
  const formData = new FormData();
  
  for (const file of files) {
    formData.append('images', file);
  }

  const response = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.data.images;
};
```

### React Component

```javascript
const ReportForm = () => {
  const [images, setImages] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert('Tối đa 5 ảnh');
      return;
    }

    const imageUrls = await handleImageUpload(files);
    setImages(imageUrls);
  };

  const handleSubmit = async () => {
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: formData.url,
        reason: formData.reason,
        scamType: formData.scamType,
        evidenceImages: images
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={handleFileChange}
      />
      <button type="submit">Gửi báo cáo</button>
    </form>
  );
};
```

---

## Security

**File validation:**
- Type checking (extension + mimetype)
- Size limit
- Quantity limit

**Cloudinary:**
- Signed uploads
- Access control
- Auto moderation (optional)

**Local cleanup:**
- Delete temp files
- Error handling

---

## Performance

**Optimization:**
- Auto resize images
- Quality compression
- Parallel uploads
- Lazy loading

**Cloudinary CDN:**
- Fast delivery
- Auto format
- Responsive images

---

## Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Folder Structure

```
uploads/              # Temporary local storage
  images-*.jpg       # Auto deleted after upload

Cloudinary:
  scam-reports/      # Cloud storage folder
    image1.jpg
    image2.png
```

---

## Next Steps

Task 16 hoàn thành, chuẩn bị cho:
- Task 17: API thống kê
- Task 18: CRUD Blacklist với image upload
- Frontend integration

---

Last Updated: 28/12/2025
