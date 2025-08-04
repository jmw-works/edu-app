// src/App.tsx

import { Authenticator } from '@aws-amplify/ui-react';
import { AuthenticatedContent } from './pages/AuthenticatedContent';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

function App() {
  return (
    <Authenticator
          loginMechanisms={['username']}
      signUpAttributes={['email']}
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
         signIn: {
          username: {
            label: 'Username',
            placeholder: 'Enter your username',
            order: 1,
          },
        },
        signUp: {
          username: {
            label: 'Username',
            placeholder: 'Choose a username',
            isRequired: true,
            order: 1,
            validate: (value: string) =>
              /^[a-zA-Z0-9]+$/.test(value) ? null : 'Only letters and numbers are allowed',
          },
          email: {
            label: 'Email',
            placeholder: 'Enter your email',
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










