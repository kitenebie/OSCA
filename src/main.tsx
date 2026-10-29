import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import UATPage from './pages/UATPage.tsx';
import UATReportPage from './pages/UATReportPage.tsx';
import './index.css';

const isUATPage = window.location.pathname.replace(/\/+$/, '') === '/uat';
const isUATReportPage = window.location.pathname.replace(/\/+$/, '') === '/uat/report';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isUATReportPage ? <UATReportPage /> : isUATPage ? <UATPage /> : <App />}
  </StrictMode>,
);
