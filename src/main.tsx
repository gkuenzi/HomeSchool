import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { HomeSchoolProvider } from './state/HomeSchoolProvider';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomeSchoolProvider>
      <App />
    </HomeSchoolProvider>
  </StrictMode>,
);