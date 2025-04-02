import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Required polyfills for jsdom
import 'regenerator-runtime/runtime';
import 'core-js/stable';

// Basic window objects
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'CSS', { value: null });
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
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn(index => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// DOM customizations for tests
document.createRange = () => {
  const range = new Range();
  
  // Create a proper DOMRect with toJSON method
  const domRectMock = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    })
  };
  
  // Create a proper DOMRectList with item method
  const domRectListMock = Object.assign([], {
    item: (index: number) => null
  });
  
  // Mock methods
  range.getBoundingClientRect = jest.fn(() => domRectMock as DOMRect);
  range.getClientRects = jest.fn(() => domRectListMock as unknown as DOMRectList);
  
  return range;
};

// Create a proper Selection mock with all required properties
document.getSelection = jest.fn(() => ({
  anchorNode: null,
  anchorOffset: 0,
  focusNode: null,
  focusOffset: 0,
  isCollapsed: true,
  rangeCount: 0,
  type: 'None',
  
  // Basic methods
  addRange: jest.fn(),
  removeAllRanges: jest.fn(),
  empty: jest.fn(),
  
  // Additional required methods
  collapse: jest.fn(),
  collapseToEnd: jest.fn(),
  collapseToStart: jest.fn(),
  containsNode: jest.fn(() => false),
  deleteFromDocument: jest.fn(),
  extend: jest.fn(),
  getRangeAt: jest.fn(() => document.createRange()),
  modify: jest.fn(),
  removeRange: jest.fn(),
  selectAllChildren: jest.fn(),
  setBaseAndExtent: jest.fn(),
  setPosition: jest.fn(),
  toString: jest.fn(() => ''),
  
  // Additional properties
  baseNode: null,
  baseOffset: 0,
  extentNode: null,
  extentOffset: 0,
  direction: 'forward'
} as unknown as Selection));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Suppress React warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: findDOMNode') ||
      args[0].includes('Warning: componentWillReceiveProps') ||
      args[0].includes('Warning: componentWillMount') ||
      args[0].includes('Warning: React does not recognize the') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('act(...)'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
}); 