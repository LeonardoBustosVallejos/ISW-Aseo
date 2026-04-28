import { createRoot } from 'react-dom/client';
import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import '@styles/styles.css';
import { ModalProvider } from './context/ModalContext';
import App from './app';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <App />
    </ModalProvider>
  </StrictMode>,
)
