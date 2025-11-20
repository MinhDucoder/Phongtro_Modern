# TEST PLAN
## PHONGTRO MODERN - WEBSITE TÌM KIẾM VÀ QUẢN LÝ PHÒNG TRỌ

---

### DOCUMENT INFORMATION

| **Field** | **Details** |
|-----------|-------------|
| **Project Name** | Phongtro Modern |
| **Document Title** | Test Plan - Automated Testing with Cypress |
| **Version** | 1.0 |
| **Date** | November 20, 2025 |
| **Prepared By** | QA Team |
| **Status** | Draft |

---

## 1. INTRODUCTION

### 1.1 Purpose
Document này mô tả kế hoạch kiểm thử đầy đủ cho hệ thống Phongtro Modern - một nền tảng web cho phép người dùng tìm kiếm, đăng tin và quản lý thông tin phòng trọ. Kế hoạch này bao gồm chiến lược, phạm vi, nguồn lực và lịch trình kiểm thử tự động sử dụng Cypress framework.

### 1.2 Project Overview
**Phongtro Modern** là một ứng dụng web full-stack được xây dựng với:
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Redis
- **Testing**: Cypress E2E Testing
- **Infrastructure**: Docker, Nginx

**Các chức năng chính:**
- Xác thực người dùng (đăng ký, đăng nhập, quên mật khẩu)
- Tìm kiếm và lọc phòng trọ
- Xem chi tiết phòng trọ
- Đánh giá và nhận xét
- Đăng tin phòng trọ
- Quản lý hồ sơ người dùng
- Thanh toán trực tuyến
- Hệ thống chat
- Dashboard admin

---

## 2. TEST OBJECTIVES

### 2.1 Primary Objectives
1. **Đảm bảo chất lượng sản phẩm**: Xác minh tất cả chức năng hoạt động đúng theo yêu cầu
2. **Phát hiện lỗi sớm**: Tìm và báo cáo bugs trước khi release production
3. **Đảm bảo tích hợp**: Kiểm tra frontend + backend hoạt động ổn định
4. **Tối ưu hiệu suất**: Đảm bảo thời gian load trang < 3s
5. **Tương thích đa nền tảng**: Test trên Chrome, Firefox, Edge

### 2.2 Test Coverage Goals
- **Functional Coverage**: ≥ 90%
- **Integration Coverage**: ≥ 85%
- **API Coverage**: ≥ 80%
- **Automation Coverage**: ≥ 70%

---

## 3. SCOPE OF TESTING

### 3.1 In Scope

#### 3.1.1 Functional Testing
- **Authentication Module**
  - User Registration (email, phone validation)
  - User Login (valid/invalid credentials)
  - Password Reset
  - Session Management
  - Logout

- **Search Module**
  - Basic search (keyword)
  - Advanced filters (price, location, room type)
  - Vietnamese text handling
  - Search suggestions
  - Empty results handling

- **Property Detail Module**
  - Image gallery
  - Property information display
  - Contact landlord
  - Amenities list
  - Map integration

- **Rating & Review Module**
  - Submit rating
  - View ratings
  - Rating statistics
  - Spam prevention

- **Post Management**
  - Create new post
  - Edit post
  - Delete post
  - Upload images
  - Post status management

- **Payment Module**
  - Payment gateway integration
  - Transaction history
  - Payment confirmation

- **Chat Module**
  - Real-time messaging
  - Message history
  - Online status

#### 3.1.2 Non-Functional Testing
- **Performance Testing**: Page load time, API response time
- **Usability Testing**: Navigation, UI/UX consistency
- **Compatibility Testing**: Different browsers (Chrome, Firefox, Edge)

#### 3.1.3 Integration Testing
- Frontend ↔ Backend API integration
- Database operations
- Third-party services (Google Maps, Payment gateway)

### 3.2 Out of Scope
- Security penetration testing (sẽ thực hiện ở giai đoạn khác)
- Load testing với > 1000 concurrent users
- Mobile app testing (chỉ test responsive web)
- Stress testing

---

## 4. TEST APPROACH

### 4.1 Testing Strategy

#### 4.1.1 Automation Testing (Primary Focus)
**Tool**: Cypress v13.x
**Coverage**: 70% of test cases

**Advantages:**
- Fast execution
- Visual debugging
- Time travel snapshots
- Real browser testing
- Video recording on failure

**Test Types:**
1. **E2E Tests**: User workflows từ đầu đến cuối
2. **Integration Tests**: Frontend + Backend API
3. **Component Tests**: Individual React components

