module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/tests/integration/**/*.test.ts',
    '**/tests/contract/**/*.test.ts',
    '**/tests/performance/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/config/logging.ts',
    'src/controllers/**/*.ts',
    'src/realtime/handlers.ts',
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      functions: 80,
      branches: 50,
    },
  },
};
