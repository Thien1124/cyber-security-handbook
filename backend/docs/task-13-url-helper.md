# Task 13: Helper Chuẩn hóa URL

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Tạo bộ helper functions xử lý và chuẩn hóa URL để đảm bảo tính nhất quán khi:
- Lưu vào database
- So sánh URL
- Tìm kiếm trong blacklist

---

## Files đã tạo

```
src/utils/
├── urlNormalizer.js    # Helper functions
└── index.js            # Export utils
```

---

## Functions

### normalizeUrl(url)

Chuẩn hóa URL về dạng thống nhất để lưu vào database và so sánh.

**Input:**
```javascript
'HTTPS://WWW.Example.com/path/?query=1#hash'
'http://example.com/path/'
'www.example.com/path'
```

**Output:**
```javascript
'example.com/path'
'example.com/path'
'example.com/path'
```

**Xử lý:**
- Chuyển về lowercase
- Loại bỏ protocol (http://, https://)
- Loại bỏ www.
- Loại bỏ trailing slash
- Loại bỏ query string
- Loại bỏ hash/fragment

---

### extractDomain(url)

Trích xuất domain từ URL.

**Input:**
```javascript
'https://example.com/path/to/page'
'example.com/path'
```

**Output:**
```javascript
'example.com'
'example.com'
```

---

### isSameUrl(url1, url2)

So sánh 2 URL có giống nhau không sau khi chuẩn hóa.

**Usage:**
```javascript
isSameUrl('https://example.com', 'http://www.example.com/') // true
isSameUrl('example.com/page1', 'example.com/page2')         // false
```

---

### isSameDomain(url1, url2)

Kiểm tra 2 URL có cùng domain không.

**Usage:**
```javascript
isSameDomain('example.com/page1', 'example.com/page2')      // true
isSameDomain('example.com', 'another.com')                  // false
```

---

### isValidUrl(url)

Validate format URL có hợp lệ không.

**Usage:**
```javascript
isValidUrl('https://example.com')           // true
isValidUrl('example.com')                   // true
isValidUrl('not a url')                     // false
isValidUrl('12345')                         // false
```

**Regex pattern:**
```javascript
/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
```

---

### addProtocol(url)

Thêm https:// nếu URL chưa có protocol.

**Input:**
```javascript
'example.com'
'https://example.com'
```

**Output:**
```javascript
'https://example.com'
'https://example.com'
```

---

## Cách sử dụng

### Import

```javascript
import { normalizeUrl, isValidUrl } from './utils/index.js';

import urlNormalizer from './utils/urlNormalizer.js';
const normalized = urlNormalizer.normalizeUrl(url);
```

### Trong Controller

```javascript
import { normalizeUrl, isValidUrl } from '../utils/index.js';

export const createReport = async (req, res) => {
  const { url } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({ 
      success: false, 
      message: 'URL không hợp lệ' 
    });
  }

  const normalizedUrl = normalizeUrl(url);

  const report = await Report.create({
    url: url,
    normalizedUrl: normalizedUrl,
  });
};
```

### Trong Model Pre-save Hook

```javascript
import { normalizeUrl } from '../utils/index.js';

reportSchema.pre('save', function(next) {
  if (this.url && !this.normalizedUrl) {
    this.normalizedUrl = normalizeUrl(this.url);
  }
  next();
});
```

---

## Test Cases

### Chuẩn hóa URL

| Input | Output |
|-------|--------|
| `https://Example.COM/path` | `example.com/path` |
| `www.example.com` | `example.com` |
| `example.com/` | `example.com` |
| `example.com?id=123` | `example.com` |
| `example.com#section` | `example.com` |

### Validation

| Input | Valid? |
|-------|--------|
| `https://example.com` | true |
| `example.com` | true |
| `sub.example.com` | true |
| `not a url` | false |
| `123.456` | false |
| `''` | false |
| `null` | false |

---

## Use Cases trong dự án

### Task 12: Tra cứu URL
```javascript
const normalizedUrl = normalizeUrl(userInput);
const scam = await Blacklist.findByNormalizedUrl(normalizedUrl);
```

### Task 15: Gửi báo cáo
```javascript
if (!isValidUrl(url)) {
  return res.status(400).json({ error: 'URL không hợp lệ' });
}

const normalizedUrl = normalizeUrl(url);
const duplicate = await Report.checkDuplicate(normalizedUrl);
```

### Task 18: CRUD Blacklist
```javascript
const normalizedUrl = normalizeUrl(url);
await Blacklist.create({ url, normalizedUrl, ... });
```

---

## Edge Cases xử lý

**Empty/Null:**
```javascript
normalizeUrl('')       // ''
normalizeUrl(null)     // ''
normalizeUrl(undefined) // ''
```

**Uppercase:**
```javascript
normalizeUrl('EXAMPLE.COM') // 'example.com'
```

**Multiple slashes:**
```javascript
normalizeUrl('example.com///') // 'example.com'
```

**Complex query:**
```javascript
normalizeUrl('example.com?a=1&b=2&c=3') // 'example.com'
```

---

## Performance

Tất cả functions chạy O(n) với n là độ dài URL.
Sử dụng regex built-in nhanh và hiệu quả.

---

## Best Practices

**1. Luôn validate trước khi normalize:**
```javascript
if (isValidUrl(url)) {
  const normalized = normalizeUrl(url);
}
```

**2. Lưu cả 2 versions:**
```javascript
{
  url: 'https://Example.com/path',
  normalizedUrl: 'example.com/path'
}
```

**3. Dùng normalizedUrl cho queries:**
```javascript
Blacklist.findOne({ normalizedUrl: normalizeUrl(input) });
```

**4. Dùng url gốc cho display:**
```javascript
<a href={blacklist.url}>{blacklist.url}</a>
```

---

## Next Steps

Task 13 hoàn thành, chuẩn bị cho:
- Task 12: Sử dụng normalizeUrl() và isValidUrl()
- Task 14: Sử dụng normalizeUrl() khi query database
- Task 15: Validate và normalize URL trước khi lưu Report

---

Last Updated: 28/12/2025
