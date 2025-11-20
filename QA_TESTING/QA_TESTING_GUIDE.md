# QA TESTING GUIDE - PHONGTRO MODERN
## Hướng dẫn sử dụng bộ tài liệu kiểm thử theo chuẩn QA công ty

---

## 📋 TỔNG QUAN

Thư mục này chứa đầy đủ tài liệu kiểm thử cho dự án **Phongtro Modern** theo quy trình QA chuẩn công ty với 3 giai đoạn:

```
QA_TESTING/
├── TEST_PLAN_Phongtro_Modern.md           # Bước 1: Kế hoạch kiểm thử
├── TEST_CASES_Phongtro_Modern.csv         # Bước 2: Test cases chi tiết
├── TEST_SUMMARY_REPORT_Phongtro_Modern.md # Bước 3: Báo cáo tổng kết
└── QA_TESTING_GUIDE.md                    # File này (hướng dẫn)
```

---

## 🎯 QUY TRÌNH 3 BƯỚC

### **BƯỚC 1: TRƯỚC KHI TEST - Test Plan**
📄 File: `TEST_PLAN_Phongtro_Modern.md`

**Mục đích:** Lập kế hoạch kiểm thử trước khi bắt đầu test

**Nội dung:**
- Objectives (Mục tiêu kiểm thử)
- Scope (Phạm vi test gì, không test gì)
- Test Approach (Chiến lược: dùng Cypress automation)
- Test Tools (Cypress, Postman, Jest...)
- Severity & Priority Levels (Mức độ nghiêm trọng của bug)
- Test Schedule (Lịch trình 17 ngày)
- Entry/Exit Criteria
- Risks & Mitigation

**Cách sử dụng:**
1. Đọc toàn bộ file để hiểu kế hoạch test
2. Review và approve với team (QA Lead, Dev Lead, PO)
3. Dùng làm tài liệu tham khảo trong suốt quá trình test
4. Note: Đây là file Markdown, có thể export sang PDF nếu cần

---

### **BƯỚC 2: TRONG KHI TEST - Test Cases + Cypress Tests**
📊 File: `TEST_CASES_Phongtro_Modern.csv`  
🔧 Code: `/phongtro-modern/cypress/e2e/*.cy.ts`

**Mục đích:** Thực hiện kiểm thử theo test cases đã thiết kế

#### **A. Làm việc với Test Cases (File CSV)**

**Cấu trúc file Excel/CSV:**

| Cột | Mô tả |
|-----|-------|
| **Test Case ID** | TC_AUTH_01, TC_SEARCH_01... |
| **Module** | Authentication, Search, Payment... |
| **Test Case Description** | Mô tả ngắn gọn |
| **Preconditions** | Điều kiện trước khi test |
| **Test Steps** | Các bước thực hiện (1, 2, 3...) |
| **Input Data** | Dữ liệu đầu vào (email, password...) |
| **Expected Results** | Kết quả mong đợi |
| **Actual Results** | (Điền khi test) Kết quả thực tế |
| **Execution Status** | (Điền khi test) Pass/Fail/Blocked |
| **Bug Severity** | (Nếu fail) Critical/High/Medium/Low |
| **Bug Priority** | (Nếu fail) P0/P1/P2/P3 |
| **Bug ID** | (Nếu fail) Link đến GitHub Issue |
| **Cypress Test File** | File Cypress tương ứng |

**Cách sử dụng:**

1. **Mở file CSV trong Excel:**
   ```
   File > Open > TEST_CASES_Phongtro_Modern.csv
   ```

2. **Chọn test case để thực hiện:**
   - Bắt đầu từ TC_AUTH_01
   - Đọc kỹ Preconditions, Test Steps, Expected Results

3. **Chạy test tự động bằng Cypress:**
   ```bash
   # Mở Cypress UI để test thủ công
   cd phongtro-modern
   npm run cypress:open

   # Hoặc chạy tự động tất cả tests
   npm run cypress:run

   # Chạy test cụ thể
   npm run cypress:run -- --spec "cypress/e2e/1-auth.cy.ts"
   ```

