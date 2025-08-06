// src/components/SetNameForm.tsx
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

type SetNameFormProps = {
  /** Called with the cleaned display name once validation passes */
  onSubmit: (name: string) => Promise<void> | void;
  /** Optional: shows a spinner/disabled state while saving */
  loading?: boolean;
  /** Optional: initial value to prefill the input */
  defaultValue?: string;
  /** Optional: called if you render a cancel button in the parent modal */
  onCancel?: () => void;
  /** Optional: custom label for the field */
  label?: string;
  /** Optional: custom submit button label */
  submitLabel?: string;
};

export default function SetNameForm({
  onSubmit,
  loading = false,
  defaultValue = '',
  onCancel,
  label = 'Display name',
  submitLabel = 'Save',
}: SetNameFormProps) {
  const inputId = useId();
  const helpId = useId();
  const errId = useId();

  const [value, setValue] = useState<string>(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Keep local value in sync if defaultValue prop changes
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const pattern = useMemo(() => /^[A-Za-z0-9 _.\-]+$/, []);
  const minLen = 2;
  const maxLen = 24;

  const clean = useCallback((name: string) => {
    // Collapse multiple spaces, trim ends
    return name.replace(/\s+/g, ' ').trim();
  }, []);

  const validate = useCallback(
    (raw: string): string | null => {
      const v = clean(raw);

      if (!v) return 'Enter a display name.';
      if (v.length < minLen) return `Name must be at least ${minLen} characters.`;
      if (v.length > maxLen) return `Name must be at most ${maxLen} characters.`;
      if (!pattern.test(v))
        return 'Use letters, numbers, space, dot (.), dash (-), or underscore (_).';

      return null;
    },
    [clean, minLen, maxLen, pattern]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (touched) {
      setError(validate(e.target.value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const maybeErr = validate(value);
    if (maybeErr) {
      setError(maybeErr);
      return;
    }

    const cleaned = clean(value);
    try {
      await onSubmit(cleaned);
    } catch (err) {
      // Surface submit failures (e.g., network)
      setError((err as Error)?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const isInvalid = Boolean(error);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'grid', gap: 8 }}>
        <label htmlFor={inputId} style={{ fontWeight: 600 }}>
          {label}
        </label>

        <input
          id={inputId}
          name="displayName"
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          placeholder="e.g., Wilyat"
          minLength={minLen}
          maxLength={maxLen}
          pattern="^[A-Za-z0-9 _.\-]+$"
          title="Letters, numbers, space, dot, dash, underscore"
          aria-invalid={isInvalid}
          aria-describedby={`${helpId}${isInvalid ? ` ${errId}` : ''}`}
          autoComplete="nickname"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: isInvalid ? '1px solid #E53935' : '1px solid #CBD5E1',
            outline: 'none',
            fontSize: 16,
          }}
        />

        <small id={helpId} style={{ color: '#64748B' }}>
          2–24 characters. Allowed: letters, numbers, space, dot (.), dash (-), underscore (_).
        </small>

        {isInvalid && (
          <div
            id={errId}
            role="alert"
            style={{ color: '#B91C1C', fontSize: 14, lineHeight: 1.4 }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid transparent',
              background: loading ? '#94A3B8' : '#1F2937',
              color: 'white',
              cursor: loading ? 'default' : 'pointer',
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving…' : submitLabel}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: 'white',
                color: '#0F172A',
                cursor: loading ? 'default' : 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}


















