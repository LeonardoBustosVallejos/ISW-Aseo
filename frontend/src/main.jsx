import { createRoot } from 'react-dom/client';
import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import '@styles/styles.css';
import { ModalProvider } from './context/ModalContext';
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from './app';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <App />
    </ModalProvider>
  </StrictMode>,
)
