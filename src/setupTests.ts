import '@testing-library/jest-dom';
import './types/test-utils';
import 'reflect-metadata';

// Add jsdom polyfills
global.window = window;
global.document = document;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.navigator = {
  userAgent: 'node.js',
  ...window.navigator
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated, but sometimes used
    removeListener: jest.fn(), // deprecated, but sometimes used
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: jest.fn().mockReturnValue('mock-object-url')
  });
}

// Mock for ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Suppress console warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: ReactDOM.hydrate is no longer supported') ||
        args[0].includes('Warning: React.createFactory() is deprecated') ||
        args[0].includes('Warning: ReactDOM.unstable_createPortal() is deprecated') ||
        args[0].includes('Warning: ReactDOM.unstable_renderSubtreeIntoContainer() is deprecated') ||
        args[0].includes('Warning: ReactDOMTestUtils.act is deprecated'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Material-UI:') ||
        args[0].includes('Warning: React does not recognize the') ||
        args[0].includes('Warning: Received `%s` for a non-boolean attribute') ||
        args[0].includes('Warning: Invalid DOM property') ||
        args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: ReactDOM.hydrate is no longer supported'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
