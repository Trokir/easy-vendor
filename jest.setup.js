// jest.setup.js
require('@testing-library/jest-dom');

// Increase timeout for async operations in tests to avoid flakiness
jest.setTimeout(10000);

// Set testing-library timeout
if (typeof window !== 'undefined') {
  window.asyncUtilTimeout = 5000;
}

// Configure testing library
require('@testing-library/dom').configure({
  asyncUtilTimeout: 5000,
  defaultHidden: false,
  // Turn off waitFor exceptions
  throwSuggestions: false
});

// Disable act() warnings as we handle them in our custom act
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to') ||
     args[0].includes('Warning: React does not recognize') ||
     args[0].includes('test was not wrapped in act') ||
     args[0].includes('The current testing environment is not configured to support act') ||
     args[0].includes('Material-UI:') ||
     args[0].includes('Warning: A component is changing') ||
     args[0].includes('Warning: Failed prop type'))
  ) {
    return; // Filter out unimportant warnings
  }
  originalConsoleError(...args);
};

// Mock window.matchMedia for Material-UI compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for CSS animations
jest.mock('react-transition-group', () => {
  const FakeTransition = jest.fn(({ children }) => children);
  const FakeTransitionGroup = jest.fn(({ children }) => children);
  
  return {
    CSSTransition: FakeTransition,
    Transition: FakeTransition,
    TransitionGroup: FakeTransitionGroup,
  };
});

// Mock for MUI modals, popovers
if (typeof window !== 'undefined') {
  // Create portal root for Material-UI modals
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal-root');
  document.body.appendChild(portalRoot);
  
  // Create tooltip root
  const tooltipRoot = document.createElement('div');
  tooltipRoot.setAttribute('id', 'mui-tooltip-root');
  document.body.appendChild(tooltipRoot);
  
  // Create snackbar/dialog root
  const notificationRoot = document.createElement('div');
  notificationRoot.setAttribute('id', 'notification-root');
  document.body.appendChild(notificationRoot);
}

// In React 18, we need to polyfill useLayoutEffect during SSR
if (typeof window === 'undefined') {
  const React = require('react');
  const originalUseLayoutEffect = React.useLayoutEffect;
  React.useLayoutEffect = function useLayoutEffect(callback, deps) {
    return originalUseLayoutEffect(callback, deps);
  };
}

// Mock for localStorage and sessionStorage
class StorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    this.callback([{ isIntersecting: true }], this);
  }

  unobserve() {}
  disconnect() {}
}; 