// src/App.tsx
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthenticatedContent } from './pages/AuthenticatedContent';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

function App() {
  return (
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
      formFields={{
        signUp: {
          email: {
            label: 'Email',
            placeholder: 'Enter your email',
            order: 1,
          },
          username: {
            label: 'Username',
            placeholder: 'Choose a username',
            order: 2,
          },
        },
      }}
    >
      {({ signOut, user }) => {
        const castUser = user as unknown as {
          userId: string;
          attributes: { name?: string; email?: string };
        };

        return (
          <AuthenticatedContent
            user={{
              userId: castUser?.userId ?? '',
              attributes: {
                name: castUser?.attributes?.name,
                email: castUser?.attributes?.email,
              },
            }}
            signOut={signOut}
          />
        );
      }}
    </Authenticator>
  );
}

export default App;