4. **Ghi kết quả vào Excel:**
   
   **Nếu PASS:**
   ```
   Actual Results: [Ghi ngắn gọn kết quả thực tế]
   Execution Status: Pass
   Executed By: Your Name
   Execution Date: 2025-12-05
   ```

   **Nếu FAIL:**
   ```
   Actual Results: [Ghi chi tiết lỗi gì, màn hình nào]
   Execution Status: Fail
   Bug Severity: High (xem Test Plan section 7.1)
   Bug Priority: P1 (xem Test Plan section 7.2)
   Bug ID: #BUG-001 (tạo GitHub Issue)
   Notes: [Screenshot/video link, steps to reproduce]
   ```

#### **B. Map giữa Test Cases và Cypress Tests**

| Test Case Excel | Cypress Test File | Test trong Cypress |
|----------------|-------------------|-------------------|
| TC_AUTH_01-10 | `1-auth.cy.ts` | it('Should login with valid credentials') |
| TC_SEARCH_01-15 | `2-search.cy.ts` | it('Should search and display results') |
| TC_PROPERTY_01-10 | `3-property-detail.cy.ts` | it('Should display property details') |
| TC_RATING_01-08 | `9-rating.cy.ts` | it('Should submit rating') |
| TC_POST_01-12 | `6-post-management.cy.ts` | it('Should create new post') |
| TC_PAYMENT_01-08 | `7-payment.cy.ts` | it('Should view pricing packages') |
| TC_ADMIN_01-15 | `8-admin.cy.ts` | it('Should access admin dashboard') |
| TC_INTEGRATION_01-10 | `5-full-integration.cy.ts` | it('Should integrate frontend-backend') |

#### **C. Quy trình test hàng ngày**

**Sáng:**
1. Review test plan của ngày hôm đó
2. Check test environment (backend, database đã chạy chưa)
3. Chạy smoke tests (các test quan trọng nhất)

**Trong ngày:**
4. Chạy từng test case theo thứ tự
5. Ghi kết quả vào Excel ngay sau khi test xong
6. Nếu gặp bug:
   - Chụp screenshot/record video
   - Tạo GitHub Issue với template:
     ```markdown
     **Title:** [Module] Brief bug description
     **Severity:** Critical/High/Medium/Low
     **Priority:** P0/P1/P2/P3
     **Steps to Reproduce:**
     1. Step 1
     2. Step 2
     **Expected:** ...
     **Actual:** ...
     **Screenshot:** [link]
     **Environment:** Chrome 120, Windows 11
     ```
   - Copy Bug ID vào Excel

**Cuối ngày:**
7. Update test progress (bao nhiêu Pass/Fail)
8. Report cho QA Lead
9. Prepare test cases cho ngày mai

---

### **BƯỚC 3: SAU KHI TEST - Test Summary Report**
📊 File: `TEST_SUMMARY_REPORT_Phongtro_Modern.md`

**Mục đích:** Tổng kết toàn bộ quá trình testing

**Nội dung:**

**1. Executive Summary (Tóm tắt)**
   - Overall pass rate: 87%
   - Total bugs: 30 (2 Critical, 8 High, 12 Medium, 8 Low)
   - Recommendation: Fix critical bugs before release

**2. Test Results Tables**
   - **Table 1: Test Case Summary Results**
     ```
     Planned: 88
     Executed: 83 (94%)
     Passed: 70 (84%)
     Failed: 13 (16%)
     ```
   
   - **Table 2: Test Incident Summary**
     ```
     Critical: 2 bugs
     High: 8 bugs
     Medium: 12 bugs
     Low: 8 bugs
     ```

**3. Detailed Results by Module**
   - Auth: 8/10 passed
   - Search: 13/15 passed
   - Payment: 6/8 passed (có vấn đề)
   - ... chi tiết từng module

**4. Critical Bugs List**
   - BUG-007: Post deletion không xóa images
   - BUG-009: Payment callback fails
   - → Must fix before release

**5. Recommendations**
   - Immediate: Fix 2 critical bugs
   - Short-term: Fix 8 high bugs
   - Long-term: CI/CD, performance testing

**Cách sử dụng:**

1. **Trong quá trình test:**
   - Không cần động vào file này
   - Chỉ cần điền Excel và chạy Cypress

2. **Sau khi test xong hết:**
   - Mở file TEST_SUMMARY_REPORT
   - **Update số liệu từ Excel vào các bảng:**
     - Đếm số Pass/Fail từ Excel → điền vào Table 1
     - Đếm số bugs theo Severity → điền vào Table 2
     - Update test execution date, metrics
   