#### 4.1.2 Manual Testing (Supporting)
**Coverage**: 30% of test cases
- Exploratory testing
- UX/UI validation
- Ad-hoc testing
- Beta user testing

### 4.2 Test Levels

| **Level** | **Description** | **Tool** | **Responsibility** |
|-----------|----------------|----------|-------------------|
| Unit Testing | Test individual functions | Jest | Developers |
| Integration Testing | Test API + Frontend | Cypress | QA Team |
| System Testing | Test entire system | Cypress + Manual | QA Team |
| Acceptance Testing | Validate business requirements | Manual | Product Owner + QA |

### 4.3 Test Environment

#### 4.3.1 Development Environment
- **URL**: http://localhost:3000 (Frontend), http://localhost:5000 (Backend)
- **Database**: MongoDB Local
- **Cache**: Redis Local
- **Purpose**: Development & Unit Testing

#### 4.3.2 Testing Environment
- **URL**: http://test.phongtro.com (or staging URL)
- **Database**: MongoDB Test Instance
- **Cache**: Redis Test Instance
- **Purpose**: Integration & E2E Testing

#### 4.3.3 Production Environment
- **URL**: https://phongtro.com
- **Purpose**: Smoke Testing Only

---

## 5. TEST TOOLS

### 5.1 Automation Tools

| **Tool** | **Purpose** | **Version** |
|----------|------------|-------------|
| **Cypress** | E2E & Integration Testing | 13.x |
| **Jest** | Unit Testing | 29.x |
| **Postman** | API Testing (manual) | Latest |
| **Docker** | Environment Setup | Latest |

### 5.2 Management Tools

| **Tool** | **Purpose** |
|----------|------------|
| **Excel/Google Sheets** | Test Case Management |
| **Git/GitHub** | Version Control, Issue Tracking |
| **Slack/Teams** | Communication |
| **Word/Google Docs** | Test Documentation |

### 5.3 Monitoring Tools

| **Tool** | **Purpose** |
|----------|------------|
| **Cypress Dashboard** | Test results, video recordings |
| **Chrome DevTools** | Network, Performance debugging |

---

## 6. TEST DELIVERABLES

### 6.1 Before Testing
- [ ] Test Plan Document (this document)
- [ ] Test Case Template (Excel file)
- [ ] Test Environment Setup Guide
- [ ] Test Data Preparation

### 6.2 During Testing
- [ ] Test Execution Logs
- [ ] Bug Reports (GitHub Issues)
- [ ] Cypress Test Scripts
- [ ] Test Videos/Screenshots

### 6.3 After Testing
- [ ] Test Summary Report (Word document)
- [ ] Bug Statistics Report
- [ ] Test Coverage Report
- [ ] Recommendations Document

---

## 7. SEVERITY & PRIORITY DEFINITIONS

### 7.1 Severity Levels

| **Level** | **Description** | **Example** |
|-----------|----------------|-------------|
| **Critical** | System crash, data loss, security breach | - Database connection fails<br>- Payment not processing<br>- Cannot login at all |
| **High** | Major feature not working, blocks user flow | - Search returns no results (when data exists)<br>- Cannot upload images<br>- Email not sending |
| **Medium** | Feature works but with issues, workaround available | - Incorrect sorting order<br>- UI misalignment<br>- Slow loading (5-10s) |
| **Low/Minor** | Cosmetic issues, minimal impact | - Typo in text<br>- Wrong color shade<br>- Tooltip not showing |

### 7.2 Priority Levels

| **Priority** | **Description** | **Timeline** |
|-------------|----------------|--------------|
| **P0 - Must Fix** | Must be fixed before release | Immediately |
| **P1 - Should Fix** | Should be fixed in current release | Within 3 days |
| **P2 - Fix When Have Time** | Can be delayed to next release | Within 2 weeks |
| **P3 - Low Priority** | Nice to have, low impact | Future releases |

### 7.3 Severity vs Priority Matrix

|  | **P0 Must Fix** | **P1 Should Fix** | **P2 Fix Later** | **P3 Low** |
|--|----------------|------------------|-----------------|-----------|
| **Critical** | ✅ Always | Rarely | Never | Never |
| **High** | Often | ✅ Usually | Rarely | Never |
| **Medium** | Rarely | Often | ✅ Usually | Rarely |
| **Low** | Never | Rarely | Often | ✅ Usually |

