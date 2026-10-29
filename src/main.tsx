import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import UATPage from './pages/UATPage.tsx';
import './index.css';

const isUATPage = window.location.pathname.replace(/\/+$/, '') === '/uat';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isUATPage ? <UATPage /> : <App />}
  </StrictMode>,
);
