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
    <div className="modal-bg">
      <form onSubmit={handleSubmit} className="modal">
        <label>
          Set your display name:
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            style={{ display: 'block', margin: '1em 0', width: '100%' }}
          />
        </label>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit">Save</button>
      </form>
      <style>{`
        .modal-bg {
          position: fixed; inset: 0; background: #0005; display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal {
          background: #fff; padding: 2em; border-radius: 1em; box-shadow: 0 2px 32px #0002; min-width: 280px;
        }
      `}</style>
    </div>
  );
}












