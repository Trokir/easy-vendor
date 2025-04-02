/**
 * Мок для axios библиотеки
 */
const axiosMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn().mockReturnThis(),
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  },
  request: jest.fn().mockResolvedValue({ data: {} }),
  head: jest.fn().mockResolvedValue({ data: {} }),
  options: jest.fn().mockResolvedValue({ data: {} }),
  isAxiosError: jest.fn().mockReturnValue(false),
  isCancel: jest.fn().mockReturnValue(false),
  CancelToken: {
    source: jest.fn().mockReturnValue({
      token: {},
      cancel: jest.fn(),
    }),
  },
  spread: jest.fn(),
  getUri: jest.fn().mockReturnValue(''),
  all: jest.fn().mockResolvedValue([]),
};

// CommonJS экспорт
module.exports = axiosMock; 