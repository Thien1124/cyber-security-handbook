# Task 20: Postman Collection Scripts

DEV B | Status: Hoàn thành | Ngày: 28/12/2025

---

## Mục tiêu

Tạo Postman Collection với test scripts tự động để kiểm tra tất cả API endpoints.

---

## Files đã tạo

```
postman/
├── Cyber-Security-API.postman_collection.json
└── Development.postman_environment.json
```

---

## Import vào Postman

**Bước 1: Import Collection**
1. Mở Postman
2. Click Import
3. Chọn file: `Cyber-Security-API.postman_collection.json`

**Bước 2: Import Environment**
1. Click Environments
2. Import
3. Chọn file: `Development.postman_environment.json`

**Bước 3: Chọn Environment**
1. Chọn "Cyber Security - Development" từ dropdown

---

## Collection Structure

### 1. Search
- Check URL - Safe
- Check URL - Invalid  
- Bulk Check URLs

### 2. Newsfeed
- Get Newsfeed
- Get Top Scams

### 3. Reports
- Submit Report
- Get Report Status

### 4. Statistics
- Get Statistics
- Get Trending Scams

### 5. Blacklist
- Create Blacklist
- Get All Blacklist
- Update Blacklist
- Delete Blacklist

---

## Test Scripts

### Automated Tests

Mỗi request có test scripts tự động:

**Status Code:**
```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});
```

**Response Structure:**
```javascript
pm.test('Response has success field', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

**Data Types:**
```javascript
pm.test('Response data is array', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

---

## Environment Variables

**baseUrl:** http://localhost:5000

**Dynamic Variables:**
- reportId: Auto-set sau khi submit report
- blacklistId: Auto-set sau khi create blacklist

---

## Running Tests

### Single Request
1. Chọn request
2. Click Send
3. Xem Tests tab để check kết quả

### Run Collection
1. Click Collection
2. Click Run
3. Chọn requests muốn test
4. Click Run Cyber Security API

### Collection Runner Results
- Total tests
- Passed tests
- Failed tests
- Response times

---

## Test Scenarios

### Scenario 1: Submit and Track Report

**Step 1:** Submit Report
- Auto save reportId to environment

**Step 2:** Get Report Status
- Use saved reportId
- Verify status = "pending"

---

### Scenario 2: CRUD Blacklist

**Step 1:** Create Blacklist
- Auto save blacklistId

**Step 2:** Update Blacklist
- Use saved blacklistId

**Step 3:** Delete Blacklist
- Use saved blacklistId

---

## Dynamic Data

**Random URLs:**
```json
"url": "https://test-scam-{{$randomInt}}.com"
```

**Random Data:**
- $randomInt
- $randomUUID
- $timestamp

---

## Pre-request Scripts

Có thể thêm pre-request scripts:

```javascript
pm.environment.set("timestamp", Date.now());
```

---

## Response Validation

**Check JSON structure:**
```javascript
pm.test('Valid JSON response', function () {
    pm.response.to.be.json;
});
```

**Check response time:**
```javascript
pm.test('Response time < 500ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## CI/CD Integration

**Run with Newman:**
```bash
npm install -g newman

newman run Cyber-Security-API.postman_collection.json \
  -e Development.postman_environment.json \
  --reporters cli,json
```

---

## Common Tests

**Success response:**
```javascript
pm.test('Success is true', function () {
    pm.expect(pm.response.json().success).to.be.true;
});
```

**Error handling:**
```javascript
pm.test('Error has message', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.message).to.be.a('string');
});
```

**Pagination:**
```javascript
pm.test('Has pagination', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.pagination).to.have.property('currentPage');
});
```

---

## Best Practices

**1. Test order:**
- Create before Read/Update/Delete
- Submit report before check status

**2. Cleanup:**
- Delete test data sau khi test

**3. Environment:**
- Use variables cho base URL
- Save IDs for chaining requests

**4. Assertions:**
- Test status code
- Test response structure
- Test data types

---

Last Updated: 28/12/2025
