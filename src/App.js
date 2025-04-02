import React from 'react';
import { CookieConsent } from './components/layout/CookieConsent';
import { AppProvider } from './contexts/AppProvider';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <CookieConsent onError={error => console.error(error)} />
      </div>
    </AppProvider>
  );
}

export default App; 