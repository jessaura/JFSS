'use client';

import { useState, FormEvent } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import { Field, Skeleton } from './ui';

/**
 * Store settings — currently the WhatsApp order number. Editable here so the
 * owner can change it without a redeploy; checkout reads it to open a chat.
 */
export default function Settings({
  adminKey,
  notify,
}: {
  adminKey: string;
  notify: (msg: string) => void;
}) {
  const current = useQuery(anyApi.settings.get) as { whatsappNumber?: string } | null | undefined;
  const convex = useConvex();
  // Draft holds the user's edits; until they type, the field shows the stored
  // value. No effect needed, so no setState-in-effect. Reset to null after a
  // save so it re-syncs to the reactive query.
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (current === undefined) return <Skeleton rows={3} />;

  const number = draft ?? current?.whatsappNumber ?? '';
  const digits = number.replace(/[^0-9]/g, '');

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await convex.mutation(anyApi.settings.update, { adminKey, whatsappNumber: digits });
      setDraft(null);
      notify('WhatsApp number saved');
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-stack">
      <form className="adm-card adm-settings" onSubmit={save}>
        <header className="adm-card-head">
          <h2>WhatsApp orders</h2>
        </header>
        <p className="adm-hint">
          Orders are placed on the site and recorded here as usual. When a number is
          set, the customer&apos;s checkout opens a WhatsApp chat to you with their
          order pre-filled, so you can arrange payment and delivery.
        </p>

        <Field
          label="WhatsApp number"
          hint="International format, digits only — e.g. 447911123456 (UK) or 919876543210 (India)."
        >
          <input
            className="adm-input"
            inputMode="tel"
            placeholder="447911123456"
            value={number}
            onChange={(e) => setDraft(e.target.value)}
          />
        </Field>

        {digits && (
          <p className="adm-hint">
            Chat link preview: <span className="adm-mono">wa.me/{digits}</span>
          </p>
        )}

        {error && <p className="adm-error" role="alert">{error}</p>}

        <div className="adm-modal-actions">
          <button className="adm-btn adm-btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
