import { useState } from 'react';
import { Button, TextField, Flex, Text } from '@aws-amplify/ui-react';

interface SetNameFormProps {
  onSetName: (name: string) => Promise<void> | void;
}

export function SetNameForm({ onSetName }: SetNameFormProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter a display name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSetName(name.trim());
      // Optionally: show a success message, clear field, etc.
    } catch (err) {
      setError('Failed to save name. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="small" width="300px">
        <TextField
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isRequired
        />
        {error && <Text color="red">{error}</Text>}
        <Button
          type="submit"
          variation="primary"
          isLoading={submitting}
          disabled={submitting}
          width="100%"
        >
          Save Name
        </Button>
      </Flex>
    </form>
  );
}


