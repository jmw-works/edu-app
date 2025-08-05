// src/components/SetDisplayNameModal.tsx
import { useState, useEffect } from 'react';
import { Button, Input, Text } from '@aws-amplify/ui-react';

interface SetDisplayNameModalProps {
  onSubmit: (displayName: string) => void;
  loading?: boolean;
  error?: string | null;
  defaultValue?: string;
}

export function SetDisplayNameModal({
  onSubmit,
  loading = false,
  error = null,
  defaultValue = '',
}: SetDisplayNameModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length > 0) {
      onSubmit(value.trim());
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 1300,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-modal="true"
      role="dialog"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '2rem',
          background: '#fff',
          borderRadius: '10px',
          minWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        }}
      >
        <Text as="h2" fontWeight="bold" fontSize="large" marginBottom="medium">
          Choose Your Display Name
        </Text>
        {error && (
          <Text
            as="p"
            color="red"
            fontSize="small"
            marginBottom="small"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {error}
          </Text>
        )}
        <Input
          placeholder="e.g. JaneDoe"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          maxLength={24}
          autoFocus
          required
          marginBottom="medium"
        />
        <Button
          type="submit"
          variation="primary"
          isLoading={loading}
          isDisabled={loading || !value.trim()}
        >
          Save
        </Button>
      </form>
    </div>
  );
}



