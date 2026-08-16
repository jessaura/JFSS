'use client';

import { useRef, useState } from 'react';
import { useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import { Icon } from './ui';

/**
 * Upload one image to Convex storage and hand back its served URL.
 *   generateUploadUrl → POST the file → urlForStorageId → onChange(url)
 * The parent stores the URL string, so the rest of the app keeps treating
 * images as plain URLs. Shows a live preview and an inline error.
 */
export default function ImageUpload({
  adminKey,
  value,
  onChange,
  onClear,
  size = 'md',
}: {
  adminKey: string;
  value: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  size?: 'sm' | 'md';
}) {
  const convex = useConvex();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const uploadUrl = await convex.mutation(anyApi.files.generateUploadUrl, { adminKey });
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!res.ok) throw new Error('upload failed');
      const { storageId } = await res.json();
      const served = await convex.mutation(anyApi.files.urlForStorageId, { adminKey, storageId });
      if (!served) throw new Error('no url');
      onChange(served);
    } catch {
      setError('Upload failed — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`adm-upload adm-upload-${size}`}>
      <button
        type="button"
        className={`adm-upload-drop ${dragOver ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={value ? 'Change image, or drop a file here' : 'Upload image, or drop a file here'}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
      >
        {value ? (
          <img src={value} alt="" className="adm-upload-preview" />
        ) : (
          <span className="adm-upload-placeholder">
            <Icon.plus />
            <span>{dragOver ? 'Drop image' : 'Upload or drop'}</span>
          </span>
        )}
        {dragOver && <span className="adm-upload-dropcue" aria-hidden="true">Drop to upload</span>}
        {busy && <span className="adm-upload-busy">Uploading…</span>}
      </button>

      {value && onClear && !busy && (
        <button type="button" className="adm-upload-clear" onClick={onClear} aria-label="Remove image">
          <Icon.close />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="adm-sr"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />

      {error && <span className="adm-upload-error">{error}</span>}
    </div>
  );
}
