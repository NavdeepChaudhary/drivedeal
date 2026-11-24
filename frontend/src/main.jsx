import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { StoreProvider } from './context/Store.jsx';
import { DEMO } from './lib/api.js';

// GitHub Pages can't rewrite URLs, so the demo build uses hash routing (#/browse).
const Router = DEMO ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>
);
