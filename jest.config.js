/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    'electron': '<rootDir>/test/__mocks__/electron.ts',
    'log': '<rootDir>/test/__mocks__/log.ts',
  },
  modulePathIgnorePatterns: ['<rootDir>/out'], // need this otherwise jest is confused about its target files
  preset: 'ts-jest',
  testEnvironment: 'node',
};
