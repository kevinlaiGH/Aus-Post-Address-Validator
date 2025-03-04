/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing-library/jest-dom$': require.resolve('@testing-library/jest-dom'),
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest'],
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/app/components/__tests__/setup.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|@babel|@jest)/)',
  ],
};

module.exports = config;