---

## 8. TEST SCHEDULE

### 8.1 Timeline

| **Phase** | **Activity** | **Duration** | **Start Date** | **End Date** |
|-----------|-------------|--------------|---------------|-------------|
| **1** | Test Planning | 2 days | Nov 18, 2025 | Nov 20, 2025 |
| **2** | Test Case Design | 3 days | Nov 21, 2025 | Nov 23, 2025 |
| **3** | Test Environment Setup | 1 day | Nov 24, 2025 | Nov 24, 2025 |
| **4** | Test Execution (Round 1) | 5 days | Nov 25, 2025 | Nov 29, 2025 |
| **5** | Bug Fixing | 3 days | Nov 30, 2025 | Dec 2, 2025 |
| **6** | Regression Testing | 2 days | Dec 3, 2025 | Dec 4, 2025 |
| **7** | Test Reporting | 1 day | Dec 5, 2025 | Dec 5, 2025 |

**Total Duration**: 17 days

### 8.2 Milestones

- ✅ **Nov 20**: Test Plan Approved
- 🔄 **Nov 23**: Test Cases Ready
- 🔄 **Nov 29**: First Test Round Complete
- 🔄 **Dec 4**: All Bugs Fixed & Verified
- 🔄 **Dec 5**: Test Summary Report Delivered

---

## 9. TEST DATA REQUIREMENTS

### 9.1 Test Users

| **Role** | **Email** | **Password** | **Purpose** |
|----------|-----------|-------------|------------|
| Admin | admin@test.com | Admin@123 | Admin functions |
| Landlord | landlord@test.com | Land@123 | Post management |
| Normal User | user@test.com | User@123 | Search & view |

### 9.2 Test Posts
- Minimum 50 sample posts across different categories
- Various price ranges: 1-3tr, 3-5tr, 5-10tr, >10tr
- Different locations: Hà Nội, HCM, Đà Nẵng
- With/without images

### 9.3 Test Scenarios Data
- Valid/invalid email formats
- Valid/invalid phone numbers
- Edge cases (empty, special characters, SQL injection attempts)

---

## 10. ENTRY & EXIT CRITERIA

### 10.1 Entry Criteria (Start Testing)
- [ ] Test Plan approved
- [ ] Test cases designed & reviewed
- [ ] Test environment ready
- [ ] Test data prepared
- [ ] Build deployed to test environment
- [ ] No critical bugs in build

### 10.2 Exit Criteria (Stop Testing)
- [ ] 100% test cases executed
- [ ] ≥ 90% test cases passed
- [ ] 0 Critical bugs open
- [ ] ≤ 5 High severity bugs open
- [ ] Test Summary Report completed
- [ ] Stakeholder approval received

---

## 11. RISKS & MITIGATION

### 11.1 Risks

| **Risk** | **Impact** | **Probability** | **Mitigation** |
|----------|-----------|----------------|---------------|
| Backend API not stable | High | Medium | Test on local first, use mocked APIs |
| Test environment down | High | Low | Have backup environment, test locally |
| Insufficient test data | Medium | Medium | Use seed scripts, prepare early |
| Cypress flaky tests | Medium | High | Add proper waits, use best practices |
| Timeline delay | Medium | Medium | Prioritize critical tests, parallel execution |

### 11.2 Dependencies
- Backend API must be deployed before frontend testing
- MongoDB & Redis must be running
- Test user accounts must be created
- Sample data must be seeded

---

## 12. ROLES & RESPONSIBILITIES

| **Role** | **Name** | **Responsibilities** |
|----------|---------|---------------------|
| **QA Lead** | TBD | Test planning, review, reporting |
| **QA Engineer** | TBD | Write & execute test cases, Cypress scripts |
| **Developer** | Team | Fix bugs, support testing |
| **Product Owner** | TBD | Requirements clarification, UAT |
| **DevOps** | TBD | Environment setup, CI/CD integration |

---

## 13. TEST EXECUTION PROCESS

### 13.1 Daily Process

**Morning:**
1. Review test plan for the day
2. Check test environment status
3. Run smoke tests

**During Day:**
4. Execute test cases in Excel
5. Run corresponding Cypress scripts
6. Record results: Pass/Fail, Actual results
7. Log bugs immediately to GitHub Issues
8. Update test case Excel with bug IDs

**End of Day:**
9. Update test execution summary
10. Report progress to QA Lead
11. Prepare test cases for next day

### 13.2 Bug Reporting Process

