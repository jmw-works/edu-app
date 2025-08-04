// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

async function configureAmplify() {
  try {
    const response = await fetch('/amplify_outputs.json');
    if (!response.ok) {
      throw new Error('Response not OK');
    }
    const outputs = await response.json();
    Amplify.configure(outputs);
  } catch (error) {
    console.warn('Skipping Amplify.configure:', error);
  }
}

configureAmplify(); // no need for void since we don't await anything here

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found. App failed to mount.');
}