3. **Viết phần đánh giá:**
   - Section 4: Ghi chi tiết kết quả từng module
   - Section 5: List critical bugs
   - Section 10: Recommendations (đề xuất)
   - Section 11: Lessons Learned (bài học rút ra)

4. **Review và approve:**
   - QA Lead review
   - Dev Lead review
   - Product Owner sign-off
   - Section 12.3: Ký tên approval

5. **Export sang Word nếu cần:**
   - Dùng Pandoc: `pandoc TEST_SUMMARY_REPORT.md -o report.docx`
   - Hoặc copy-paste vào Word, giữ format

---

## 🚀 CÁCH CHẠY CYPRESS TESTS

### **Setup môi trường**

```bash
# 1. Chạy backend
cd server
npm install
npm start
# Backend chạy tại http://localhost:5000

# 2. Chạy frontend (terminal mới)
cd phongtro-modern
npm install
npm run dev
# Frontend chạy tại http://localhost:3000

# 3. Chạy Cypress
cd phongtro-modern
npm run cypress:open   # UI mode (recommended)
# hoặc
npm run cypress:run    # Headless mode (CI/CD)
```

### **Các lệnh Cypress**

```bash
# Mở Cypress Test Runner (UI)
npm run cypress:open

# Chạy tất cả tests (headless)
npm run cypress:run

# Chạy test file cụ thể
npm run cypress:run -- --spec "cypress/e2e/1-auth.cy.ts"

# Chạy test trên browser cụ thể
npm run cypress:run -- --browser chrome
npm run cypress:run -- --browser firefox
npm run cypress:run -- --browser edge

# Chạy test và record video
npm run cypress:run -- --record --key <your-key>

# Chạy test với config khác
npm run cypress:run -- --config baseUrl=https://staging.phongtro.com
```

### **Debug test khi fail**

1. **Xem video recording:**
   ```
   /cypress/videos/1-auth.cy.ts.mp4
   ```

2. **Xem screenshots:**
   ```
   /cypress/screenshots/1-auth.cy.ts/Should login with valid credentials (failed).png
   ```

3. **Chạy lại test trong UI mode:**
   ```bash
   npm run cypress:open
   # Click vào test file bị fail
   # Cypress sẽ mở browser, bạn xem được từng step
   ```

4. **Dùng Cypress Time Travel:**
   - Hover vào các step bên trái
   - Xem DOM snapshot tại thời điểm đó
   - Check console logs

---

## 📊 CÁCH ĐIỀN KẾT QUẢ VÀO EXCEL

### **Ví dụ cụ thể:**

**Test Case: TC_AUTH_01 - Login with valid credentials**

**Before testing:**
```
Test Case ID: TC_AUTH_01
Module: Authentication
Test Case Description: Login with valid credentials
Preconditions: User exists with email: user@test.com / User@123
Test Steps: 1. Navigate to /dang-nhap...
Input Data: Email: user@test.com | Password: User@123
Expected Results: 1. Login successful, 2. Redirected to /dashboard...
Actual Results: [EMPTY - chưa test]
Execution Status: [EMPTY]
```

**After running Cypress test (PASS):**
```
Actual Results: User logged in successfully. Redirected to /dashboard. User name "Test User" displayed in navbar. Token stored in localStorage.
Execution Status: Pass
Executed By: John Doe
Execution Date: 2025-12-05
```

**After running Cypress test (FAIL):**
```
Actual Results: Login succeeded but session expires after 5 minutes instead of 24 hours. User forced to re-login frequently.
Execution Status: Fail
Bug Severity: High
Bug Priority: P1
Bug ID: #BUG-001
Notes: Screenshot saved at cypress/screenshots/auth-session.png. JWT token expiry set to 300s instead of 86400s in config.
Executed By: John Doe
Execution Date: 2025-12-05
```

---

## 🐛 CÁCH PHÂN LOẠI BUG SEVERITY & PRIORITY

### **Severity (Mức độ nghiêm trọng)**

Xem Test Plan Section 7.1:

| Severity | Khi nào chọn | Ví dụ |
|----------|-------------|-------|
| **Critical** | Crash, mất data, không dùng được hệ thống | Database connection fails, Payment not processing, Cannot login |
| **High** | Chức năng chính không hoạt động | Search không trả về kết quả, không upload được ảnh |
| **Medium** | Chức năng hoạt động nhưng sai, có workaround | Sắp xếp sai thứ tự, UI lệch, load chậm |
| **Low** | Lỗi cosmetic, ít ảnh hưởng | Typo, màu sai, tooltip không hiện |

### **Priority (Độ ưu tiên fix)**

Xem Test Plan Section 7.2:

| Priority | Fix khi nào | Dùng cho bug nào |
|----------|-------------|------------------|
| **P0 - Must Fix** | Trước khi release | Critical bugs |
| **P1 - Should Fix** | Trong sprint này (3 days) | High bugs |
| **P2 - Fix Later** | Sprint sau (2 weeks) | Medium bugs |
| **P3 - Low** | Backlog (future) | Low bugs |

### **Ma trận Severity vs Priority**

|  | P0 | P1 | P2 | P3 |
|--|----|----|----|----|
| **Critical** | ✅ Luôn luôn | Hiếm khi | Không bao giờ | Không |
| **High** | Thỉnh thoảng | ✅ Thường | Hiếm khi | Không |
| **Medium** | Hiếm | Thỉnh thoảng | ✅ Thường | Hiếm |
| **Low** | Không | Hiếm | Thỉnh thoảng | ✅ Thường |

---

## 📈 CÁCH ĐẾM SỐ LIỆU CHO TEST SUMMARY REPORT

### **Bước 1: Đếm từ Excel**

Mở Excel, dùng formulas:

```excel
# Đếm total test cases executed
=COUNTA(H2:H100)  # Cột H = Execution Status

# Đếm Pass
=COUNTIF(H2:H100, "Pass")

# Đếm Fail
=COUNTIF(H2:H100, "Fail")

# Đếm Blocked
=COUNTIF(H2:H100, "Blocked")

# Đếm Critical bugs
=COUNTIF(I2:I100, "Critical")  # Cột I = Bug Severity

# Đếm High bugs
=COUNTIF(I2:I100, "High")
```

### **Bước 2: Điền vào Test Summary Report**

Mở file `TEST_SUMMARY_REPORT_Phongtro_Modern.md`, tìm **Section 3 - Table 1**:

```markdown
| **Test Status** | **Planned** | **Executed** | **Count** | **Percentage** |
|----------------|-------------|-------------|----------|---------------|
| **Planned** | 88 | - | 88 | 100% |
| **Executed** | - | [ĐIỀN VÀO ĐÂY] | [ĐIỀN] | [TÍNH %] |
| **Passed** | - | - | [ĐIỀN] | [TÍNH %] |
| **Failed** | - | - | [ĐIỀN] | [TÍNH %] |
```

Ví dụ điền:
```markdown
| **Executed** | - | 83 | 83 | 94.3% |  # 83/88 = 94.3%
| **Passed** | - | - | 70 | 84.3% |     # 70/83 = 84.3%
| **Failed** | - | - | 13 | 15.7% |     # 13/83 = 15.7%
```

---

## 🔍 CHECKLIST HOÀN THÀNH QUY TRÌNH QA

### **Trước khi bắt đầu:**
- [ ] Đọc Test Plan (TEST_PLAN_Phongtro_Modern.md)
- [ ] Review và approve Test Plan với team
- [ ] Setup test environment (backend, frontend, DB)
- [ ] Chuẩn bị test data (users, posts)
- [ ] Install Cypress dependencies

### **Trong khi test:**
- [ ] Mở Excel test cases
- [ ] Chạy Cypress tests từng file:
  - [ ] 1-auth.cy.ts
  - [ ] 2-search.cy.ts
  - [ ] 3-property-detail.cy.ts
  - [ ] 9-rating.cy.ts
  - [ ] 6-post-management.cy.ts
  - [ ] 7-payment.cy.ts
  - [ ] 8-admin.cy.ts
  - [ ] 5-full-integration.cy.ts
- [ ] Điền Actual Results vào Excel
- [ ] Điền Execution Status (Pass/Fail)
- [ ] Nếu Fail: tạo GitHub Issue, điền Bug ID
- [ ] Nếu Fail: phân loại Severity & Priority
- [ ] Daily report progress cho QA Lead

