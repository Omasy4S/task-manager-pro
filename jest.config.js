/**
 * Jest Configuration
 * Настройка для unit и integration тестов
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Путь к Next.js app для загрузки next.config.js и .env файлов
  dir: './',
});

const customJestConfig = {
  // Тестовое окружение
  testEnvironment: 'jsdom',

  // Setup файлы
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Паттерны для поиска тестов
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Игнорировать
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Coverage
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Module name mapper для путей
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
};

module.exports = createJestConfig(customJestConfig);
