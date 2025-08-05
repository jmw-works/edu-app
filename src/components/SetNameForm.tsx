// src/components/SetNameForm.tsx
import { useState, useEffect } from 'react';

interface SetNameFormProps {
  onSubmit: (name: string) => void;
  loading?: boolean;
  error?: string | null;
  defaultValue?: string;
}

export default function SetNameForm({
  onSubmit,
  loading = false,
  error = null,
  defaultValue = '',
}: SetNameFormProps) {
  const [name, setName] = useState(defaultValue);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setName(defaultValue);
  }, [defaultValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Enter a display name.');
      return;
    }
    setLocalError('');
    onSubmit(name.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <label style={{ fontWeight: 'bold' }}>Set your display name:</label>
      {error && <span style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</span>}
      {localError && <span style={{ color: 'red' }}>{localError}</span>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        style={{
          padding: '0.5rem',
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

