### **Sau khi test xong:**
- [ ] Đếm số liệu từ Excel (Pass/Fail/Total)
- [ ] Mở Test Summary Report
- [ ] Điền số liệu vào Table 1, Table 2
- [ ] Update Section 4: Detailed Results by Module
- [ ] Viết Section 5: List critical bugs
- [ ] Viết Section 10: Recommendations
- [ ] Viết Section 11: Lessons Learned
- [ ] Review report với QA Lead
- [ ] Get approval/sign-off
- [ ] Archive test evidence (videos, screenshots)
- [ ] Export sang Word/PDF nếu cần

---

## 🎓 MẸO VÀ BEST PRACTICES

### **1. Viết test cases tốt:**
- ✅ Rõ ràng, dễ hiểu (người khác đọc cũng test được)
- ✅ Có test data cụ thể (email: user@test.com, password: User@123)
- ✅ Expected Results chi tiết (redirected to /dashboard, token stored...)
- ❌ Không viết mơ hồ ("should work", "displays correctly")

### **2. Chạy Cypress hiệu quả:**
- ✅ Chạy UI mode khi develop/debug tests
- ✅ Chạy headless mode khi test regression (nhanh hơn)
- ✅ Dùng `cy.wait()` cho async operations
- ✅ Record video khi test fails (auto trong CI/CD)
- ❌ Không hard-code URLs, dùng Cypress config

### **3. Ghi bug reports tốt:**
- ✅ Steps to reproduce rõ ràng (ai cũng làm theo được)
- ✅ Có screenshot/video minh họa
- ✅ Ghi expected vs actual
- ✅ Ghi environment (browser, OS)
- ✅ Phân loại đúng Severity & Priority

### **4. Quản lý test data:**
- ✅ Dùng seed scripts để tạo test data
- ✅ Cleanup data sau khi test (xóa test posts...)
- ✅ Không dùng production data
- ✅ Backup test DB trước khi test

### **5. Viết Test Summary Report:**
- ✅ Dựa trên số liệu thực, không đoán mò
- ✅ Honest assessment (không nói "all good" nếu có bugs)
- ✅ Recommendations cụ thể (fix bug X, improve Y)
- ✅ Include lessons learned

---

## 📞 HỖ TRỢ

### **Nếu gặp vấn đề:**

**1. Cypress tests không chạy:**
```bash
# Check versions
npm list cypress
node --version

# Reinstall
rm -rf node_modules
npm install
npm run cypress:verify
```

**2. Test environment issues:**
- Check backend: `curl http://localhost:5000/api/v1/posts`
- Check frontend: Mở `http://localhost:3000`
- Check DB: `mongo phongtro_test`

**3. Excel file không mở được:**
- File CSV, dùng Excel > File > Import
- Hoặc Google Sheets > File > Import > Upload

**4. Không hiểu test case nào:**
- Đọc Test Plan section tương ứng
- Xem code Cypress test tương ứng
- Hỏi QA Lead

### **Tài liệu tham khảo:**
- Cypress Official Docs: https://docs.cypress.io
- Test Plan Template: ISO/IEC/IEEE 29119
- Bug Severity Standards: IEEE 1044

---

## 📝 TÓM TẮT NHANH

**3 files chính:**

1. **TEST_PLAN.md** (Trước test)
   - Đọc → Review → Approve
   - Dùng làm guideline

2. **TEST_CASES.csv** (Trong test)
   - Mở Excel
   - Chạy Cypress tương ứng
   - Điền kết quả Pass/Fail
   - Tạo GitHub Issue nếu bug

3. **TEST_SUMMARY_REPORT.md** (Sau test)
   - Đếm số liệu từ Excel
   - Điền vào các bảng
   - Viết recommendations
   - Get sign-off

**Lệnh Cypress quan trọng nhất:**
```bash
npm run cypress:open   # UI mode để test và debug
npm run cypress:run    # Headless để chạy nhanh
```

**Phân loại bug:**
- Critical = crash/mất data → P0 Must Fix
- High = chức năng chính không hoạt động → P1 Should Fix
- Medium = có lỗi nhưng có workaround → P2 Fix Later
- Low = cosmetic → P3 Low Priority

---

**🎉 Chúc bạn testing thành công!**

Nếu có thắc mắc, liên hệ QA Lead hoặc tham khảo các file tài liệu đính kèm.
