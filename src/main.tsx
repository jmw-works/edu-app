// src/main.tsx (drop-in)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
// NOTE: path is from *src* to project root – adjust if your structure differs
import outputs from '../amplify_outputs.json';
import App from './App';

Amplify.configure(outputs); // Gen 2 config

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);








