import React, { useState } from 'react';
import { Handshake, Plus, X, Trash2, CheckSquare, Square, Phone, StickyNote } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';
import { telHref } from '../lib/artists';
import { huf } from '../lib/finance';
import { DocSlot } from './DocSlot';

const KINDS = ['Pénzbeli', 'Természetbeni', 'Médiatámogatás'];
const STATUSES = [
  { value: 'Megkeresve', badge: 'badge-gray' },
  { value: 'Tárgyalás', badge: 'badge-amber' },
  { value: 'Megállapodva', badge: 'badge-blue' },
  { value: 'Befizetve / teljesítve', badge: 'badge-green' },
  { value: 'Nem vállalta', badge: 'badge-rose' }
];
const badgeOf = (s) => STATUSES.find(x => x.value === s)?.badge || 'badge-gray';
const SUGGESTED_OBLIGATIONS = ['Logó a plakáton', 'Logó a programfüzetben', 'Molinó a nagyszínpadon', 'Bemondás a színpadon', 'Említés a Facebook-posztban', 'Logó a weboldalon'];

export function SponsorsView({ sponsors, onUpdateSponsors, onAddLog, currentUser, searchQuery = '' }) {
  const [editing, setEditing] = useState(null);
  const [newObligation, setNewObligation] = useState('');
  const q = searchQuery.toLowerCase();
  const list = sponsors.filter(s => !q || [s.name, s.contact, s.status, s.notes].some(v => (v || '').toLowerCase().includes(q)));

  const money = sponsors.filter(s => s.kind === 'Pénzbeli' && ['Megállapodva', 'Befizetve / teljesítve'].includes(s.status));
  const totalAgreed = money.reduce((t, s) => t + (Number(s.amount) || 0), 0);
  const totalPaid = money.filter(s => s.status === 'Befizetve / teljesítve').reduce((t, s) => t + (Number(s.amount) || 0), 0);
  const openObligations = sponsors.flatMap(s => (s.obligations || []).filter(o => !o.done)).length;

  const toggleObligation = (sponsor, oid) => {
    const updated = { ...sponsor, obligations: (sponsor.obligations || []).map(o => (o.id === oid ? { ...o, done: !o.done, doneBy: !o.done ? currentUser : null } : o)) };
    onUpdateSponsors(sponsors.map(s => (s.id === sponsor.id ? updated : s)));
    const ob = updated.obligations.find(o => o.id === oid);
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Szponzorok', description: `${sponsor.name}: „${ob.text}” ${ob.done ? 'teljesítve' : 'újra nyitva'}` });
  };

  const addObligation = (text) => {
    const t = text.trim();
    if (!t) return;
    setEditing(prev => ({ ...prev, obligations: [...(prev.obligations || []), { id: uid('obl'), text: t, done: false }] }));
    setNewObligation('');
  };

  const save = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing,
      name: f.get('name').trim(),
      contact: f.get('contact').trim(),
      phone: f.get('phone').trim(),
      email: f.get('email').trim(),
      kind: f.get('kind'),
      amount: numOr(f.get('amount'), 0),
      status: f.get('status'),
      notes: f.get('notes').trim()
    };
    const exists = sponsors.some(s => s.id === item.id);
    onUpdateSponsors(exists ? sponsors.map(s => (s.id === item.id ? item : s)) : [...sponsors, item]);
    onAddLog({ user: currentUser, action: exists ? 'UPDATE' : 'CREATE', module: 'Szponzorok', description: `${exists ? 'Módosította' : 'Új szponzor'}: ${item.name} (${item.status})` });
    setEditing(null);
  };

  const remove = () => {
    if (!window.confirm(`Törlöd: „${editing.name}”?`)) return;
    onUpdateSponsors(sponsors.filter(s => s.id !== editing.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Szponzorok', description: `Törölte a szponzort: ${editing.name}` });
    setEditing(null);
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><Handshake size={20} color="#7c3aed" /> Szponzorok & támogatók</h2>
          <p className="view-subtitle">Ki mennyit ad, és mit vállaltunk cserébe — a pénzbeli támogatás automatikusan bekerül a bevételek közé</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({ id: uid('spn'), name: '', contact: '', phone: '', email: '', kind: 'Pénzbeli', amount: 0, status: 'Megkeresve', obligations: [], contractDoc: null, logoDoc: null, notes: '' })}>
          <Plus size={16} /> Új szponzor
        </button>
      </div>

      <div className="permit-stats">
        <div><strong>{huf(totalAgreed)}</strong><span>megállapodott pénzbeli támogatás</span></div>
        <div><strong style={{ color: '#047857' }}>{huf(totalPaid)}</strong><span>befizetve</span></div>
        <div><strong style={{ color: openObligations ? '#b45309' : '#047857' }}>{openObligations}</strong><span>nyitott vállalásunk</span></div>
      </div>

      {list.length === 0 ? <div className="empty-state">Még nincs szponzor rögzítve.</div> : (
        <div className="permit-grid">
          {list.map(s => {
            const obs = s.obligations || [];
            return (
              <div key={s.id} className="permit-card" style={{ cursor: 'default' }}>
                <div className="permit-top">
                  <span className={`badge ${badgeOf(s.status)}`}>{s.status}</span>
                  <span className="badge badge-gray">{s.kind}{s.amount ? ` · ${huf(s.amount)}` : ''}</span>
                </div>
                <button className="permit-name" style={{ textAlign: 'left' }} onClick={() => setEditing(s)}>{s.name}</button>
                <div className="permit-meta">
                  {s.contact && <span>{s.contact}</span>}
                  {telHref(s.phone) && <a href={telHref(s.phone)} className="phone-link"><Phone size={12} /> {s.phone}</a>}
                </div>
                {obs.length > 0 && (
                  <div className="obligations">
                    <div className="field-label" style={{ marginBottom: 2 }}>Vállalásaink ({obs.filter(o => o.done).length}/{obs.length})</div>
                    {obs.map(o => (
                      <button key={o.id} className={`obligation${o.done ? ' done' : ''}`} onClick={() => toggleObligation(s, o.id)}>
                        {o.done ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#64748b" />} {o.text}
                      </button>
                    ))}
                  </div>
                )}
                {s.notes && <div className="vendor-note" style={{ maxWidth: 'none' }}><StickyNote size={12} /> {s.notes}</div>}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{sponsors.some(s => s.id === editing.id) ? editing.name : 'Új szponzor / támogató'}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="field-label">Név / cég *</label>
                  <input name="name" defaultValue={editing.name} required />
                </div>
                <div className="grid-3">
                  <div><label className="field-label">Kapcsolattartó</label><input name="contact" defaultValue={editing.contact} /></div>
                  <div><label className="field-label">Telefon</label><input name="phone" type="tel" defaultValue={editing.phone} /></div>
                  <div><label className="field-label">E-mail</label><input name="email" type="email" defaultValue={editing.email} /></div>
                </div>
                <div className="grid-3">
                  <div><label className="field-label">Támogatás fajtája</label><select name="kind" defaultValue={editing.kind}>{KINDS.map(k => <option key={k}>{k}</option>)}</select></div>
                  <div><label className="field-label">Összeg / érték (Ft)</label><input type="number" name="amount" min="0" defaultValue={editing.amount} /></div>
                  <div><label className="field-label">Állapot</label><select name="status" defaultValue={editing.status}>{STATUSES.map(s => <option key={s.value}>{s.value}</option>)}</select></div>
                </div>

                <div className="section-box">
                  <h4 className="section-title">Amit cserébe vállaltunk</h4>
                  {(editing.obligations || []).map(o => (
                    <div key={o.id} className="obligation-edit">
                      <span>{o.done ? '✓' : '•'} {o.text}</span>
                      <button type="button" className="icon-btn danger" onClick={() => setEditing(prev => ({ ...prev, obligations: prev.obligations.filter(x => x.id !== o.id) }))} aria-label="Törlés"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <div className="chip-row" style={{ margin: '8px 0' }}>
                    {SUGGESTED_OBLIGATIONS.filter(t => !(editing.obligations || []).some(o => o.text === t)).map(t => (
                      <button type="button" key={t} className="chip small" onClick={() => addObligation(t)}>+ {t}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={newObligation} onChange={(e) => setNewObligation(e.target.value)} placeholder="Egyéb vállalás..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addObligation(newObligation); } }} />
                    <button type="button" className="btn-secondary" onClick={() => addObligation(newObligation)}><Plus size={14} /></button>
                  </div>
                </div>

                <div className="grid-2">
                  <DocSlot label="Szerződés / megállapodás" doc={editing.contractDoc} folder="sponsors/contracts" onChange={(doc) => setEditing(prev => ({ ...prev, contractDoc: doc }))} />
                  <DocSlot label="Logó (nyomdához)" doc={editing.logoDoc} folder="sponsors/logos" onChange={(doc) => setEditing(prev => ({ ...prev, logoDoc: doc }))} />
                </div>
                <div>
                  <label className="field-label">Megjegyzés</label>
                  <textarea name="notes" rows={2} defaultValue={editing.notes} />
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{sponsors.some(s => s.id === editing.id) && <button type="button" className="text-danger-btn" onClick={remove}><Trash2 size={15} /> Törlés</button>}</div>
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
