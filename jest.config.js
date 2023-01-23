/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/out'], // need this otherwise jest is confused about its target files
  preset: 'ts-jest',
  testEnvironment: 'node',
};
