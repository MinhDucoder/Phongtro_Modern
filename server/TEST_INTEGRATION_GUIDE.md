# 🆕 New Integration Tests (November 2025)

## Overview

Thêm 126 test cases cho Backend APIs của Phongtro Modern:
- **Rating Tests**: 54 cases
- **Post Tests**: 42 cases
- **Auth Tests**: 30 cases

## Test Files Structure

### 1. `test-setup.js` - Test Utilities

Helper functions cho tests:

```javascript
// Connect/disconnect MongoDB
await connectTestDb();
await disconnectTestDb();

// Clear test data
await clearDatabase();

// Create test fixtures
const user = await createTestUser(User);
const landlord = await createTestLandlord(User);
const room = await createTestRoom(Room, landlordId);
const post = await createTestPost(Post, roomId, landlordId);
```

### 2. `rating.integration.test.js` - Rating Tests (54 cases)

**Test Suites:**
- ✅ POST /api/v1/posts/:id/rating - Create/Update Rating
- ✅ GET /api/v1/posts/:id/ratings - List Ratings  
- ✅ DELETE /api/v1/posts/:id/rating - Delete Rating
- ✅ Rating Stats & Aggregations

**Key Tests:**
- Create rating (1-5 stars) ✓
- Update/upsert rating ✓
- Validate star range ✓
- Unique constraint (post + user) ✓
- Prevent landlord self-rating ✓
- List with pagination ✓
- Filter by star ✓
- Sort by date ✓
- Populate user info ✓
- Calculate averages ✓
- Rating distribution ✓

### 3. `post.integration.test.js` - Post Tests (42 cases)

**Test Suites:**
- ✅ POST /api/v1/posts - Create Post
- ✅ GET /api/v1/posts - List Posts
- ✅ GET /api/v1/posts/:id - Get Post Detail
- ✅ PUT /api/v1/posts/:id - Update Post
- ✅ DELETE /api/v1/posts/:id - Delete Post
- ✅ GET /api/v1/posts?q= - Search Posts
- ✅ GET /api/v1/posts?propertyType= - Filter by Type
- ✅ GET /api/v1/posts?province= - Filter by City
- ✅ GET /api/v1/posts/suggestions/latest - Latest Posts
- ✅ Post Stats & Analytics

**Key Tests:**
- Create post ✓
- List active posts ✓
- Pagination ✓
- Sorting (newest first) ✓
- Search Vietnamese keywords ✓
- Accented characters (á, é, ị, ọ, ư, etc) ✓
- URL-encoded queries (nhà trọ => nh%C3%A0+tr%E1%BB%8D) ✓
- Filter by propertyType, city, district ✓
- Price range filtering ✓
- Get suggestions (6 latest) ✓
- Post stats aggregation ✓

### 4. `auth.integration.test.js` - Auth Tests (30 cases)

**Test Suites:**
- ✅ User Registration
- ✅ User Login
- ✅ User Profile
- ✅ Password Reset
- ✅ User Roles & Permissions
- ✅ User Search & Filter
- ✅ Account Activation
- ✅ Login History

**Key Tests:**
- Register with valid data ✓
- Email validation & uniqueness ✓
- Password strength ✓
- Login with credentials ✓
- Wrong password handling ✓
- Get/update profile ✓
- Password reset flow ✓
- User roles (user, landlord, admin) ✓
- Search by email/phone ✓
- Pagination ✓
- Last login tracking ✓

## Configuration Files

### `jest.config.js`

```javascript
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.integration.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/test-setup.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
};
```

### `package.json` Scripts

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:rating": "jest src/tests/rating.integration.test.js",
    "test:post": "jest src/tests/post.integration.test.js",
    "test:auth": "jest src/tests/auth.integration.test.js"
  }
}
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:rating
npm run test:post
npm run test:auth
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm test -- --coverage
```

### Single Test Case
```bash
npm test -- --testNamePattern="Should create rating successfully"
```

### Clear Cache & Run
```bash
npm test -- --clearCache
```

## Test Database

Tests use MongoDB from `.env`:

```env
MONGODB_URI=mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN
JWT_SECRET=asdfsadfsadf
JWT_REFRESH_SECRET=asdfkljhasdfsadf
```

**Important:** Tests create temporary collections and cleanup after each suite.

## Expected Output

```
 PASS  src/tests/rating.integration.test.js (5.234 s)
  Rating API Tests
    POST /api/v1/posts/:id/rating - Create/Update Rating
      ✓ Should create rating successfully (45 ms)
      ✓ Should reject rating if not between 1-5 (12 ms)
      ✓ Should update existing rating (upsert) (38 ms)
      ✓ Should prevent landlord from rating own post (18 ms)
      ...

 PASS  src/tests/post.integration.test.js (8.912 s)
  Post API Tests
    GET /api/v1/posts - List Posts
      ✓ Should list active posts only (52 ms)
      ✓ Should support pagination (78 ms)
      ...

 PASS  src/tests/auth.integration.test.js (6.145 s)
  Auth API Tests
    User Registration
      ✓ Should create user with valid data (38 ms)
      ✓ Should require email (14 ms)
      ...

Test Suites: 3 passed, 3 total
Tests:       126 passed, 126 total
Snapshots:   0 total
Time:        25.341 s
```

## Coverage Report

```bash
npm test -- --coverage
```

Output includes:
- **Statements**: % of code covered
- **Branches**: % of conditional branches
- **Functions**: % of functions called
- **Lines**: % of executable lines

**Threshold**: Minimum 50% per file

## Debugging

### Run single test file
```bash
npm test rating.integration.test.js
```

### Run specific test
```bash
npm test -- --testNamePattern="Should create rating successfully"
```

### Verbose output
```bash
npm test -- --verbose
```

### Debug with Node inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Statistics

| Metric | Value |
|--------|-------|
| Total Test Cases | 126 |
| Rating Tests | 54 |
| Post Tests | 42 |
| Auth Tests | 30 |
| Test Files | 4 (+ setup) |
| Coverage Target | 50%+ |
| Timeout per Test | 30s |

---

**Last Updated**: November 18, 2025
