import React, { ReactElement } from 'react';
import { render, RenderOptions, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { MockAllProviders } from './context';
import { vi } from 'vitest';

// Theme for testing
const theme = createTheme();

// Interface for extended rendering options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialAuth?: any;
  initialLegalConsent?: any;
  initialUser?: any;
}

/**
 * Enhanced version of the act function with asynchronous support
 * Resolves the issue with "updates inside a test was not wrapped in act(...)" warnings
 */
export const waitForAsync = async (callback: () => Promise<any> | void): Promise<void> => {
  let result;
  await act(async () => {
    result = await callback();
  });
  
  // Add additional flushes to ensure all Material-UI components are fully rendered
  // This helps prevent "Warning: An update to X inside a test was not wrapped in act(...)" errors
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  
  // One more flush to handle any remaining async updates
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  
  return result;
};

/**
 * Function for rendering components with theme, router and context mocks
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    initialAuth = {},
    initialLegalConsent = {},
    initialUser = {},
    ...renderOptions
  }: CustomRenderOptions = {}
): ReturnType<typeof render> & { mockProviders: { theme: any, route: string } } {
  // Set window.location.pathname
  window.history.pushState({}, 'Test page', route);

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <MockAllProviders
            initialAuth={initialAuth}
            initialLegalConsent={initialLegalConsent}
            initialUser={initialUser}
          >
            {children}
          </MockAllProviders>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
    // Return additional utilities
    mockProviders: {
      theme,
      route
    }
  };
}

/**
 * Function for rendering a component with theme only
 */
export function renderWithTheme(
  ui: ReactElement, 
  options?: RenderOptions
): ReturnType<typeof render> & { theme: any } {
  function ThemeWrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }

  return {
    ...render(ui, { wrapper: ThemeWrapper, ...options }),
    theme
  };
}

/**
 * Function for rendering a component with router
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: Omit<RenderOptions, 'wrapper'> & { route?: string } = {}
): ReturnType<typeof render> & { route: string } {
  window.history.pushState({}, 'Test page', route);

  function RouterWrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter>{children}</MemoryRouter>;
  }

  return {
    ...render(ui, { wrapper: RouterWrapper, ...options }),
    route
  };
}

/**
 * Creates mocks for form events
 */
export const createFormEventMock = (value: string) => ({
  target: {
    value,
    name: 'testField',
    type: 'text'
  },
  preventDefault: vi.fn()
});

/**
 * Mock for localStorage API
 */
export function mockLocalStorage() {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
}

/**
 * Helper method to wait for all pending promises and UI updates
 */
export const waitForComponentToPaint = async (time = 0) => {
  await waitForAsync(async () => {
    await new Promise(resolve => setTimeout(resolve, time));
  });
};

// Re-export utilities from testing-library
export * from '@testing-library/react';
// Этот импорт вызывает ошибку, так как библиотека не установлена
// export { default as userEvent } from '@testing-library/user-event'; 