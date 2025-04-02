// src/mocks/setupForJest.js

// Disable warnings for act() in Testing Library
// https://github.com/testing-library/react-testing-library/issues/281
import { configure } from '@testing-library/react';

// Change React Testing Library configuration
configure({
  // Disable async hell with act()
  asyncUtilTimeout: 5000,
  // Change default element behavior
  defaultHidden: true,
  // Disable 'waitFor' requires an assertion warning
  throwSuggestions: false
});

// Global mocks for web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Suppress unimportant console warnings
const originalError = console.error;
console.error = (...args) => {
  // Ignore known warnings
  if (
    args[0].includes('Warning: An update to') && 
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  if (args[0].includes('ReactDOMTestUtils.act is deprecated')) {
    return;
  }
  originalError.call(console, ...args);
};

// Suppress unimportant console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  // Ignore known warnings
  if (args[0].includes('Using the first argument as a means of selecting')) {
    return;
  }
  if (args[0].includes('An update to') && args[0].includes('inside a test was not wrapped in act')) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Импорт reflect-metadata для работы с декораторами
require('reflect-metadata');

// Мокируем axios для тестов
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    defaults: {
      headers: {
        common: {}
      }
    }
  };
});

// Мокирование глобальных объектов TypeORM
global.TypeORM = {
  Repository: class Repository {},
  Connection: class Connection {},
  createConnection: jest.fn()
};

// Мокирование NestJS ConfigService
jest.mock('@nestjs/config', () => {
  return {
    ConfigService: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn().mockImplementation((key) => {
          const config = {
            'SENDGRID_API_KEY': 'mock-api-key',
            'JWT_SECRET': 'mock-jwt-secret',
            'APP_URL': 'http://localhost:3000',
            'API_URL': 'http://localhost:3000/api',
            'DB_HOST': 'localhost',
            'DB_PORT': 5432,
            'DB_USERNAME': 'postgres',
            'DB_PASSWORD': 'postgres',
            'DB_DATABASE': 'test'
          };
          return config[key];
        })
      };
    })
  };
});

// Утилита для создания мок-репозитория TypeORM
global.createMockRepository = () => {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue({}),
      execute: jest.fn().mockResolvedValue([])
    }))
  };
}; 