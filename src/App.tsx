// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import AuthenticatedContent from './pages/AuthenticatedContent';

function AuthHeader() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
      <h2 style={{ margin: 0 }}>Welcome to Raccoon Bounty</h2>
      <img
        src="/logo.png"
        alt="Raccoon Bounty"
        width={96}
        height={96}
        style={{ display: 'block', margin: '0.5rem auto 0' }}
      />
      <p style={{ marginTop: '0.25rem', opacity: 0.85 }}>Treasure Hunter Gym</p>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator components={{ Header: AuthHeader }}>
      {/* At this point we’re authenticated; no null return means no TS error */}
      <AuthenticatedContent />
    </Authenticator>
  );
}

















































