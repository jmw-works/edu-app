// src/App.tsx
import { fetchUserAttributes, type UserAttributeKey } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AuthenticatedContent from './pages/AuthenticatedContent';

type Attrs = Partial<Record<UserAttributeKey, string>>; // <-- match v6 API

export default function App() {
  const [attrs, setAttrs] = useState<Attrs | null>(null);
  const [attrsError, setAttrsError] = useState<Error | null>(null);

  return (
    <Authenticator>
      {({ user, signOut }) => {
        useEffect(() => {
          let cancelled = false;
          (async () => {
            setAttrs(null);
            setAttrsError(null);
            try {
              const a = await fetchUserAttributes();
              if (!cancelled) setAttrs(a);              // ✅ types now align
            } catch (e) {
              if (!cancelled) setAttrsError(e as Error);
            }
          })();
          return () => { cancelled = true; };
        }, [user?.userId]);

        const derivedEmail =
          attrs?.email ??
          (user?.signInDetails?.loginId as string | undefined);

        const derivedName =
          attrs?.name ?? attrs?.given_name ?? undefined;

        return (
          <AuthenticatedContent
            user={{
              userId: user?.userId as string,
              username: user?.username,
              attributes: {
                email: derivedEmail,
                name: derivedName,
              } as any,
            }}
            signOut={signOut}
            attrsError={attrsError}  // see next section
          />
        );
      }}
    </Authenticator>
  );
}









































