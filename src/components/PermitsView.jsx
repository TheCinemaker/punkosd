import React, { useState } from 'react';
import { FileCheck, Plus, X, Trash2, CalendarClock, UserCheck, Building, Sparkles, StickyNote, ExternalLink } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';
import { docUrl } from '../lib/files';
import { DocSlot } from './DocSlot';
import { BudgetLineSelect } from './BudgetLineSelect';

export const PERMIT_STATUSES = [
  { value: 'Teendő (nincs beadva)', badge: 'badge-gray', open: true },
  { value: 'Beadva, elbírálás alatt', badge: 'badge-blue', open: true },
  { value: 'Hiánypótlás kell', badge: 'badge-amber', open: true },
  { value: 'Megkapva', badge: 'badge-green', open: false },
  { value: 'Elutasítva', badge: 'badge-rose', open: true },
  { value: 'Nem szükséges', badge: 'badge-gray', open: false }
];
export const isPermitOpen = (p) => PERMIT_STATUSES.find(s => s.value === p.status)?.open ?? true;
const badgeOf = (status) => PERMIT_STATUSES.find(s => s.value === status)?.badge || 'badge-gray';

// Tipikus fesztiválengedélyek gyors felvételhez (a hatóság szerkeszthető — a helyi szabályokat ellenőrizni kell)
const TEMPLATES = [
  { name: 'Közterület-használati (foglalási) engedély', authority: 'Kőszeg Város Önkormányzata' },
  { name: 'Zajkibocsátási határérték-felmentés (csendrendelet)', authority: 'Kőszeg Város Önkormányzata (jegyző)' },
  { name: 'Rendezvény bejelentése', authority: 'Rendőrkapitányság' },
  { name: 'Rendezvénybiztonsági terv', authority: 'Rendőrség / katasztrófavédelem' },
  { name: 'Tűzvédelmi hozzájárulás', authority: 'Katasztrófavédelem' },
  { name: 'Ideiglenes áramvételi igény', authority: 'E.ON / áramszolgáltató' },
  { name: 'Útlezárás / forgalomkorlátozás', authority: 'Közútkezelő / önkormányzat' },
  { name: 'Behajtási engedélyek (fellépők, árusok)', authority: 'Kőszeg Város Önkormányzata' },
  { name: 'Mentőszolgálati / egészségügyi biztosítás bejelentése', authority: 'Mentőszolgálat' },
  { name: 'Élelmiszer-árusítás bejelentése (árusok)', authority: 'Kormányhivatal (élelmiszerlánc-biztonság)' },
  { name: 'Zenei felhasználás bejelentése', authority: 'Artisjus' },
  { name: 'Rendezvény felelősségbiztosítás', authority: 'Biztosító' }
];

function deadlineInfo(permit, today) {
  if (!permit.deadline || !isPermitOpen(permit)) return null;
  const days = Math.round((new Date(permit.deadline) - new Date(today)) / 86400000);
  if (days < 0) return { text: `Lejárt ${-days} napja!`, tone: 'rose' };
  if (days === 0) return { text: 'Ma jár le!', tone: 'rose' };
  if (days <= 14) return { text: `${days} nap van hátra`, tone: 'amber' };
  return { text: `${days} nap van hátra`, tone: 'gray' };
}

