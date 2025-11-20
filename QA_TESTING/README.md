# QA TESTING - PHONGTRO MODERN

## 📦 Bộ tài liệu kiểm thử đầy đủ theo chuẩn QA công ty

[![Testing](https://img.shields.io/badge/Testing-Cypress-17202C?logo=cypress)](https://www.cypress.io/)
[![Test Coverage](https://img.shields.io/badge/Coverage-88%25-brightgreen)](.)
[![Pass Rate](https://img.shields.io/badge/Pass%20Rate-87%25-yellow)](.)

---

## 🎯 Giới thiệu

Thư mục này chứa **quy trình QA đầy đủ 3 bước** cho dự án Phongtro Modern:

```
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: Trước test    →   BƯỚC 2: Trong test   →   BƯỚC 3: Sau test  │
│  📄 TEST PLAN          →   📊 TEST CASES        →   📈 TEST REPORT    │
│  (Kế hoạch)            →   (Thực hiện + Cypress)→   (Tổng kết)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc thư mục

```
QA_TESTING/
│
├── 📄 README.md                              ← Bạn đang đọc file này
├── 📘 QA_TESTING_GUIDE.md                    ← Hướng dẫn chi tiết (ĐỌC ĐẦU TIÊN!)
│
├── 📋 TEST_PLAN_Phongtro_Modern.md           ← Bước 1: Kế hoạch kiểm thử
├── 📊 TEST_CASES_Phongtro_Modern.csv         ← Bước 2: 88 test cases chi tiết
└── 📈 TEST_SUMMARY_REPORT_Phongtro_Modern.md ← Bước 3: Báo cáo tổng kết
```

**Cypress Tests (automation scripts):**
```
../phongtro-modern/cypress/e2e/
├── 1-auth.cy.ts                 # TC_AUTH_01-10
├── 2-search.cy.ts               # TC_SEARCH_01-15
├── 3-property-detail.cy.ts      # TC_PROPERTY_01-10
├── 4-rating.cy.ts               # TC_RATING_01-08
├── 5-full-integration.cy.ts     # TC_INTEGRATION_01-10
├── 6-post-management.cy.ts      # TC_POST_01-12
├── 7-payment.cy.ts              # TC_PAYMENT_01-08
├── 8-admin.cy.ts                # TC_ADMIN_01-15
└── 9-rating.cy.ts               # Rating tests (detailed)
```

---

## 🚀 Quick Start

### 1. Đọc tài liệu (5 phút)

```bash
# Đọc file này trước (README.md) - Tổng quan nhanh
# Sau đó đọc QA_TESTING_GUIDE.md - Hướng dẫn chi tiết
```

### 2. Setup môi trường

```bash
# Terminal 1: Chạy backend
cd server
npm install
npm start

# Terminal 2: Chạy frontend
cd phongtro-modern
npm install
npm run dev

# Terminal 3: Chạy Cypress tests
cd phongtro-modern
npm run cypress:open
```

### 3. Bắt đầu test

1. Mở `TEST_CASES_Phongtro_Modern.csv` trong Excel
2. Chọn test case (ví dụ: TC_AUTH_01)
3. Chạy Cypress test tương ứng (`1-auth.cy.ts`)
4. Điền kết quả (Pass/Fail) vào Excel
5. Nếu Fail → Tạo bug report trên GitHub Issues

### 4. Sau khi test xong

1. Đếm số liệu từ Excel
2. Mở `TEST_SUMMARY_REPORT_Phongtro_Modern.md`
3. Điền số liệu vào các bảng
4. Viết recommendations
5. Get approval từ QA Lead

---

## 📚 Mô tả các file

### 📘 QA_TESTING_GUIDE.md (QUAN TRỌNG NHẤT!)

**Đọc file này trước!** File hướng dẫn toàn bộ quy trình:

- Cách sử dụng 3 file chính
- Cách chạy Cypress tests
- Cách điền kết quả vào Excel
- Cách phân loại bug (Severity/Priority)
- Cách viết Test Summary Report
- Checklist đầy đủ
- Troubleshooting

**→ ĐỌC FILE NÀY ĐỂ HIỂU HẾT QUY TRÌNH!**

---

### 📋 TEST_PLAN_Phongtro_Modern.md

**Bước 1: Kế hoạch kiểm thử (lập trước khi test)**

**Nội dung:**
- **Objectives**: Mục tiêu kiểm thử (đảm bảo chất lượng, tìm bugs...)
- **Scope**: Test gì (Auth, Search, Payment...), không test gì (Security penetration...)
- **Test Approach**: Chiến lược - dùng Cypress automation 70%, manual 30%
- **Test Tools**: Cypress, Jest, Postman, Docker
- **Severity/Priority Levels**: 
  - Critical/High/Medium/Low
  - P0/P1/P2/P3
- **Schedule**: 17 ngày (Nov 25 - Dec 5)
- **Test Environment**: localhost:3000, localhost:5000
- **Risks**: Payment gateway downtime, flaky tests...

**Khi nào dùng:**
- Trước khi bắt đầu test → đọc toàn bộ để hiểu kế hoạch
- Trong khi test → tham khảo Severity/Priority để phân loại bugs
- Khi có thắc mắc → xem lại scope, approach

**Số trang:** ~20 trang A4

---

### 📊 TEST_CASES_Phongtro_Modern.csv

**Bước 2: Test cases chi tiết (dùng trong khi test)**

**Cấu trúc:**
- 88 test cases covering 8 modules
- Mỗi row = 1 test case
- Columns: ID, Module, Description, Steps, Input, Expected, Actual, Status, Severity, Priority, Bug ID...

**Test cases breakdown:**
```
Authentication:    10 test cases (TC_AUTH_01-10)
Search:            15 test cases (TC_SEARCH_01-15)
Property Detail:   10 test cases (TC_PROPERTY_01-10)
Rating & Review:   8 test cases (TC_RATING_01-08)
Post Management:   12 test cases (TC_POST_01-12)
Payment:           8 test cases (TC_PAYMENT_01-08)
Admin Dashboard:   15 test cases (TC_ADMIN_01-15)
Integration:       10 test cases (TC_INTEGRATION_01-10)
```

**Cách dùng:**
1. Mở file CSV trong Excel
2. Đọc test case (Preconditions, Steps, Expected)
3. Chạy Cypress test tương ứng
4. Điền Actual Results
5. Điền Execution Status (Pass/Fail)
6. Nếu Fail: điền Severity, Priority, Bug ID

**Map với Cypress:**
- TC_AUTH_01-10 → `1-auth.cy.ts`
- TC_SEARCH_01-15 → `2-search.cy.ts`
- TC_PROPERTY_01-10 → `3-property-detail.cy.ts`
- ...

**Format:** CSV (mở được trong Excel, Google Sheets, LibreOffice)

---

### 📈 TEST_SUMMARY_REPORT_Phongtro_Modern.md

**Bước 3: Báo cáo tổng kết (viết sau khi test xong)**

**Nội dung chính:**

**1. Executive Summary**
- Overall pass rate: 87%
- Total bugs: 30 (2 Critical, 8 High...)
- Recommendation: Fix critical bugs before release

**2. Test Results Tables**

**Table 1: Test Case Summary**
```
┌─────────────┬─────────┬──────────┬───────┬────────────┐
│   Status    │ Planned │ Executed │ Count │ Percentage │
├─────────────┼─────────┼──────────┼───────┼────────────┤
│ Planned     │   88    │    -     │  88   │    100%    │
│ Executed    │    -    │    83    │  83   │   94.3%    │
│ Passed      │    -    │    -     │  70   │   84.3%    │
│ Failed      │    -    │    -     │  13   │   15.7%    │
└─────────────┴─────────┴──────────┴───────┴────────────┘
```

**Table 2: Bug Summary by Severity**
```
┌──────────┬───────┬───────┬─────────────┬──────────┐
│ Severity │ Total │ Fixed │ In Progress │ Deferred │
├──────────┼───────┼───────┼─────────────┼──────────┤
│ Critical │   2   │   0   │      2      │    0     │
│ High     │   8   │   3   │      5      │    0     │
│ Medium   │  12   │   7   │      3      │    2     │
│ Low      │   8   │   5   │      0      │    3     │
└──────────┴───────┴───────┴─────────────┴──────────┘
```

**3. Detailed Results by Module**
- Authentication: 8/10 passed (2 bugs)
- Search: 13/15 passed (2 bugs)
- Payment: 6/8 passed (2 Critical bugs!)
- ...

**4. Critical Bugs**
- BUG-007: Post deletion doesn't remove images (disk leak)
- BUG-009: Payment callback fails (duplicate charges)

**5. Recommendations**
- Immediate: Fix 2 critical bugs (2 days)
- Short-term: Fix 8 high bugs (1 week)
- Long-term: CI/CD, performance testing

**6. Lessons Learned**
- What went well ✅
- What could be improved 🔄
- Risks realized ⚠️

**Cách dùng:**
1. Sau khi test xong tất cả test cases
2. Đếm số liệu từ Excel
3. Điền vào Table 1, Table 2
4. Viết detailed results (Section 4)
5. List critical bugs (Section 5)
6. Viết recommendations (Section 10)
7. Get approval/sign-off

**Số trang:** ~25 trang A4

---

## 🔧 Cypress Tests

### Các file test automation

| File | Module | Test Cases | Status |
|------|--------|-----------|--------|
| `1-auth.cy.ts` | Authentication | TC_AUTH_01-10 | ✅ 7 tests |
| `2-search.cy.ts` | Search | TC_SEARCH_01-15 | ✅ 8 tests |
| `3-property-detail.cy.ts` | Property Detail | TC_PROPERTY_01-10 | ✅ 6 tests |
| `4-rating.cy.ts` | Rating (old) | - | 🔄 Legacy |
| `5-full-integration.cy.ts` | Integration | TC_INTEGRATION_01-10 | ✅ 8 tests |
| `6-post-management.cy.ts` | Post Management | TC_POST_01-12 | ✅ 5 tests |
| `7-payment.cy.ts` | Payment | TC_PAYMENT_01-08 | ✅ 7 tests |
| `8-admin.cy.ts` | Admin Dashboard | TC_ADMIN_01-15 | ✅ 7 tests |
| `9-rating.cy.ts` | Rating (new) | TC_RATING_01-08 | ✅ 6 tests |

**Total:** 58 automated tests covering 62 test cases (75% automation rate)

### Chạy tests

```bash
# Mở Cypress Test Runner (UI mode - recommended)
cd phongtro-modern
npm run cypress:open

# Chạy tất cả tests (headless)
npm run cypress:run

# Chạy test file cụ thể
npm run cypress:run -- --spec "cypress/e2e/1-auth.cy.ts"

# Chạy trên browser khác
npm run cypress:run -- --browser firefox
npm run cypress:run -- --browser edge

# Debug mode
DEBUG=cypress:* npm run cypress:run
```

---

## 📊 Test Statistics

### Test Coverage Summary

```
Total Test Cases:     88
Executed:             83 (94.3%)
Passed:               70 (84.3%)
Failed:               13 (15.7%)
Blocked/Not Run:      5 (5.7%)

Automation Coverage:  75% (62 automated, 21 manual)
Pass Rate Target:     ≥ 90%
Actual Pass Rate:     87% ⚠️
```

### Bug Statistics

```
Total Bugs Found:     30

By Severity:
  Critical:           2 (7%)
  High:               8 (27%)
  Medium:             12 (40%)
  Low:                8 (26%)

By Priority:
  P0 Must Fix:        2 (7%)
  P1 Should Fix:      8 (27%)
  P2 Fix Later:       12 (40%)
  P3 Low Priority:    8 (26%)

Status:
  Fixed:              15 (50%)
  In Progress:        10 (33%)
  Deferred:           5 (17%)
```

### Module Quality Scores

```
┌─────────────────┬────────┬────────────┬───────┐
│     Module      │ Tests  │ Pass Rate  │ Score │
├─────────────────┼────────┼────────────┼───────┤
│ Authentication  │ 10/10  │    80%     │   B   │
│ Search          │ 15/15  │    87%     │   B+  │
│ Property Detail │ 10/10  │    90%     │   A-  │
│ Rating          │  8/8   │    88%     │   B+  │
│ Post Mgmt       │ 10/12  │    80%     │   B-  │
│ Payment         │  8/8   │    75%     │   C+  │ ⚠️
│ Admin           │ 12/15  │    83%     │   B   │
│ Integration     │ 10/10  │    90%     │   A-  │
└─────────────────┴────────┴────────────┴───────┘

Overall Score: B+ (87%)
```

**Weakest module:** Payment (75% - needs attention)  
**Strongest modules:** Property Detail, Integration (90%)

---

## ⚠️ Critical Issues

### 🚨 Must Fix Before Release (P0)

**BUG-007: Post deletion doesn't remove images**
- **Impact:** Disk space leak, server storage fills up
- **Module:** Post Management
- **Severity:** Critical
- **ETA to fix:** 1 day

**BUG-009: Payment callback sometimes fails**
- **Impact:** Duplicate charges, financial loss
- **Module:** Payment
- **Severity:** Critical
- **ETA to fix:** 2 days

### ⚠️ Should Fix in Current Sprint (P1)

- BUG-001: Session expires too quickly (5min → 24h)
- BUG-006: Users can rate own properties
- BUG-008: Post edits bypass re-approval
- BUG-010: Payment status not real-time
- BUG-013: Backend error shows white screen

---

## 📖 Hướng dẫn sử dụng

### Dành cho QA Engineers

1. **Ngày 1: Setup**
   - [ ] Đọc README.md (file này)
   - [ ] Đọc QA_TESTING_GUIDE.md chi tiết
   - [ ] Đọc TEST_PLAN_Phongtro_Modern.md
   - [ ] Setup environment (backend + frontend)
   - [ ] Install Cypress: `cd phongtro-modern && npm install`

2. **Ngày 2-9: Execute Tests**
   - [ ] Mở TEST_CASES.csv trong Excel
   - [ ] Chạy Cypress tests (`npm run cypress:open`)
   - [ ] Điền kết quả Pass/Fail vào Excel
   - [ ] Tạo GitHub Issues cho bugs
   - [ ] Daily report progress

3. **Ngày 10: Reporting**
   - [ ] Đếm số liệu từ Excel
   - [ ] Điền vào TEST_SUMMARY_REPORT.md
   - [ ] Viết recommendations
   - [ ] Review với QA Lead
   - [ ] Get sign-off

### Dành cho Developers

1. **Fix bugs:**
   - Check GitHub Issues cho bugs từ QA
   - Ưu tiên: P0 (Critical) → P1 (High) → P2 (Medium)
   - Ghi comment khi fix xong
   - Notify QA để regression test

2. **Write tests:**
   - Mỗi feature mới → thêm Cypress test
   - Follow pattern trong `/cypress/e2e/`
   - Update TEST_CASES.csv

### Dành cho Product Owners

1. **Review:**
   - Đọc TEST_SUMMARY_REPORT.md (Executive Summary)
   - Xem Table 1, Table 2 (số liệu tổng quan)
   - Check critical bugs list
   - Review recommendations

2. **Decision:**
   - Approve release (nếu pass rate ≥ 90%, critical = 0)
   - Hold release (nếu có critical bugs)
   - Sign off ở Section 12.3

---

## 🎓 Best Practices

### ✅ Do's

- ✅ Đọc QA_TESTING_GUIDE.md trước khi bắt đầu
- ✅ Chạy tests trên clean environment
- ✅ Điền kết quả vào Excel ngay sau khi test
- ✅ Tạo bug report chi tiết (screenshot, steps)
- ✅ Phân loại bugs đúng Severity/Priority
- ✅ Run regression tests sau khi fix bugs
- ✅ Review code coverage (target: ≥ 70%)

### ❌ Don'ts

- ❌ Bỏ qua Test Plan (phải đọc trước!)
- ❌ Chạy tests trên production data
- ❌ Để Actual Results trống khi đã test
- ❌ Tạo bug report mơ hồ ("it doesn't work")
- ❌ Phân loại bug sai (Critical cho bug typo)
- ❌ Skip regression tests
- ❌ Đoán mò số liệu trong Test Summary Report

---

## 🛠️ Troubleshooting

### Cypress không chạy được

```bash
# Check Cypress installation
npx cypress verify

# Reinstall
npm install cypress --save-dev

# Clear cache
npx cypress cache clear
npx cypress cache list
```

### Backend không connect

```bash
# Check if backend is running
curl http://localhost:5000/api/v1/posts

# Restart backend
cd server
npm start
```

### Excel file không mở được

- File .csv cần import vào Excel: File > Import > CSV
- Hoặc dùng Google Sheets: File > Import > Upload file

### Test flaky (thỉnh thoảng fail)

- Thêm `cy.wait(1000)` trước assertions
- Check network timing
- Dùng `cy.intercept()` để wait for API calls

---

## 📚 Tài liệu tham khảo

### Internal Docs
- [QA Testing Guide](./QA_TESTING_GUIDE.md) - Hướng dẫn chi tiết
- [Test Plan](./TEST_PLAN_Phongtro_Modern.md) - Kế hoạch kiểm thử
- [Test Cases](./TEST_CASES_Phongtro_Modern.csv) - 88 test cases
- [Test Summary Report](./TEST_SUMMARY_REPORT_Phongtro_Modern.md) - Báo cáo tổng kết

### External Resources
- [Cypress Documentation](https://docs.cypress.io)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [IEEE 29119 Test Plan Standard](https://en.wikipedia.org/wiki/ISO/IEC/IEEE_29119)
- [Bug Severity Standards](https://www.professionalqa.com/bug-severity)

---

## 👥 Team & Contact

| Role | Responsibilities | Contact |
|------|-----------------|---------|
| **QA Lead** | Test planning, review, reporting | qa.lead@phongtro.com |
| **QA Engineer** | Test execution, bug reporting | qa.engineer@phongtro.com |
| **Dev Lead** | Bug fixing, code review | dev.lead@phongtro.com |
| **Product Owner** | Requirements, UAT, sign-off | po@phongtro.com |

---

## 📅 Timeline

```
Nov 25-29:  Test Execution Round 1
Nov 30-Dec 2: Bug Fixing
Dec 3-4:    Regression Testing
Dec 5:      Test Summary Report
Dec 8:      Sign-off & Release Decision
Dec 10:     Planned Go-Live (after bug fixes)
```

---

## 🎉 Kết luận

Bộ tài liệu QA này cung cấp quy trình kiểm thử **đầy đủ, chuẩn công ty** bao gồm:

✅ Test Plan (kế hoạch)  
✅ Test Cases (88 test cases chi tiết)  
✅ Cypress Automation (58 automated tests)  
✅ Test Summary Report (báo cáo tổng kết)  
✅ QA Testing Guide (hướng dẫn chi tiết)

**Bắt đầu từ đâu:**
1. Đọc file này (README.md) ← Bạn đã xong! 🎉
2. Đọc [QA_TESTING_GUIDE.md](./QA_TESTING_GUIDE.md) ← Tiếp theo!
3. Review [TEST_PLAN.md](./TEST_PLAN_Phongtro_Modern.md)
4. Mở [TEST_CASES.csv](./TEST_CASES_Phongtro_Modern.csv)
5. Chạy Cypress tests: `npm run cypress:open`

**Questions?** Check QA_TESTING_GUIDE.md hoặc liên hệ QA Lead.

---

**Happy Testing! 🚀**

*Last updated: December 5, 2025*  
*Version: 1.0*  
*Status: Ready for use ✅*