When a test fails:
1. **Verify**: Re-run test to confirm it's not a flaky test
2. **Document**: Take screenshot/video, note steps to reproduce
3. **Classify**: Assign Severity & Priority
4. **Log**: Create GitHub Issue with template:
   - **Title**: [Module] Brief description
   - **Severity**: Critical/High/Medium/Low
   - **Priority**: P0/P1/P2/P3
   - **Steps to Reproduce**
   - **Expected vs Actual**
   - **Screenshots/Videos**
   - **Environment**: Browser, OS, Version
5. **Link**: Update Test Case Excel with Bug ID
6. **Track**: Monitor bug status until fixed

---

## 14. CYPRESS TEST STRUCTURE

### 14.1 Test Organization

```
phongtro-modern/cypress/
├── e2e/
│   ├── 1-auth.cy.ts              # TC_AUTH_01 - TC_AUTH_10
│   ├── 2-search.cy.ts            # TC_SEARCH_01 - TC_SEARCH_15
│   ├── 3-property-detail.cy.ts   # TC_PROPERTY_01 - TC_PROPERTY_10
│   ├── 4-rating.cy.ts            # TC_RATING_01 - TC_RATING_08
│   ├── 5-full-integration.cy.ts  # TC_INTEGRATION_01 - TC_INTEGRATION_10
│   ├── 6-post-management.cy.ts   # TC_POST_01 - TC_POST_12
│   ├── 7-payment.cy.ts           # TC_PAYMENT_01 - TC_PAYMENT_08
│   └── 8-admin.cy.ts             # TC_ADMIN_01 - TC_ADMIN_15
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── fixtures/
    └── test-data.json
```

### 14.2 Test Naming Convention

Format: `TC_[MODULE]_[NUMBER]`

Examples:
- `TC_AUTH_01`: Login with valid credentials
- `TC_SEARCH_05`: Search with Vietnamese characters
- `TC_PROPERTY_03`: View property image gallery

### 14.3 Running Tests

```bash
# Run all tests
npm run cypress:run

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/1-auth.cy.ts"

# Open Cypress UI
npm run cypress:open

# Run tests with video recording
npm run cypress:run -- --record
```

---

## 15. ACCEPTANCE CRITERIA

### 15.1 Functional Requirements
- All critical user flows work end-to-end
- Authentication is secure and working
- Search returns accurate results
- Payment processing is successful
- Admin dashboard displays correct data

### 15.2 Performance Requirements
- Page load time < 3 seconds
- API response time < 1 second
- Search results appear < 2 seconds
- Image loading optimized

### 15.3 Quality Metrics
- **Pass Rate**: ≥ 90%
- **Bug Density**: ≤ 10 bugs per module
- **Critical Bugs**: 0
- **Code Coverage**: ≥ 70%

---

## 16. COMMUNICATION PLAN

### 16.1 Status Reporting

**Daily:**
- Standup update: Test progress, blockers
- Bug count update

**Weekly:**
- Test execution summary email
- Bug trend analysis

**End of Testing:**
- Test Summary Report presentation
- Stakeholder demo

### 16.2 Escalation Path

Issue Level → Contact
- Level 1: QA Engineer fixes minor issues
- Level 2: QA Lead for test blockers
- Level 3: Dev Lead for critical bugs
- Level 4: Product Owner for requirement clarification

---

## 17. APPENDIX

### 17.1 References
- Project Requirements Document
- API Documentation
- UI/UX Design Mockups
- Cypress Official Documentation

### 17.2 Glossary

| **Term** | **Definition** |
|----------|---------------|
| E2E | End-to-End Testing |
| UAT | User Acceptance Testing |
| SUT | System Under Test |
| DUT | Device Under Test |
| P0-P3 | Priority levels 0-3 |

### 17.3 Document History

| **Version** | **Date** | **Author** | **Changes** |
|------------|---------|-----------|------------|
| 1.0 | Nov 20, 2025 | QA Team | Initial draft |

---

## 18. APPROVAL

| **Role** | **Name** | **Signature** | **Date** |
|----------|---------|--------------|---------|
| QA Lead | _________ | _________ | _________ |
| Dev Lead | _________ | _________ | _________ |
| Product Owner | _________ | _________ | _________ |
| Project Manager | _________ | _________ | _________ |

---

**END OF TEST PLAN**

---

*Note: This document is subject to updates as project requirements evolve. All stakeholders will be notified of any changes.*
