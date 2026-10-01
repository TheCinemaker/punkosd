import React, { useState } from 'react';
import { Truck, Plus, X, Trash2, Phone, Clock, MapPin, UserCheck, CheckCircle2, AlertTriangle, StickyNote } from 'lucide-react';
import { uid } from '../lib/store';
import { productionDays } from '../lib/config';
import { telHref } from '../lib/artists';
import { parseClock } from '../lib/time';

export const PRODUCTION_KINDS = ['Szállítás / érkezés', 'Építés', 'Ellenőrzés / átvétel', 'Bontás', 'Elszállítás', 'Egyéb'];
export const PRODUCTION_STATUSES = [
  { value: 'Tervezett', badge: 'badge-gray' },
  { value: 'Visszaigazolva', badge: 'badge-blue' },
  { value: 'Megérkezett / folyamatban', badge: 'badge-amber' },
  { value: 'Kész', badge: 'badge-green' },
  { value: 'Késik / probléma', badge: 'badge-rose' }
];
const badgeOf = (s) => PRODUCTION_STATUSES.find(x => x.value === s)?.badge || 'badge-gray';
const timeKey = (t) => parseClock(t) ?? 9999;

export function ProductionView({ production, onUpdateProduction, contractors = [], users = [], onAddLog, currentUser, searchQuery = '' }) {
  const days = productionDays();
  const today = new Date().toLocaleDateString('sv-SE');
  const [day, setDay] = useState(() => (days.some(d => d.date === today) ? today : days[0].date));
  const [onlyMine, setOnlyMine] = useState(false);
  const [editing, setEditing] = useState(null);

  const q = searchQuery.toLowerCase();
  const contractorOf = (id) => contractors.find(c => c.id === id);
  const items = production
    .filter(p => p.date === day)
    .filter(p => !onlyMine || p.responsible === currentUser)
    .filter(p => !q || [p.title, p.location, p.responsible, p.notes, contractorOf(p.contractorId)?.companyName].some(v => (v || '').toLowerCase().includes(q)))
    .sort((a, b) => timeKey(a.time) - timeKey(b.time));

  const setStatus = (item, status) => {
    onUpdateProduction(production.map(p => (p.id === item.id ? { ...p, status, statusBy: currentUser } : p)));
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Építés–bontás', description: `${item.title}: ${status}` });
  };

  const save = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing,
      date: f.get('date'),
      time: f.get('time').trim(),
      kind: f.get('kind'),
      title: f.get('title').trim(),
      contractorId: f.get('contractorId') || '',
      location: f.get('location').trim(),
      responsible: f.get('responsible'),
      onSiteContact: f.get('onSiteContact').trim(),
      status: f.get('status'),
      notes: f.get('notes').trim()
    };
    const exists = production.some(p => p.id === item.id);
    onUpdateProduction(exists ? production.map(p => (p.id === item.id ? item : p)) : [...production, item]);
    onAddLog({ user: currentUser, action: exists ? 'UPDATE' : 'CREATE', module: 'Építés–bontás', description: `${exists ? 'Módosította' : 'Új tétel'}: ${item.title} (${item.date} ${item.time})` });
    if (item.date !== day) setDay(item.date);
    setEditing(null);
  };

  const remove = () => {
    if (!window.confirm(`Törlöd: „${editing.title}”?`)) return;
    onUpdateProduction(production.filter(p => p.id !== editing.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Építés–bontás', description: `Törölte: ${editing.title}` });
    setEditing(null);
  };

  const countFor = (date) => production.filter(p => p.date === date).length;
  const openFor = (date) => production.filter(p => p.date === date && p.status !== 'Kész').length;

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><Truck size={20} color="#b45309" /> Építés–bontás idővonal</h2>
          <p className="view-subtitle">Ki mikor érkezik, mit épít, ki fogadja — a színpadtól a WC-ig, a bontásig</p>
        </div>
        <div className="toolbar-right">
          <label className="checkbox-row" style={{ fontWeight: 600 }}>
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} /> Csak az enyém
          </label>
          <button className="btn-primary" onClick={() => setEditing({ id: uid('prd'), date: day, time: '08:00', kind: 'Szállítás / érkezés', title: '', contractorId: '', location: '', responsible: currentUser, onSiteContact: '', status: 'Tervezett', notes: '' })}>
            <Plus size={16} /> Új tétel
          </button>
        </div>
      </div>

      <div className="prod-days">
        {days.map(d => (
          <button key={d.date} className={`prod-day ${d.phase === 'Fesztivál' ? 'fest' : d.phase === 'Bontás' ? 'strike' : 'build'}${day === d.date ? ' active' : ''}`} onClick={() => setDay(d.date)}>
            <small>{d.phase}{d.date === today ? ' · MA' : ''}</small>
            <strong>{d.label}</strong>
            <span>{countFor(d.date) ? `${openFor(d.date)} nyitott / ${countFor(d.date)}` : '—'}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">Erre a napra még nincs tétel{onlyMine ? ' rád kiosztva' : ''}.</div>
      ) : (
        <div className="prod-list">
          {items.map(p => {
            const c = contractorOf(p.contractorId);
            const href = telHref(c?.phone);
            return (
              <div key={p.id} className={`prod-item ${badgeOf(p.status)}`}>
                <div className="prod-time"><Clock size={14} /> {p.time || '—'}</div>
                <div className="prod-main" onClick={() => setEditing(p)}>
                  <div className="prod-title">
                    <span className="badge badge-gray">{p.kind}</span>
                    <strong>{p.title}</strong>
                    <span className={`badge ${badgeOf(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="permit-meta">
                    {c && <span>{c.companyName}</span>}
                    {p.location && <span><MapPin size={13} /> {p.location}</span>}
                    {p.responsible && <span><UserCheck size={13} /> Fogadja: {p.responsible}</span>}
                    {p.onSiteContact && <span>Helyszíni kontakt: {p.onSiteContact}</span>}
                  </div>
                  {p.notes && <div className="vendor-note" style={{ maxWidth: 'none' }}><StickyNote size={12} /> {p.notes}</div>}
                </div>
                <div className="prod-actions">
                  {href && <a href={href} className="call-icon" title={`${c.companyName} hívása`} aria-label="Hívás"><Phone size={14} /></a>}
                  {p.status !== 'Megérkezett / folyamatban' && p.status !== 'Kész' && (
                    <button className="btn-secondary compact-btn" onClick={() => setStatus(p, 'Megérkezett / folyamatban')}>Megérkezett</button>
                  )}
                  {p.status !== 'Kész' && <button className="btn-success compact-btn" onClick={() => setStatus(p, 'Kész')}><CheckCircle2 size={14} /> Kész</button>}
                  {p.status !== 'Késik / probléma' && p.status !== 'Kész' && (
                    <button className="icon-btn danger" title="Késik / probléma" onClick={() => setStatus(p, 'Késik / probléma')}><AlertTriangle size={16} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{production.some(p => p.id === editing.id) ? 'Tétel szerkesztése' : 'Új építési / bontási tétel'}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="field-label">Mi történik? *</label>
                  <input name="title" defaultValue={editing.title} required placeholder="pl. Nagyszínpad építés, 12 WC kiszállítás, aggregátor érkezik" />
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Nap</label>
                    <select name="date" defaultValue={editing.date}>
                      {days.map(d => <option key={d.date} value={d.date}>{d.label} ({d.phase})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Időpont</label>
                    <input name="time" defaultValue={editing.time} placeholder="08:00 vagy 08:00 - 12:00" />
                  </div>
                  <div>
                    <label className="field-label">Típus</label>
                    <select name="kind" defaultValue={editing.kind}>{PRODUCTION_KINDS.map(k => <option key={k}>{k}</option>)}</select>
                  </div>
                </div>
                <div className="grid-2">
                  <div>
                    <label className="field-label">Szolgáltató</label>
                    <select name="contractorId" defaultValue={editing.contractorId}>
                      <option value="">— nincs / saját —</option>
                      {contractors.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Hova? (helyszín, beállás)</label>
                    <input name="location" defaultValue={editing.location} placeholder="pl. Fő tér, a templom felőli oldal" />
                  </div>
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Ki fogadja?</label>
                    <select name="responsible" defaultValue={editing.responsible}>{users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}</select>
                  </div>
                  <div>
                    <label className="field-label">Helyszíni kontakt (sofőr, brigádvezető)</label>
                    <input name="onSiteContact" defaultValue={editing.onSiteContact} placeholder="Név, telefon" />
                  </div>
                  <div>
                    <label className="field-label">Állapot</label>
                    <select name="status" defaultValue={editing.status}>{PRODUCTION_STATUSES.map(s => <option key={s.value}>{s.value}</option>)}</select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Megjegyzés</label>
                  <textarea name="notes" rows={2} defaultValue={editing.notes} placeholder="pl. 7,5 tonnás teherautó, behajtási engedély kell, áram 08:30-ra legyen bekapcsolva" />
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{production.some(p => p.id === editing.id) && <button type="button" className="text-danger-btn" onClick={remove}><Trash2 size={15} /> Törlés</button>}</div>
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
