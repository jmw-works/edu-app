// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // Gen 2 outputs at project root
import App from './App';
import './App.css';

// Configure Amplify BEFORE any Amplify UI components/hooks mount
Amplify.configure(outputs);

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("Root element '#root' not found. Check your index.html.");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);










