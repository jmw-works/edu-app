import { useState } from 'react';
import { Modal, Button, Input, Text } from '@aws-amplify/ui-react';

interface SetDisplayNameModalProps {
  onSubmit: (displayName: string) => void;
  loading?: boolean;
}

export function SetDisplayNameModal({ onSubmit, loading = false }: SetDisplayNameModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length > 0) {
      onSubmit(value.trim());
    }
  };

  return (
    <Modal
      isOpen
      ariaLabel="Set your display name"
      style={{ zIndex: 1300 }}
    >
      <form onSubmit={handleSubmit} style={{ padding: '2rem', background: '#fff', borderRadius: '10px', minWidth: 320 }}>
        <Text as="h2" fontWeight="bold" fontSize="large" marginBottom="medium">
          Choose Your Display Name
        </Text>
        <Input
          placeholder="e.g. JaneDoe"
          value={value}
          onChange={e => setValue(e.target.value)}
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
    </Modal>
  );
}

