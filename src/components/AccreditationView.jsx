import React, { useState } from 'react';
import { BadgeCheck, Plus, X, Trash2, Car, Search, CheckCircle2, Users } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';

const CATEGORIES = ['Fellépő', 'Stáb', 'Önkéntes', 'Árus', 'Szolgáltató', 'Sajtó', 'Vendég / VIP'];

// Akkreditáció: karszalag, backstage, behajtó (rendszámmal), vendéglista — kapunál gyorsan kereshető
export function AccreditationView({ accreditations, onUpdateAccreditations, artists = [], onAddLog, currentUser, searchQuery = '' }) {
  const [filter, setFilter] = useState('all');
  const [local, setLocal] = useState('');
  const [editing, setEditing] = useState(null);

  const q = `${searchQuery} ${local}`.trim().toLowerCase();
  const list = accreditations
    .filter(a => filter === 'all' || (filter === 'notIssued' ? !a.issued : a.category === filter))
    .filter(a => !q || q.split(/\s+/).every(w => [a.name, a.org, a.plate, a.category, a.notes].some(v => (v || '').toLowerCase().replace(/[\s-]/g, '').includes(w.replace(/[\s-]/g, '')))))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'hu'));

  const totals = {
    wristbands: accreditations.reduce((s, a) => s + (Number(a.wristbands) || 0), 0),
    backstage: accreditations.filter(a => a.backstage).length,
    parking: accreditations.filter(a => a.parking).length,
    issued: accreditations.filter(a => a.issued).length
  };

  const toggleIssued = (a) => {
    const issued = !a.issued;
    const stamp = new Date().toLocaleString('sv-SE').slice(0, 16);
    onUpdateAccreditations(accreditations.map(x => (x.id === a.id ? { ...x, issued, issuedBy: issued ? currentUser : null, issuedAt: issued ? stamp : null } : x)));
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Akkreditáció', description: `${a.name}: ${issued ? 'kiadva' : 'kiadás visszavonva'}` });
  };

  const importArtists = () => {
    const existing = new Set(accreditations.filter(a => a.category === 'Fellépő').map(a => a.name));
    const add = artists.filter(a => !existing.has(a.name)).map(a => ({
      id: uid('akk'), name: a.name, org: a.contact || '', category: 'Fellépő',
      wristbands: Number(a.meals?.people) || 0, backstage: true, parking: Boolean(a.passes), plate: '',
      issued: false, issuedBy: null, issuedAt: null, notes: a.passes ? `${a.passes} behajtó` : ''
    }));
    if (!add.length) { window.alert('Minden fellépő szerepel már a listán.'); return; }
    onUpdateAccreditations([...accreditations, ...add]);
    onAddLog({ user: currentUser, action: 'CREATE', module: 'Akkreditáció', description: `${add.length} fellépő felvéve az akkreditációs listára` });
  };

  const save = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing,
      name: f.get('name').trim(),
      org: f.get('org').trim(),
      category: f.get('category'),
      wristbands: numOr(f.get('wristbands'), 0),
      backstage: f.get('backstage') === 'on',
      parking: f.get('parking') === 'on',
      plate: f.get('plate').trim().toUpperCase(),
      notes: f.get('notes').trim()
    };
    const exists = accreditations.some(a => a.id === item.id);
    onUpdateAccreditations(exists ? accreditations.map(a => (a.id === item.id ? item : a)) : [...accreditations, item]);
    onAddLog({ user: currentUser, action: exists ? 'UPDATE' : 'CREATE', module: 'Akkreditáció', description: `${exists ? 'Módosította' : 'Felvette'}: ${item.name} (${item.category})` });
    setEditing(null);
  };

  const remove = () => {
    if (!window.confirm(`Törlöd: „${editing.name}”?`)) return;
    onUpdateAccreditations(accreditations.filter(a => a.id !== editing.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Akkreditáció', description: `Törölte: ${editing.name}` });
    setEditing(null);
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><BadgeCheck size={20} color="#059669" /> Akkreditáció & vendéglista</h2>
          <p className="view-subtitle">Karszalag, backstage, behajtás — a kapunál név vagy rendszám alapján kereshető</p>
        </div>
        <div className="toolbar-right">
          <button className="btn-secondary" onClick={importArtists}><Users size={15} /> Fellépők behúzása</button>
          <button className="btn-primary" onClick={() => setEditing({ id: uid('akk'), name: '', org: '', category: 'Stáb', wristbands: 1, backstage: false, parking: false, plate: '', issued: false, notes: '' })}>
            <Plus size={16} /> Új
          </button>
        </div>
      </div>

      <div className="permit-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div><strong>{totals.wristbands}</strong><span>karszalag</span></div>
        <div><strong>{totals.backstage}</strong><span>backstage belépő</span></div>
        <div><strong>{totals.parking}</strong><span>behajtó</span></div>
        <div><strong style={{ color: '#047857' }}>{totals.issued}/{accreditations.length}</strong><span>kiadva</span></div>
      </div>

      <div className="contacts-toolbar">
        <div className="contacts-search">
          <Search size={16} />
          <input type="search" placeholder="Név vagy rendszám (pl. ABC123)..." value={local} onChange={(e) => setLocal(e.target.value)} />
        </div>
        <div className="chip-row">
          <button className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Mind</button>
          <button className={`chip${filter === 'notIssued' ? ' active' : ''}`} onClick={() => setFilter('notIssued')}>Még nincs kiadva</button>
          {CATEGORIES.map(c => <button key={c} className={`chip${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
      </div>

      {list.length === 0 ? <div className="empty-state">Nincs találat.</div> : (
        <div className="contacts-grid">
          {list.map(a => (
            <div key={a.id} className={`contact-card${a.issued ? ' issued' : ''}`}>
              <div className="contact-main" style={{ cursor: 'pointer' }} onClick={() => setEditing(a)}>
                <div className="contact-title"><span>{a.name}</span><span className="badge badge-gray">{a.category}</span></div>
                {a.org && <div className="contact-sub">{a.org}</div>}
                <div className="contact-meta">
                  {a.wristbands > 0 && <span>{a.wristbands} karszalag</span>}
                  {a.backstage && <span className="badge badge-blue">Backstage</span>}
                  {a.parking && <span><Car size={12} /> Behajtó{a.plate ? `: ${a.plate}` : ''}</span>}
                </div>
                {a.issued && <div className="dash-sub" style={{ color: '#047857' }}>Kiadta: {a.issuedBy} · {a.issuedAt}</div>}
              </div>
              <button className={a.issued ? 'btn-secondary compact-btn' : 'btn-success compact-btn'} onClick={() => toggleIssued(a)}>
                {a.issued ? 'Visszavon' : <><CheckCircle2 size={14} /> Kiadva</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{accreditations.some(a => a.id === editing.id) ? editing.name : 'Új akkreditáció'}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div><label className="field-label">Név *</label><input name="name" defaultValue={editing.name} required /></div>
                  <div><label className="field-label">Szervezet / zenekar / cég</label><input name="org" defaultValue={editing.org} /></div>
                </div>
                <div className="grid-2">
                  <div><label className="field-label">Kategória</label><select name="category" defaultValue={editing.category}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div><label className="field-label">Karszalag (db)</label><input type="number" min="0" name="wristbands" defaultValue={editing.wristbands} /></div>
                </div>
                <label className="checkbox-row"><input type="checkbox" name="backstage" defaultChecked={editing.backstage} /> Backstage belépő</label>
                <div className="grid-2">
                  <label className="checkbox-row"><input type="checkbox" name="parking" defaultChecked={editing.parking} /> Behajtó / parkolás</label>
                  <div><label className="field-label">Rendszám</label><input name="plate" defaultValue={editing.plate} placeholder="pl. ABC-123" /></div>
                </div>
                <div><label className="field-label">Megjegyzés</label><input name="notes" defaultValue={editing.notes} placeholder="pl. csak szombat, +1 fő vendég" /></div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{accreditations.some(a => a.id === editing.id) && <button type="button" className="text-danger-btn" onClick={remove}><Trash2 size={15} /> Törlés</button>}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Mégse</button>
                  <button type="submit" className="btn-primary">Mentés</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
