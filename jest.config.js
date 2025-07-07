/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        verbatimModuleSyntax: false,
        module: 'esnext',
        target: 'es2020',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        },
        moduleResolution: 'node'
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mobx|firebase)/)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase/app.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.ts',
    '^firebase/firestore$': '<rootDir>/src/__mocks__/firebase/firestore.ts',
    '^@/services/firebase.config$': '<rootDir>/src/services/__mocks__/firebase.config.ts',
    '^@/services/firebase$': '<rootDir>/src/services/__mocks__/firebase.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', '<rootDir>/src/test-utils/testSetup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/__mocks__/**',
    '!src/setupTests.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};