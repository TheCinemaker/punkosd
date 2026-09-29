import React, { useRef, useState } from 'react';
import { Upload, ExternalLink, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { uploadDocument, docName, docUrl } from '../lib/files';

// Egy dokumentumhely (rider, szerződés, számla...) valódi feltöltéssel és megnyitással
export function DocSlot({ label, doc, folder, emptyText = 'Nincs feltöltve', emptyTone = 'muted', onChange, onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const name = docName(doc);
  const url = docUrl(doc);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadDocument(file, folder);
      onChange(uploaded);
      onUploaded?.(uploaded);
    } catch (err) {
      setError(err.message || 'Feltöltés sikertelen');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="doc-slot">
      <div className="doc-slot-label">{label}</div>

      {name ? (
        <div className={`doc-slot-name ${url ? 'ok' : 'legacy'}`}>{name}</div>
      ) : (
        <div className={`doc-slot-empty ${emptyTone}`}>{emptyText}</div>
      )}

      {name && !url && (
        <div className="doc-slot-warn">
          <AlertTriangle size={12} /> Csak a fájlnév van meg, a fájl nincs feltöltve
        </div>
      )}

      <div className="doc-slot-actions">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary doc-slot-btn">
            <ExternalLink size={13} /> Megnyitás
          </a>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`${url ? 'btn-secondary' : 'btn-primary'} doc-slot-btn`}
        >
          {busy ? <Loader2 size={13} className="spin" /> : url ? <RefreshCw size={13} /> : <Upload size={13} />}
          {busy ? 'Feltöltés...' : url ? 'Csere' : 'Feltöltés'}
        </button>
      </div>

      {error && <div className="doc-slot-error">{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
