/**
 * Главный конфигурационный файл Jest,
 * который использует отдельные конфигурации для фронтенда и бэкенда
 */
module.exports = {
  projects: [
    '<rootDir>/jest.frontend.config.js',
    '<rootDir>/jest.backend.config.js',
  ],
  verbose: true,
  collectCoverage: true,
};
