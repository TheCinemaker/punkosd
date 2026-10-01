import React, { useState } from 'react';
import { Trash2, RotateCcw, Download, FileSpreadsheet, FileJson, ShieldCheck } from 'lucide-react';
import { labelOf, downloadExcelBackup, downloadJsonBackup } from '../lib/backup';

export const TRASH_DAYS = 30;

// Lomtár (törölt tételek visszaállítása) + teljes mentés letöltése
export function TrashView({ trash, onRestore, onPurge, data, onAddLog, currentUser }) {
  const [filter, setFilter] = useState('all');
  const collections = Array.from(new Set(trash.map(t => t.collection)));
  const list = trash.filter(t => filter === 'all' || t.collection === filter);

  const daysLeft = (t) => Math.max(0, TRASH_DAYS - Math.floor((Date.now() - new Date(t.deletedAt)) / 86400000));

  const backup = (kind) => {
    if (kind === 'xlsx') downloadExcelBackup(data);
    else downloadJsonBackup(data);
    onAddLog({ user: currentUser, action: 'BACKUP', module: 'Lomtár & Mentés', description: `Teljes mentést töltött le (${kind === 'xlsx' ? 'Excel' : 'JSON'})` });
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><ShieldCheck size={20} color="#059669" /> Lomtár & Mentés</h2>
          <p className="view-subtitle">A törölt tételek {TRASH_DAYS} napig visszaállíthatók. Hetente érdemes teljes mentést letölteni.</p>
        </div>
      </div>

      <section className="section-box" style={{ marginBottom: '16px' }}>
        <h4 className="section-title"><Download size={16} color="#2563eb" /> Teljes mentés letöltése</h4>
        <p style={{ fontSize: '13px', color: '#334155', marginBottom: '10px' }}>
          Minden adat (menetrend, fellépők, szolgáltatók, árusok, feladatok, beszerzés, engedélyek, pénzügy...) egy fájlban.
          A feltöltött dokumentumok linkjei is benne vannak. A PIN-kódok nem kerülnek bele.
        </p>
        <div className="toolbar-right">
          <button className="btn-primary" onClick={() => backup('xlsx')}><FileSpreadsheet size={16} /> Excel (olvasható)</button>
          <button className="btn-secondary" onClick={() => backup('json')}><FileJson size={16} /> JSON (pontos visszaállításhoz)</button>
        </div>
      </section>

      <div className="chip-row" style={{ marginBottom: '12px' }}>
        <button className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Minden ({trash.length})</button>
        {collections.map(c => (
          <button key={c} className={`chip${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>
            {labelOf(c)} ({trash.filter(t => t.collection === c).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">A lomtár üres.</div>
      ) : (
        <div className="trash-list">
          {list.map(t => (
            <div key={t.id} className="trash-item">
              <div className="trash-main">
                <div className="trash-title">
                  <span className="badge badge-gray">{labelOf(t.collection)}</span>
                  <strong>{t.label}</strong>
                </div>
                <div className="dash-sub">
                  Törölte: {t.deletedBy} · {new Date(t.deletedAt).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' })} · még {daysLeft(t)} napig visszaállítható
                </div>
              </div>
              <div className="trash-actions">
                <button className="btn-success" onClick={() => onRestore(t)}><RotateCcw size={15} /> Visszaállítás</button>
                <button
                  className="icon-btn danger"
                  title="Végleges törlés"
                  aria-label="Végleges törlés"
                  onClick={() => { if (window.confirm(`Véglegesen törlöd: „${t.label}”? Ez nem vonható vissza.`)) onPurge([t.id]); }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