export function PermitsView({ permits, onUpdatePermits, users = [], budget = [], onAddLog, currentUser, searchQuery = '' }) {
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const today = new Date().toLocaleDateString('sv-SE');

  const q = searchQuery.toLowerCase();
  const filtered = permits
    .filter(p => filter === 'all' || (filter === 'open' ? isPermitOpen(p) : !isPermitOpen(p)))
    .filter(p => !q || [p.name, p.authority, p.responsible, p.status, p.reference, p.notes].some(v => (v || '').toLowerCase().includes(q)))
    .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));

  const openCount = permits.filter(isPermitOpen).length;
  const doneCount = permits.filter(p => p.status === 'Megkapva').length;
  const urgentCount = permits.filter(p => ['rose', 'amber'].includes(deadlineInfo(p, today)?.tone)).length;

  const blank = (template = {}) => ({
    id: uid('prm'),
    name: '',
    authority: '',
    responsible: currentUser,
    status: 'Teendő (nincs beadva)',
    deadline: '',
    submittedAt: '',
    reference: '',
    validFrom: '',
    validTo: '',
    fee: 0,
    requestDoc: null,
    permitDoc: null,
    notes: '',
    ...template
  });

  const openNew = (template) => {
    setIsNew(true);
    setSelected(blank(template));
    setShowTemplates(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const updated = {
      ...selected,
      name: f.get('name').trim(),
      authority: f.get('authority').trim(),
      responsible: f.get('responsible'),
      status: f.get('status'),
      deadline: f.get('deadline'),
      submittedAt: f.get('submittedAt'),
      reference: f.get('reference').trim(),
      validFrom: f.get('validFrom'),
      validTo: f.get('validTo'),
      fee: numOr(f.get('fee'), 0),
      feePaid: f.get('feePaid') === 'true',
      budgetLine: f.get('budgetLine') || '',
      notes: f.get('notes').trim()
    };
    if (isNew) {
      onUpdatePermits([...permits, updated]);
      onAddLog({ user: currentUser, action: 'CREATE', module: 'Engedélyek', description: `Új engedély: ${updated.name} (${updated.status})` });
    } else {
      const prev = permits.find(p => p.id === updated.id);
      onUpdatePermits(permits.map(p => (p.id === updated.id ? updated : p)));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Engedélyek',
        description: prev && prev.status !== updated.status
          ? `${updated.name}: ${prev.status} → ${updated.status}`
          : `Módosította az engedélyt: ${updated.name}`
      });
    }
    setSelected(null);
  };

  const handleDelete = () => {
    if (!window.confirm(`Biztosan törlöd: "${selected.name}"?`)) return;
    onUpdatePermits(permits.filter(p => p.id !== selected.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Engedélyek', description: `Törölte az engedélyt: ${selected.name}` });
    setSelected(null);
  };

  const existingNames = new Set(permits.map(p => p.name));

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><FileCheck size={20} color="#059669" /> Engedélyek & Ügyintézés</h2>
          <p className="view-subtitle">Hatósági engedélyek, bejelentések, határidők és határozatok egy helyen</p>
        </div>
        <div className="toolbar-right">
          <button className="btn-secondary" onClick={() => setShowTemplates(s => !s)}><Sparkles size={15} /> Tipikus engedélyek</button>
          <button className="btn-primary" onClick={() => openNew()}><Plus size={16} /> Új engedély</button>
        </div>
      </div>

      <div className="permit-stats">
        <div><strong>{openCount}</strong><span>folyamatban / teendő</span></div>
        <div><strong style={{ color: '#047857' }}>{doneCount}</strong><span>megkapva</span></div>
        <div><strong style={{ color: urgentCount ? '#b91c1c' : '#0f172a' }}>{urgentCount}</strong><span>sürgős (≤14 nap / lejárt)</span></div>
      </div>

      {showTemplates && (
        <div className="section-box" style={{ marginBottom: '14px' }}>
          <h4 className="section-title"><Sparkles size={16} color="#2563eb" /> Gyors hozzáadás — koppints arra, ami kell</h4>
          <div className="chip-row">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                className="chip"
                disabled={existingNames.has(t.name)}
                onClick={() => openNew(t)}
                title={existingNames.has(t.name) ? 'Már szerepel a listában' : t.authority}
              >
                {existingNames.has(t.name) ? '✓ ' : '+ '}{t.name}
              </button>
            ))}
          </div>
          <div className="field-hint" style={{ marginTop: '8px' }}>A kiadó hatóság csak javaslat — a felvétel után átírható. A helyi szabályokat érdemes az önkormányzattal egyeztetni.</div>
        </div>
      )}

      <div className="chip-row" style={{ marginBottom: '12px' }}>
        {[['open', 'Folyamatban / teendő'], ['done', 'Lezárt'], ['all', 'Mind']].map(([id, label]) => (
          <button key={id} className={`chip${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {permits.length === 0
            ? 'Még nincs felvett engedély. Kezdd a „Tipikus engedélyek” gombbal, vagy vegyél fel újat.'
            : 'Ebben a nézetben nincs engedély.'}
        </div>
      ) : (
        <div className="permit-grid">
          {filtered.map(p => {
            const dl = deadlineInfo(p, today);
            return (
              <button key={p.id} className={`permit-card${dl?.tone === 'rose' ? ' urgent' : ''}`} onClick={() => { setIsNew(false); setSelected(p); }}>
                <div className="permit-top">
                  <span className={`badge ${badgeOf(p.status)}`}>{p.status}</span>
                  {dl && <span className={`permit-deadline ${dl.tone}`}><CalendarClock size={13} /> {p.deadline} · {dl.text}</span>}
                </div>
                <div className="permit-name">{p.name}</div>
                <div className="permit-meta">
                  {p.authority && <span><Building size={13} /> {p.authority}</span>}
                  {p.responsible && <span><UserCheck size={13} /> {p.responsible}</span>}
                  {p.reference && <span>Ügyszám: {p.reference}</span>}
                  {p.validTo && <span>Érvényes: {p.validFrom || '…'} – {p.validTo}</span>}
                </div>
                {p.notes && <div className="vendor-note" style={{ maxWidth: 'none' }}><StickyNote size={12} /> {p.notes}</div>}
                <div className="permit-docs">
                  {docUrl(p.requestDoc) && <a href={docUrl(p.requestDoc)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="phone-link"><ExternalLink size={12} /> Kérelem</a>}
                  {docUrl(p.permitDoc) && <a href={docUrl(p.permitDoc)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="phone-link"><ExternalLink size={12} /> Határozat</a>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{isNew ? 'Új engedély / ügyintézés' : selected.name}</h2>
              <button onClick={() => setSelected(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="field-label">Megnevezés *</label>
                  <input name="name" defaultValue={selected.name} required placeholder="pl. Közterület-használati engedély" />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="field-label">Kiadó hatóság / hova kell beadni</label>
                    <input name="authority" defaultValue={selected.authority} placeholder="pl. Kőszeg Város Önkormányzata" />
                  </div>
                  <div>
                    <label className="field-label">Felelős</label>
                    <select name="responsible" defaultValue={selected.responsible}>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Állapot</label>
                    <select name="status" defaultValue={selected.status}>
                      {PERMIT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Beadási határidő</label>
                    <input type="date" name="deadline" defaultValue={selected.deadline} />
                  </div>
                  <div>
                    <label className="field-label">Beadva (dátum)</label>
                    <input type="date" name="submittedAt" defaultValue={selected.submittedAt} />
                  </div>
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Ügyszám / iktatószám</label>
                    <input name="reference" defaultValue={selected.reference} />
                  </div>
                  <div>
                    <label className="field-label">Érvényes ettől</label>
                    <input type="date" name="validFrom" defaultValue={selected.validFrom} />
                  </div>
                  <div>
                    <label className="field-label">Érvényes eddig</label>
                    <input type="date" name="validTo" defaultValue={selected.validTo} />
                  </div>
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Díj / illeték (Ft)</label>
                    <input type="number" name="fee" min="0" defaultValue={selected.fee} />
                  </div>
                  <div>
                    <label className="field-label">Díj kifizetve?</label>
                    <select name="feePaid" defaultValue={String(Boolean(selected.feePaid))}>
                      <option value="false">Még nem</option>
                      <option value="true">Igen</option>
                    </select>
                  </div>
                  <BudgetLineSelect budget={budget} value={selected.budgetLine} />
                </div>

                <div className="section-box">
                  <h4 className="section-title"><FileCheck size={16} color="#059669" /> Dokumentumok</h4>
                  <div className="grid-2">
                    <DocSlot label="Beadott kérelem" doc={selected.requestDoc} folder="permits/requests"
                      onChange={(doc) => setSelected(prev => ({ ...prev, requestDoc: doc }))} />
                    <DocSlot label="Megkapott határozat / engedély" doc={selected.permitDoc} folder="permits/decisions"
                      onChange={(doc) => setSelected(prev => ({ ...prev, permitDoc: doc }))} />
                  </div>
                  <div className="field-hint">A feltöltött fájl a Mentés gombbal rögzül.</div>
                </div>

                <div>
                  <label className="field-label">Megjegyzés</label>
                  <textarea name="notes" rows={3} defaultValue={selected.notes} placeholder="pl. Ügyintéző: Kiss Anna, a térképet is csatolni kell, hiánypótlás 8 napon belül..." />
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {!isNew && <button type="button" onClick={handleDelete} className="text-danger-btn"><Trash2 size={15} /> Törlés</button>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setSelected(null)} className="btn-secondary">Mégse</button>
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
