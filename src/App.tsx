// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AuthenticatedContent from './pages/AuthenticatedContent';

function BrandHeader() {
  return (
    <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 12 }}>
      <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Welcome to Raccoon Bounty</h1>
      <img
        src="/logo.png"           // put your file in /public/logo.png
        alt="Raccoon Bounty Logo"
        style={{ display: 'block', margin: '10px auto 0', maxWidth: 140 }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Authenticator
      // Only customize the auth cards; no outer wrappers that affect your app.
      components={{
        SignIn: { Header: BrandHeader },
        SignUp: { Header: BrandHeader },
      }}
    >
      {/* After authentication, only your app renders here (no auth wrappers). */}
      <AuthenticatedContent />
    </Authenticator>
  );
}













































