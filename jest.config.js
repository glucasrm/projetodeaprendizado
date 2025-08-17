// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // Se você tiver um arquivo de setup para @testing-library/jest-dom
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Exemplo se você usa aliases de caminho
  },
};
