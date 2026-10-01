import React, { useState } from 'react';
import { BedDouble, Car, UtensilsCrossed, Plus, X, Trash2, CheckCircle2, ShoppingCart, StickyNote } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';
import { FESTIVAL, productionDays } from '../lib/config';
import { findArtist } from '../lib/artists';
import { huf } from '../lib/finance';

const TRANSFER_STATUSES = ['Tervezett', 'Visszaigazolva', 'Úton', 'Kész'];
const PAID_BY = ['KTSZE', 'Fellépő saját', 'Szponzor / szállásadó'];

function Modal({ title, onClose, onSubmit, onDelete, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div>{onDelete && <button type="button" className="text-danger-btn" onClick={onDelete}><Trash2 size={15} /> Törlés</button>}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Mégse</button>
              <button type="submit" className="btn-primary">Mentés</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Vendég neve: fellépő a listából vagy szabadon beírt név
function GuestField({ artists, value }) {
  return (
    <div>
      <label className="field-label">Kinek? (fellépő vagy más vendég) *</label>
      <input name="guestName" defaultValue={value} list="guest-names" required placeholder="Válassz fellépőt vagy írj be nevet" />
      <datalist id="guest-names">{artists.map(a => <option key={a.id} value={a.name} />)}</datalist>
    </div>
  );
}

export function LogisticsView({
  artists, onUpdateArtists, schedule, accommodation, onUpdateAccommodation, transfers, onUpdateTransfers,
  catering, onUpdateCatering, shoppingList, onUpdateShoppingList, users = [], onAddLog, currentUser
}) {
  const [tab, setTab] = useState('accommodation');
  const [editing, setEditing] = useState(null);
  const days = productionDays();
  const log = (description) => onAddLog({ user: currentUser, action: 'UPDATE', module: 'Vendéglátás & logisztika', description });

  const upsert = (list, item, setter) => setter(list.some(x => x.id === item.id) ? list.map(x => (x.id === item.id ? item : x)) : [...list, item]);
  const removeFrom = (list, item, setter, label) => {
    if (!window.confirm(`Törlöd: „${label}”?`)) return;
    setter(list.filter(x => x.id !== item.id));
    log(`Törölte: ${label}`);
    setEditing(null);
  };

  // ---------- Szállás ----------
  const saveAcc = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing.item,
      guestName: f.get('guestName').trim(),
      place: f.get('place').trim(),
      address: f.get('address').trim(),
      rooms: numOr(f.get('rooms'), 1),
      people: numOr(f.get('people'), 1),
      checkIn: f.get('checkIn'),
      checkOut: f.get('checkOut'),
      cost: numOr(f.get('cost'), 0),
      paidBy: f.get('paidBy'),
      confirmed: f.get('confirmed') === 'true',
      bookingRef: f.get('bookingRef').trim(),
      notes: f.get('notes').trim()
    };
    upsert(accommodation, item, onUpdateAccommodation);
    log(`Szállás: ${item.guestName} — ${item.place} (${item.checkIn} → ${item.checkOut})`);
    setEditing(null);
  };
  const nights = (a) => (a.checkIn && a.checkOut ? Math.max(0, Math.round((new Date(a.checkOut) - new Date(a.checkIn)) / 86400000)) : 0);

  // ---------- Transzfer ----------
  const saveTr = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing.item,
      guestName: f.get('guestName').trim(),
      date: f.get('date'),
      time: f.get('time').trim(),
      from: f.get('from').trim(),
      to: f.get('to').trim(),
      people: numOr(f.get('people'), 1),
      driver: f.get('driver').trim(),
      vehicle: f.get('vehicle').trim(),
      status: f.get('status'),
      notes: f.get('notes').trim()
    };
    upsert(transfers, item, onUpdateTransfers);
    log(`Transzfer: ${item.guestName} ${item.date} ${item.time} (${item.from} → ${item.to})`);
    setEditing(null);
  };
  const setTrStatus = (t, status) => {
    onUpdateTransfers(transfers.map(x => (x.id === t.id ? { ...x, status } : x)));
    log(`Transzfer ${t.guestName}: ${status}`);
  };

  // ---------- Catering ----------
  const festDays = FESTIVAL.days;
  const artistMeals = (dayName) => {
    const seen = new Set();
    const rows = [];
    schedule.filter(s => s.day === dayName).forEach(s => {
      const a = findArtist(artists, s);
      if (!a || seen.has(a.id)) return;
      seen.add(a.id);
      rows.push(a);
    });
    return rows;
  };
  const dayCatering = (date) => catering.find(c => c.id === date) || { id: date, staff: 0, volunteers: 0, notes: '' };
  const setDayCatering = (date, patch) => {
    const cur = dayCatering(date);
    const next = { ...cur, ...patch };
    onUpdateCatering(catering.some(c => c.id === date) ? catering.map(c => (c.id === date ? next : c)) : [...catering, next]);
  };
  const setArtistMeals = (artist, patch) => {
    onUpdateArtists(artists.map(a => (a.id === artist.id ? { ...a, meals: { people: 0, vegan: 0, glutenFree: 0, ...(a.meals || {}), ...patch } } : a)));
  };
  const totalsFor = (d) => {
    const list = artistMeals(d.name);
    const c = dayCatering(d.date);
    const people = list.reduce((s, a) => s + (Number(a.meals?.people) || 0), 0);
    const vegan = list.reduce((s, a) => s + (Number(a.meals?.vegan) || 0), 0);
    const glutenFree = list.reduce((s, a) => s + (Number(a.meals?.glutenFree) || 0), 0);
    return { list, people, vegan, glutenFree, staff: Number(c.staff) || 0, volunteers: Number(c.volunteers) || 0, total: people + (Number(c.staff) || 0) + (Number(c.volunteers) || 0) };
  };
  const toShopping = (d) => {
    const t = totalsFor(d);
    const name = `Catering — ${d.name} (${d.date.slice(5).replace('-', '.')}.): ${t.total} adag meleg étel`;
    onUpdateShoppingList([{
      id: uid('shp'), name, category: 'Catering & Backstage', store: '', qty: t.total, unit: 'adag',
      estimatedPrice: 0, actualPrice: 0, createdBy: currentUser, createdAt: new Date().toLocaleString('sv-SE').slice(0, 16),
      responsible: currentUser, priority: 'Normál', isPurchased: false, purchasedBy: null, purchasedAt: null, hasReceipt: false,
      notes: `Fellépők: ${t.people} (ebből vegán ${t.vegan}, gluténmentes ${t.glutenFree}) · stáb: ${t.staff} · önkéntesek: ${t.volunteers}`
    }, ...shoppingList]);
    log(`Catering beszerzési tételként felvéve: ${d.name} — ${t.total} adag`);
    window.alert(`Felvéve a Beszerzésbe: ${name}`);
  };

  const accCost = accommodation.filter(a => a.paidBy === 'KTSZE').reduce((s, a) => s + (Number(a.cost) || 0), 0);

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><BedDouble size={20} color="#7c3aed" /> Vendéglátás & logisztika</h2>
          <p className="view-subtitle">Szállás, transzfer és catering a fellépőknek és a stábnak</p>
        </div>
      </div>

      <div className="segmented" style={{ marginBottom: '14px' }}>
        <button className={tab === 'accommodation' ? 'active' : ''} onClick={() => setTab('accommodation')}><BedDouble size={14} /> Szállás ({accommodation.length})</button>
        <button className={tab === 'transfers' ? 'active' : ''} onClick={() => setTab('transfers')}><Car size={14} /> Transzfer ({transfers.length})</button>
        <button className={tab === 'catering' ? 'active' : ''} onClick={() => setTab('catering')}><UtensilsCrossed size={14} /> Catering</button>
      </div>

      {tab === 'accommodation' && (
        <>
          <div className="toolbar-right" style={{ marginBottom: '12px', justifyContent: 'space-between' }}>
            <span className="dash-muted">KTSZE által fizetett szállásköltség: <strong>{huf(accCost)}</strong> · {accommodation.reduce((s, a) => s + (Number(a.rooms) || 0) * nights(a), 0)} szobaéjszaka</span>
            <button className="btn-primary" onClick={() => setEditing({ type: 'acc', item: { id: uid('acc'), guestName: '', place: '', address: '', rooms: 1, people: 1, checkIn: festDays[0].date, checkOut: '', cost: 0, paidBy: 'KTSZE', confirmed: false, bookingRef: '', notes: '' } })}>
              <Plus size={16} /> Új szállás
            </button>
          </div>
          {accommodation.length === 0 ? <div className="empty-state">Még nincs szállás rögzítve.</div> : (
            <div className="permit-grid">
              {[...accommodation].sort((a, b) => (a.checkIn || '').localeCompare(b.checkIn || '')).map(a => (
                <button key={a.id} className="permit-card" onClick={() => setEditing({ type: 'acc', item: a })}>
                  <div className="permit-top">
                    <span className={`badge ${a.confirmed ? 'badge-green' : 'badge-amber'}`}>{a.confirmed ? 'Visszaigazolva' : 'Nincs visszaigazolva'}</span>
                    <span className="badge badge-gray">{a.paidBy}{a.cost ? ` · ${huf(a.cost)}` : ''}</span>
                  </div>
                  <div className="permit-name">{a.guestName}</div>
                  <div className="permit-meta">
                    <span><BedDouble size={13} /> {a.place}{a.address ? `, ${a.address}` : ''}</span>
                    <span>{a.rooms} szoba · {a.people} fő</span>
                    <span>{a.checkIn || '?'} → {a.checkOut || '?'} ({nights(a)} éj)</span>
                    {a.bookingRef && <span>Foglalás: {a.bookingRef}</span>}
                  </div>
                  {a.notes && <div className="vendor-note" style={{ maxWidth: 'none' }}><StickyNote size={12} /> {a.notes}</div>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'transfers' && (
        <>
          <div className="toolbar-right" style={{ marginBottom: '12px', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={() => setEditing({ type: 'tr', item: { id: uid('trf'), guestName: '', date: festDays[0].date, time: '', from: 'Kőszeg vasútállomás', to: '', people: 1, driver: '', vehicle: '', status: 'Tervezett', notes: '' } })}>
              <Plus size={16} /> Új transzfer
            </button>
          </div>
          {transfers.length === 0 ? <div className="empty-state">Még nincs transzfer rögzítve.</div> : (
            <div className="prod-list">
              {[...transfers].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map(t => (
                <div key={t.id} className={`prod-item ${t.status === 'Kész' ? 'badge-green' : t.status === 'Úton' ? 'badge-amber' : t.status === 'Visszaigazolva' ? 'badge-blue' : ''}`}>
                  <div className="prod-time">{t.date.slice(5).replace('-', '.')}. {t.time}</div>
                  <div className="prod-main" onClick={() => setEditing({ type: 'tr', item: t })}>
                    <div className="prod-title"><strong>{t.guestName}</strong> <span className="badge badge-gray">{t.people} fő</span> <span className="badge badge-blue">{t.status}</span></div>
                    <div className="permit-meta">
                      <span>{t.from} → {t.to}</span>
                      {t.driver && <span><Car size={13} /> {t.driver}{t.vehicle ? ` (${t.vehicle})` : ''}</span>}
                    </div>
                    {t.notes && <div className="vendor-note" style={{ maxWidth: 'none' }}><StickyNote size={12} /> {t.notes}</div>}
                  </div>
                  <div className="prod-actions">
                    {t.status !== 'Úton' && t.status !== 'Kész' && <button className="btn-secondary compact-btn" onClick={() => setTrStatus(t, 'Úton')}>Úton</button>}
                    {t.status !== 'Kész' && <button className="btn-success compact-btn" onClick={() => setTrStatus(t, 'Kész')}><CheckCircle2 size={14} /> Kész</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'catering' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field-hint" style={{ marginTop: 0 }}>A fellépők létszámát és diétáját itt add meg — a nap fellépői a menetrendből jönnek. A stáb és az önkéntesek adagjait naponta írd be.</div>
          {festDays.map(fd => {
            const d = days.find(x => x.date === fd.date) || { ...fd, label: fd.name };
            const t = totalsFor(fd);
            const c = dayCatering(fd.date);
            return (
              <section key={fd.date} className="dash-card">
                <div className="dash-card-title">
                  <UtensilsCrossed size={18} color="#b45309" /> {d.label} — összesen <span className="badge badge-blue">{t.total} adag</span>
                  <span className="dash-muted" style={{ fontWeight: 600, fontSize: '12.5px' }}>vegán {t.vegan} · gluténmentes {t.glutenFree}</span>
                  <button className="btn-secondary compact-btn" style={{ marginLeft: 'auto' }} onClick={() => toShopping(fd)} disabled={!t.total}><ShoppingCart size={14} /> Beszerzésbe</button>
                </div>
                {t.list.length === 0 ? <div className="dash-muted">Erre a napra nincs fellépő a menetrendben.</div> : (
                  <table className="fin-table">
                    <thead><tr><th>Fellépő</th><th>Létszám</th><th>Vegán</th><th>Gluténm.</th><th>Megjegyzés (rider)</th></tr></thead>
                    <tbody>
                      {t.list.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.name}</strong></td>
                          {['people', 'vegan', 'glutenFree'].map(k => (
                            <td key={k}><input type="number" min="0" className="meal-input" defaultValue={a.meals?.[k] ?? 0}
                              onBlur={(e) => { const v = numOr(e.target.value, 0); if (v !== (a.meals?.[k] ?? 0)) setArtistMeals(a, { [k]: v }); }} /></td>
                          ))}
                          <td style={{ textAlign: 'left', fontSize: '12px', color: '#475569' }}>{[a.hospitality, a.diet].filter(Boolean).join(' · ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="grid-3" style={{ marginTop: '10px' }}>
                  <div><label className="field-label">Stáb adag</label>
                    <input type="number" min="0" defaultValue={c.staff} onBlur={(e) => setDayCatering(fd.date, { staff: numOr(e.target.value, 0) })} /></div>
                  <div><label className="field-label">Önkéntes adag</label>
                    <input type="number" min="0" defaultValue={c.volunteers} onBlur={(e) => setDayCatering(fd.date, { volunteers: numOr(e.target.value, 0) })} /></div>
                  <div><label className="field-label">Megjegyzés</label>
                    <input defaultValue={c.notes} placeholder="pl. ebéd 13:00, vacsora 19:00" onBlur={(e) => setDayCatering(fd.date, { notes: e.target.value })} /></div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editing?.type === 'acc' && (
        <Modal
          title={accommodation.some(a => a.id === editing.item.id) ? 'Szállás szerkesztése' : 'Új szállás'}
          onClose={() => setEditing(null)}
          onSubmit={saveAcc}
          onDelete={accommodation.some(a => a.id === editing.item.id) ? () => removeFrom(accommodation, editing.item, onUpdateAccommodation, `${editing.item.guestName} szállása`) : null}
        >
          <GuestField artists={artists} value={editing.item.guestName} />
          <div className="grid-2">
            <div><label className="field-label">Szállás neve</label><input name="place" defaultValue={editing.item.place} placeholder="pl. Hotel Írottkő" /></div>
            <div><label className="field-label">Cím</label><input name="address" defaultValue={editing.item.address} /></div>
          </div>
          <div className="grid-3">
            <div><label className="field-label">Szobák</label><input type="number" min="0" name="rooms" defaultValue={editing.item.rooms} /></div>
            <div><label className="field-label">Fő</label><input type="number" min="0" name="people" defaultValue={editing.item.people} /></div>
            <div><label className="field-label">Foglalási szám</label><input name="bookingRef" defaultValue={editing.item.bookingRef} /></div>
          </div>
          <div className="grid-2">
            <div><label className="field-label">Érkezés</label><input type="date" name="checkIn" defaultValue={editing.item.checkIn} /></div>
            <div><label className="field-label">Távozás</label><input type="date" name="checkOut" defaultValue={editing.item.checkOut} /></div>
          </div>
          <div className="grid-3">
            <div><label className="field-label">Költség (Ft)</label><input type="number" min="0" name="cost" defaultValue={editing.item.cost} /></div>
            <div><label className="field-label">Ki fizeti?</label><select name="paidBy" defaultValue={editing.item.paidBy}>{PAID_BY.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className="field-label">Visszaigazolva?</label><select name="confirmed" defaultValue={String(Boolean(editing.item.confirmed))}><option value="false">Még nem</option><option value="true">Igen</option></select></div>
          </div>
          <div><label className="field-label">Megjegyzés</label><textarea name="notes" rows={2} defaultValue={editing.item.notes} placeholder="pl. késői érkezés, reggeli kell, parkolás" /></div>
        </Modal>
      )}

      {editing?.type === 'tr' && (
        <Modal
          title={transfers.some(t => t.id === editing.item.id) ? 'Transzfer szerkesztése' : 'Új transzfer'}
          onClose={() => setEditing(null)}
          onSubmit={saveTr}
          onDelete={transfers.some(t => t.id === editing.item.id) ? () => removeFrom(transfers, editing.item, onUpdateTransfers, `${editing.item.guestName} transzfere`) : null}
        >
          <GuestField artists={artists} value={editing.item.guestName} />
          <div className="grid-3">
            <div><label className="field-label">Nap</label>
              <select name="date" defaultValue={editing.item.date}>{days.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}</select></div>
            <div><label className="field-label">Időpont</label><input name="time" defaultValue={editing.item.time} placeholder="pl. 14:35" /></div>
            <div><label className="field-label">Fő</label><input type="number" min="0" name="people" defaultValue={editing.item.people} /></div>
          </div>
          <div className="grid-2">
            <div><label className="field-label">Honnan</label><input name="from" defaultValue={editing.item.from} /></div>
            <div><label className="field-label">Hova</label><input name="to" defaultValue={editing.item.to} placeholder="pl. Hotel Írottkő / Fő tér backstage" /></div>
          </div>
          <div className="grid-3">
            <div><label className="field-label">Ki viszi?</label>
              <input name="driver" defaultValue={editing.item.driver} list="driver-names" placeholder="Név" />
              <datalist id="driver-names">{users.map(u => <option key={u.id} value={u.name} />)}</datalist></div>
            <div><label className="field-label">Autó</label><input name="vehicle" defaultValue={editing.item.vehicle} placeholder="pl. KTSZE kisbusz" /></div>
            <div><label className="field-label">Állapot</label><select name="status" defaultValue={editing.item.status}>{TRANSFER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="field-label">Megjegyzés</label><textarea name="notes" rows={2} defaultValue={editing.item.notes} placeholder="pl. vonatszám, sok cucc (bőgő), telefonszám" /></div>
        </Modal>
      )}
    </div>
  );
}
