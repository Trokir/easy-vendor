import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { DoNotSellPage } from './components/legal/DoNotSellPage';
import { PrivacyBanner } from './components/legal/PrivacyBanner';
import { PrivacyChoicesPage } from './components/legal/PrivacyChoicesPage';
import { PrivacyProvider } from './contexts/PrivacyContext';

const HomePage = () => <div>Home Page</div>; // Заглушка для главной страницы
const PrivacyPolicyPage = () => <div>Privacy Policy Page</div>; // Заглушка для страницы политики конфиденциальности

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrivacyProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/do-not-sell" element={<DoNotSellPage />} />
            <Route path="/privacy-choices" element={<PrivacyChoicesPage />} />
          </Routes>
          <PrivacyBanner />
        </Router>
      </PrivacyProvider>
    </ThemeProvider>
  );
};

export default App; 