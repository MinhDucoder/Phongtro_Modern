export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.integration.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/seed/**',
    '!src/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/test-setup.js'],
  testTimeout: 60000,
  verbose: true,
  maxWorkers: 1,
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
};
