import React, { useState } from 'react';
import { X, Plus, ArrowUp, ArrowDown, Trash2, MapPin } from 'lucide-react';
import { uid } from '../lib/store';

// Helyszínek (színpadok, kapualjak, sátrak) kezelése: felvétel, átnevezés, sorrend, törlés
export function StagesManager({ stages, schedule, onSave, onClose }) {
  const [list, setList] = useState(() => stages.map(s => ({ ...s })));
  const [error, setError] = useState('');

  const update = (id, patch) => setList(l => l.map(s => (s.id === id ? { ...s, ...patch } : s)));
  const move = (idx, dir) => setList(l => {
    const next = [...l];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return l;
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  });
  const usage = (id) => schedule.filter(s => s.stageId === id).length;

  const add = () => setList(l => [...l, { id: uid('stg'), name: '', location: '', capacity: '', parallel: false, lat: null, lng: null }]);
  const remove = (s) => {
    const n = usage(s.id);
    if (n > 0) {
      setError(`„${s.name}” nem törölhető: ${n} műsor van rajta. Előbb tedd át őket másik helyszínre.`);
      return;
    }
    setList(l => l.filter(x => x.id !== s.id));
  };

  const save = () => {
    const cleaned = list.map((s, i) => ({ ...s, name: s.name.trim(), location: (s.location || '').trim(), order: i + 1 }));
    if (cleaned.some(s => !s.name)) {
      setError('Minden helyszínnek legyen neve.');
      return;
    }
    if (cleaned.length === 0) {
      setError('Legalább egy helyszín kell.');
      return;
    }
    onSave(cleaned);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '760px' }}>
        <div className="modal-header">
          <h2 className="modal-title"><MapPin size={18} color="#2563eb" /> Helyszínek és színpadok</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="field-hint" style={{ marginTop: 0 }}>
            A sorrend a menetrend oszlopainak sorrendje. A térképi helyet a Helyszínrajz → Pontok szerkesztése résznél tudod megadni.
          </div>
          {list.map((s, idx) => (
            <div key={s.id} className="stage-row">
              <div className="stage-row-order">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Feljebb"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === list.length - 1} aria-label="Lejjebb"><ArrowDown size={15} /></button>
              </div>
              <div className="stage-row-fields">
                <div className="grid-2">
                  <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder="Név, pl. Borudvar sátor" />
                  <input value={s.location || ''} onChange={(e) => update(s.id, { location: e.target.value })} placeholder="Hol van? pl. Jurisics tér sarok" />
                </div>
                <div className="stage-row-meta">
                  <label className="checkbox-row" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                    <input type="checkbox" checked={Boolean(s.parallel)} onChange={(e) => update(s.id, { parallel: e.target.checked })} />
                    Egyszerre több produkció is mehet (pl. kapualjak) — nincs ütközésfigyelés
                  </label>
                  <span className={`badge ${typeof s.lat === 'number' ? 'badge-green' : 'badge-amber'}`}>
                    {typeof s.lat === 'number' ? 'Térképen' : 'Nincs a térképen'}
                  </span>
                  <span className="badge badge-gray">{usage(s.id)} műsor</span>
                </div>
              </div>
              <button type="button" className="icon-btn danger" onClick={() => remove(s)} aria-label="Törlés" title="Helyszín törlése">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={add} style={{ alignSelf: 'flex-start' }}>
            <Plus size={15} /> Új helyszín
          </button>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Mégse</button>
          <button type="button" onClick={save} className="btn-primary">Mentés</button>
        </div>
      </div>
    </div>
  );
}
