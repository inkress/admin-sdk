module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // `roots` is scoped to src, so a root-level __mocks__ won't auto-apply for node modules. Map
  // cross-fetch explicitly to the shim so a test's `global.fetch` stub can exercise resource methods
  // (the client fetches through cross-fetch, which would otherwise hit the real network in jest).
  moduleNameMapper: {
    '^cross-fetch$': '<rootDir>/__mocks__/cross-fetch.js',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};