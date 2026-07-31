// backend/jest.config.js
module.exports = {
  testEnvironment: "node",
  // Map `node:...` imports to local shims under __mocks__ for test-time resolution
  moduleNameMapper: {
    "^node:(.+)$": "<rootDir>/__mocks__/node_$1.js",
  },
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

