import { useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import AuthenticatedContent from './pages/AuthenticatedContent';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

type AmplifyUser = {
  userId?: string;
  username?: string;
  attributes?: {
    name?: string;
    email?: string;
    [key: string]: unknown;
  };
};

function App() {
  // Force sign out any existing session on app load
  useEffect(() => {
    getCurrentUser()
      .then(() => signOut())
      .catch(() => {
        // Not signed in, nothing to do
      });
  }, []);

  return (
    <div className="app-root">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: 120, marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 10px #0002' }}
        />
      </div>
      <Authenticator>
        {({ signOut, user }) => {
          if (!user) return <></>;
          const u: AmplifyUser = user as AmplifyUser;
          return (
            <AuthenticatedContent
              user={{
                userId: u.userId ?? u.username ?? '',
                username: u.username,
                attributes: {
                  name: u.attributes?.name,
                  email: u.attributes?.email,
                },
              }}
              signOut={signOut}
            />
          );
        }}
      </Authenticator>
    </div>
  );
}

export default App;





































