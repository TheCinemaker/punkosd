import React, { useState } from 'react';
import { CalendarClock, Plus, X, Trash2, Phone, MapPin, Copy } from 'lucide-react';
import { uid } from '../lib/store';
import { productionDays } from '../lib/config';
import { telHref } from '../lib/artists';
import { parseClock } from '../lib/time';

const SUGGESTED_POSTS = ['Info sátor / karszalag', 'Backstage kapu', 'Behajtás / parkoló', 'Zsákos ügyelet', 'Színpadmester', 'Árus-koordináció', 'Gyerekprogram felügyelet', 'Takarítás', 'Bontás'];

// Műszakbeosztás: ki, mikor, hol van szolgálatban (stáb és önkéntesek)
export function ShiftsView({ shifts, onUpdateShifts, users = [], onAddLog, currentUser, searchQuery = '' }) {
  const days = productionDays();
  const today = new Date().toLocaleDateString('sv-SE');
  const [day, setDay] = useState(() => (days.some(d => d.date === today) ? today : (days.find(d => d.phase === 'Fesztivál') || days[0]).date));
  const [onlyMine, setOnlyMine] = useState(false);
  const [editing, setEditing] = useState(null);

  const q = searchQuery.toLowerCase();
  const list = shifts
    .filter(s => s.date === day)
    .filter(s => !onlyMine || s.person === currentUser)
    .filter(s => !q || [s.person, s.post, s.location, s.notes].some(v => (v || '').toLowerCase().includes(q)))
    .sort((a, b) => (parseClock(a.start) ?? 0) - (parseClock(b.start) ?? 0));
  const posts = Array.from(new Set(list.map(s => s.post || 'Egyéb')));
  const phoneOf = (s) => s.phone || users.find(u => u.name === s.person)?.phone || '';

  const save = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing,
      date: f.get('date'),
      start: f.get('start').trim(),
      end: f.get('end').trim(),
      post: f.get('post').trim(),
      location: f.get('location').trim(),
      person: f.get('person').trim(),
      phone: f.get('phone').trim(),
      notes: f.get('notes').trim()
    };
    const exists = shifts.some(s => s.id === item.id);
    onUpdateShifts(exists ? shifts.map(s => (s.id === item.id ? item : s)) : [...shifts, item]);
    onAddLog({ user: currentUser, action: exists ? 'UPDATE' : 'CREATE', module: 'Műszakok', description: `${item.person}: ${item.post} ${item.date} ${item.start}–${item.end}` });
    if (item.date !== day) setDay(item.date);
    setEditing(null);
  };

  const remove = () => {
    if (!window.confirm('Törlöd ezt a műszakot?')) return;
    onUpdateShifts(shifts.filter(s => s.id !== editing.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Műszakok', description: `Törölte: ${editing.person} — ${editing.post} (${editing.date})` });
    setEditing(null);
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><CalendarClock size={20} color="#2563eb" /> Műszakbeosztás</h2>
          <p className="view-subtitle">Ki, mikor, hol van szolgálatban — stáb és önkéntesek</p>
        </div>
        <div className="toolbar-right">
          <label className="checkbox-row" style={{ fontWeight: 600 }}>
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} /> Csak az enyém
          </label>
          <button className="btn-primary" onClick={() => setEditing({ id: uid('sft'), date: day, start: '10:00', end: '14:00', post: '', location: '', person: '', phone: '', notes: '' })}>
            <Plus size={16} /> Új műszak
          </button>
        </div>
      </div>

      <div className="prod-days">
        {days.map(d => (
          <button key={d.date} className={`prod-day ${d.phase === 'Fesztivál' ? 'fest' : d.phase === 'Bontás' ? 'strike' : 'build'}${day === d.date ? ' active' : ''}`} onClick={() => setDay(d.date)}>
            <small>{d.phase}{d.date === today ? ' · MA' : ''}</small>
            <strong>{d.label}</strong>
            <span>{shifts.filter(s => s.date === d.date).length || '—'} műszak</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? <div className="empty-state">Erre a napra még nincs műszak{onlyMine ? ' rád beosztva' : ''}.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map(post => (
            <section key={post} className="dash-card">
              <div className="dash-card-title">{post}</div>
              <div className="dash-list">
                {list.filter(s => (s.post || 'Egyéb') === post).map(s => {
                  const href = telHref(phoneOf(s));
                  return (
                    <div key={s.id} className={`shift-row${s.person === currentUser ? ' mine' : ''}`}>
                      <span className="prod-time">{s.start}–{s.end}</span>
                      <span className="shift-main" onClick={() => setEditing(s)}>
                        <strong>{s.person}</strong>
                        <span className="dash-sub">{s.location && <><MapPin size={12} /> {s.location}</>}{s.notes ? ` · ${s.notes}` : ''}</span>
                      </span>
                      {href && <a href={href} className="call-icon" aria-label="Hívás"><Phone size={14} /></a>}
                      <button className="icon-btn" title="Másolás következő napra" onClick={() => {
                        const idx = days.findIndex(d => d.date === s.date);
                        const next = days[idx + 1];
                        if (!next) return;
                        onUpdateShifts([...shifts, { ...s, id: uid('sft'), date: next.date }]);
                        onAddLog({ user: currentUser, action: 'CREATE', module: 'Műszakok', description: `Átmásolta: ${s.person} — ${s.post} → ${next.label}` });
                      }}><Copy size={15} /></button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{shifts.some(s => s.id === editing.id) ? 'Műszak szerkesztése' : 'Új műszak'}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label className="field-label">Ki? (stáb vagy önkéntes) *</label>
                    <input name="person" defaultValue={editing.person} required list="shift-people" placeholder="Név" />
                    <datalist id="shift-people">{Array.from(new Set([...users.map(u => u.name), ...shifts.map(s => s.person)])).map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                  <div>
                    <label className="field-label">Telefon (önkéntesnél)</label>
                    <input name="phone" type="tel" defaultValue={editing.phone} />
                  </div>
                </div>
                <div className="grid-3">
                  <div><label className="field-label">Nap</label>
                    <select name="date" defaultValue={editing.date}>{days.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}</select></div>
                  <div><label className="field-label">Kezdés</label><input name="start" defaultValue={editing.start} placeholder="10:00" required /></div>
                  <div><label className="field-label">Vége</label><input name="end" defaultValue={editing.end} placeholder="14:00" required /></div>
                </div>
                <div className="grid-2">
                  <div>
                    <label className="field-label">Poszt / feladat *</label>
                    <input name="post" defaultValue={editing.post} required list="shift-posts" placeholder="pl. Info sátor" />
                    <datalist id="shift-posts">{Array.from(new Set([...SUGGESTED_POSTS, ...shifts.map(s => s.post).filter(Boolean)])).map(p => <option key={p} value={p} />)}</datalist>
                  </div>
                  <div><label className="field-label">Hol?</label><input name="location" defaultValue={editing.location} placeholder="pl. Fő tér, templom előtt" /></div>
                </div>
                <div><label className="field-label">Megjegyzés</label><input name="notes" defaultValue={editing.notes} placeholder="pl. rádió: Ch-2, kulcs az infosátorban" /></div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{shifts.some(s => s.id === editing.id) && <button type="button" className="text-danger-btn" onClick={remove}><Trash2 size={15} /> Törlés</button>}</div>
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
