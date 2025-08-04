import {
  Authenticator,
  ThemeProvider,
  defaultTheme,
} from '@aws-amplify/ui-react';
import { AuthenticatedContent } from './AuthenticatedContent';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={defaultTheme as any}>
      <Authenticator
        components={{
          Header() {
            return (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Welcome to Treasure Gym</h1>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    width: '160px',
                    height: 'auto',
                    marginBottom: '1rem',
                  }}
                />
              </div>
            );
          },
        }}
      >
        {({ signOut, user }: any) => (
          <AuthenticatedContent user={user} signOut={signOut} />
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;






