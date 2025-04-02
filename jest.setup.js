import '@testing-library/jest-dom';

// Mock для localStorage
class LocalStorageMock {
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

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    return Object.keys(this.store)[index] || null;
  }
}

// Устанавливаем моки глобально перед тестами
global.localStorage = new LocalStorageMock();

// Mock для fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Подавляем предупреждения в консоли во время тестов
const originalError = console.error;
console.error = (...args) => {
  // Подавляем warnings о react-act во время тестов
  if (
    /Warning.*not wrapped in act/.test(args[0]) ||
    /Warning.*unmountComponentAtNode/.test(args[0]) ||
    /Warning.*ReactDOM.render is no longer supported/.test(args[0]) ||
    /Warning.*ReactDOMTestUtils.act/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 