// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // Amplify Gen 2 outputs (project root)
import App from './App';

// Global styles
import '@aws-amplify/ui-react/styles.css'; // Amplify UI (Authenticator, etc.)
import './App.css';

/**
 * Configure Amplify *once* before any Amplify UI components/hooks mount.
 * Calling configure multiple times is generally okay, but during Vite HMR this
 * guard avoids noisy reconfiguration warnings or timing issues.
 */
(function configureAmplifyOnce() {
  const g = (globalThis as any);
  if (!g.__AMPLIFY_CONFIGURED__) {
    Amplify.configure(outputs);
    g.__AMPLIFY_CONFIGURED__ = true;
  }
})();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("Root element '#root' not found. Check your index.html.");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);











