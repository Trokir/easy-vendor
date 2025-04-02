import React, { ReactElement } from 'react';
import { render, RenderOptions, act as reactAct } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { MockAllProviders } from './context';

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
export const act = async (callback: () => Promise<any> | void): Promise<void> => {
  let result;
  await reactAct(async () => {
    result = await callback();
  });
  
  // Add additional flushes to ensure all Material-UI components are fully rendered
  // This helps prevent "Warning: An update to X inside a test was not wrapped in act(...)" errors
  await reactAct(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  
  // One more flush to handle any remaining async updates
  await reactAct(async () => {
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
) {
  // Set window.location.pathname
  window.history.pushState({}, 'Test page', route);

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <MockAllProviders
            initialAuth={initialAuth}
            initialLegalConsent={initialLegalConsent}
            initialUser={initialUser}
          >
            {children}
          </MockAllProviders>
        </ThemeProvider>
      </BrowserRouter>
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
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
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
) {
  window.history.pushState({}, 'Test page', route);

  function RouterWrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
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
  preventDefault: jest.fn()
});

/**
 * Mock for localStorage API
 */
export const localStorageMock = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

/**
 * Helper method to wait for all pending promises and UI updates
 */
export const waitForComponentToPaint = async (time = 0) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, time));
  });
};

// Re-export utilities from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event'; 