import { Authenticator } from '@aws-amplify/ui-react';
import AuthenticatedContent from './pages/AuthenticatedContent';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => {
        // If no user, return an empty fragment (NOT undefined or null)
        if (!user) return <></>;

        const u = user as any;
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
  );
}

export default App;






























