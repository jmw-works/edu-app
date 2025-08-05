// src/components/SetNameForm.tsx
import { useState } from 'react';

interface SetNameFormProps {
  onSubmit: (name: string) => void;
}

export default function SetNameForm({ onSubmit }: SetNameFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a display name.');
      return;
    }
    setError('');
    onSubmit(name.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
      <label>
        Set your display name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{ display: 'block', margin: '1em 0', width: '100%' }}
        />
      </label>
      {error && <span style={{ color: 'red' }}>{error}</span>}
      <button type="submit">Save</button>
    </form>
  );
}
















