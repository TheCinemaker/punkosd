import React, { useMemo, useRef, useState } from 'react';
import {
  Plus, Trash2, Clock, Volume2, UserCheck, AlertTriangle, FileText, CheckCircle2,
  Eye, Radio, X, Printer, Star, LayoutGrid, List, GanttChartSquare
} from 'lucide-react';
import { DAYS, STAGES } from '../lib/initialData';
import { getFestivalClock, parseRange, sortByTime, findOverlaps, formatClock } from '../lib/time';
import { findArtist, hasRider, isContractSigned } from '../lib/artists';
import { uid } from '../lib/store';
import { DocSlot } from './DocSlot';

// Ezek a fellépő törzsadatai: a fellépőnél tárolódnak, nem a műsorsávnál
const ARTIST_FIELDS = {
  fee: 'fee',
  feeType: 'feeType',
  contractStatus: 'contractStatus',
  contactName: 'contact',
  contactPhone: 'phone',
  contactEmail: 'email',
  hospitality: 'hospitality',
  diet: 'diet',
  techRiderDoc: 'techRiderDoc',
  contractDoc: 'contractDoc',
  stagePlotDoc: 'stagePlotDoc'
};
const DOC_FIELDS = ['techRiderDoc', 'contractDoc', 'stagePlotDoc'];

const PX_PER_MIN = 1.4;

function stageShortName(stageId) {
  const s = STAGES.find(st => st.id === stageId);
  return s ? s.name.split('(')[0].trim() : stageId;
}

function statusBadge(status) {
  if (status === 'Visszaigazolva' || status === 'Jóváhagyva') return 'badge-green';
  if (status === 'Egyeztetés alatt') return 'badge-amber';
  return 'badge-blue';
}

export function ScheduleView({
  schedule,
  onUpdateSchedule,
  artists,
  onUpdateArtists,
  users = [],
  onAddLog,
  currentUser,
  searchQuery
}) {
  const [selectedDay, setSelectedDay] = useState(() => getFestivalClock().day || DAYS[0]);
  const [viewMode, setViewMode] = useState('board');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState('');
  const formRef = useRef(null);

  const q = (searchQuery || '').toLowerCase();
  const daySchedule = schedule.filter(item => item.day === selectedDay);
  const currentDaySchedule = sortByTime(daySchedule.filter(item =>
    !q ||
    (item.title || '').toLowerCase().includes(q) ||
    (item.artist || '').toLowerCase().includes(q) ||
    (item.genre || '').toLowerCase().includes(q) ||
    (item.notes || '').toLowerCase().includes(q) ||
    (item.stageManager || '').toLowerCase().includes(q)
  ));

  const overlaps = useMemo(() => findOverlaps(daySchedule), [daySchedule]);
  const overlapIds = new Set(overlaps.flatMap(o => [o.a.id, o.b.id]));
  const featured = currentDaySchedule.filter(i => i.featured);

  // ---------- Műveletek ----------

  const openModal = (item, isNew) => {
    setIsNewItem(isNew);
    setSelectedItem(item);
    setFormError('');
    setFormKey(k => k + 1);
  };

  const handleAddNew = (stageId = 'main_stage') => {
    openModal({
      id: uid('sch'),
      stageId,
      day: selectedDay,
      time: '18:00 - 19:30',
      title: '',
      artist: '',
      artistId: null,
      genre: '',
      soundcheck: '16:30 - 17:15',
      loadIn: '15:00',
      status: 'Tervezett',
      stageManager: currentUser,
      notes: '',
      featured: false,
      fee: 0,
      feeType: 'Átutalás / Kft számla',
      contractStatus: 'Tervezet',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      techRiderDoc: null,
      contractDoc: null,
      stagePlotDoc: null,
      hospitality: '',
      diet: ''
    }, true);
  };

  const handleOpenItem = (item) => {
    const a = findArtist(artists, item);
    const merged = { ...item, artistId: a ? a.id : item.artistId || null };
    Object.entries(ARTIST_FIELDS).forEach(([formKeyName, artistKey]) => {
      const fromArtist = a ? a[artistKey] : undefined;
      merged[formKeyName] = fromArtist ?? item[formKeyName] ?? (formKeyName === 'fee' ? 0 : DOC_FIELDS.includes(formKeyName) ? null : '');
    });
    openModal(merged, false);
  };

  // Az űrlapba eddig beírt értékek (hogy újrarajzoláskor ne vesszenek el)
  const readForm = () => {
    if (!formRef.current) return {};
    const fd = new FormData(formRef.current);
    const out = {};
    for (const [k, v] of fd.entries()) out[k] = v;
    out.featured = fd.get('featured') === 'on';
    return out;
  };

  const handleSelectExistingArtist = (artistId) => {
    const a = artists.find(item => item.id === artistId);
    if (!a) return;
    const typed = readForm();
    setSelectedItem(prev => {
      const next = { ...prev, ...typed, artist: a.name, artistId: a.id };
      Object.entries(ARTIST_FIELDS).forEach(([formKeyName, artistKey]) => {
        next[formKeyName] = a[artistKey] ?? (DOC_FIELDS.includes(formKeyName) ? null : formKeyName === 'fee' ? 0 : '');
      });
      return next;
    });
    setFormKey(k => k + 1);
  };

  const handleQuickMoveStage = (item, newStageId) => {
    onUpdateSchedule(schedule.map(s => (s.id === item.id ? { ...s, stageId: newStageId } : s)));
    onAddLog({
      user: currentUser,
      action: 'UPDATE',
      module: 'Menetrend & Lineup',
      description: `Áthelyezte: "${item.artist}" (${stageShortName(item.stageId)} → ${stageShortName(newStageId)})`
    });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const f = readForm();
    const artistName = (f.artist || '').trim();

    if (!parseRange(f.time)) {
      setFormError('A koncert idősávját így add meg: 18:00 - 19:30');
      return;
    }

    // 1) Fellépő törzsadat mentése (új vagy meglévő)
    const artistData = {
      fee: Number(f.fee) || 0,
      feeType: f.feeType,
      contractStatus: f.contractStatus,
      contact: f.contactName,
      phone: f.contactPhone,
      email: f.contactEmail,
      hospitality: f.hospitality,
      diet: f.diet,
      techRiderDoc: selectedItem.techRiderDoc || null,
      contractDoc: selectedItem.contractDoc || null,
      stagePlotDoc: selectedItem.stagePlotDoc || null
    };

    let existing = selectedItem.artistId ? artists.find(a => a.id === selectedItem.artistId) : null;
    if (existing && existing.name.trim().toLowerCase() !== artistName.toLowerCase()) existing = null;
    if (!existing) existing = artists.find(a => a.name.trim().toLowerCase() === artistName.toLowerCase()) || null;

    let artistId;
    if (existing) {
      artistId = existing.id;
      const updatedArtist = { ...existing, ...artistData };
      if (JSON.stringify(updatedArtist) !== JSON.stringify(existing)) {
        onUpdateArtists(artists.map(a => (a.id === existing.id ? updatedArtist : a)));
      }
    } else {
      artistId = uid('art');
      onUpdateArtists([...artists, {
        id: artistId,
        name: artistName,
        paymentStatus: 'Fizetésre vár',
        techRider: 'Egyeztetés alatt',
        accommodation: 'Egyeztetés alatt',
        passes: 2,
        ...artistData
      }]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Fellépők Törzsadatbázis',
        description: `Új fellépő a törzsadatbázisban: "${artistName}"`
      });
    }

    // 2) Műsorsáv mentése (fellépő-adatok nélkül)
    const base = { ...selectedItem };
    Object.keys(ARTIST_FIELDS).forEach(k => { delete base[k]; });
    const updatedItem = {
      ...base,
      stageId: f.stageId,
      day: f.day,
      time: f.time.trim(),
      title: (f.title || '').trim() || artistName,
      artist: artistName,
      artistId,
      genre: f.genre,
      soundcheck: f.soundcheck,
      loadIn: f.loadIn,
      status: f.status,
      stageManager: f.stageManager,
      notes: f.notes,
      featured: f.featured
    };

    if (isNewItem) {
      onUpdateSchedule([...schedule, updatedItem]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Menetrend & Lineup',
        description: `Új fellépés (${updatedItem.day}, ${updatedItem.time}, ${stageShortName(updatedItem.stageId)}): ${updatedItem.artist}`
      });
    } else {
      onUpdateSchedule(schedule.map(s => (s.id === updatedItem.id ? updatedItem : s)));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Menetrend & Lineup',
        description: `Frissítette a program adatlapját: ${updatedItem.artist} (${updatedItem.day}, ${updatedItem.time})`
      });
    }

    if (updatedItem.day !== selectedDay) setSelectedDay(updatedItem.day);
    setSelectedItem(null);
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Biztosan törölni szeretnéd: "${item.artist} — ${item.time}"?`)) return;
    onUpdateSchedule(schedule.filter(s => s.id !== item.id));
    onAddLog({
      user: currentUser,
      action: 'DELETE',
      module: 'Menetrend & Lineup',
      description: `Törölte a fellépést: "${item.artist}" (${item.day}, ${item.time})`
    });
    setSelectedItem(null);
  };

  const handleDocUploaded = (label) => (doc) => {
    onAddLog({
      user: currentUser,
      action: 'UPLOAD_DOC',
      module: 'Fellépői Dokumentumok',
      description: `Feltöltötte: ${label} (${doc.name}) — ${selectedItem.artist || 'új fellépő'}`
    });
  };

  // ---------- Megjelenítés ----------

  const renderDocBadges = (item) => {
    const a = findArtist(artists, item);
    return (
      <>
        <span className={`badge ${hasRider(a) ? 'badge-green' : 'badge-rose'}`}>{hasRider(a) ? 'Rider OK' : 'Rider nincs'}</span>
        {isContractSigned(a) && <span className="badge badge-blue">Szerz. OK</span>}
      </>
    );
  };

  const renderBoard = () => (
    <div className="stage-board">
      {STAGES.map(stage => {
        const stageItems = currentDaySchedule.filter(s => s.stageId === stage.id);
        const isMain = stage.id === 'main_stage';
        return (
          <div key={stage.id} className={`stage-col${isMain ? ' main' : ''}`}>
            <div className="stage-col-head">
              <div>
                <h3>{stage.name}</h3>
                <p>{stage.location}</p>
              </div>
              <button onClick={() => handleAddNew(stage.id)} className="round-btn" title="Új műsor erre a színpadra" aria-label="Új műsor">
                <Plus size={16} />
              </button>
            </div>
            <div className="stage-col-body">
              {stageItems.length === 0 ? (
                <div className="stage-empty">
                  Nincs műsor ezen a napon.
                  <button onClick={() => handleAddNew(stage.id)} className="link-btn">+ Új műsor</button>
                </div>
              ) : stageItems.map(item => {
                const conflict = overlapIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className={`act-card${conflict ? ' conflict' : ''}${item.featured ? ' featured' : ''}`}
                  >
                    <div className="act-card-top">
                      <span className="act-time"><Clock size={15} /> {item.time}</span>
                      <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="act-artist">
                      {item.featured && <Star size={14} fill="#f59e0b" color="#f59e0b" />} {item.artist}
                    </div>
                    {(item.title && item.title !== item.artist) || item.genre ? (
                      <div className="act-title">
                        {item.title !== item.artist ? item.title : ''}{item.title !== item.artist && item.genre ? ' • ' : ''}
                        <span>{item.genre}</span>
                      </div>
                    ) : null}
                    {conflict && <div className="act-conflict"><AlertTriangle size={13} /> Időpont-ütközés!</div>}
                    <div className="act-meta">
                      <span className="act-soundcheck"><Volume2 size={13} /> Beállás: {item.soundcheck || '—'}</span>
                      <span><UserCheck size={13} color="#2563eb" /> {item.stageManager}</span>
                    </div>
                    <div className="act-foot">
                      <div className="act-badges">{renderDocBadges(item)}</div>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); handleQuickMoveStage(item, e.target.value); }}
                        value={item.stageId}
                        title="Áthelyezés másik színpadra"
                        className="compact-select"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>→ {stageShortName(s.id)}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTimeline = () => {
    const ranges = currentDaySchedule.flatMap(i => [parseRange(i.time), parseRange(i.soundcheck)]).filter(Boolean);
    if (ranges.length === 0) return <div className="empty-state">Nincs műsor ezen a napon.</div>;
    const startMin = Math.floor(Math.min(...ranges.map(r => r.start)) / 60) * 60;
    const endMin = Math.ceil(Math.max(...ranges.map(r => r.end)) / 60) * 60;
    const height = (endMin - startMin) * PX_PER_MIN;
    const hours = [];
    for (let m = startMin; m <= endMin; m += 60) hours.push(m);

    return (
      <div className="timeline-scroll">
        <div className="timeline" style={{ gridTemplateColumns: `56px repeat(${STAGES.length}, minmax(170px, 1fr))` }}>
          <div className="timeline-head" />
          {STAGES.map(s => <div key={s.id} className="timeline-head">{stageShortName(s.id)}</div>)}

          <div className="timeline-hours" style={{ height }}>
            {hours.map(m => (
              <span key={m} style={{ top: (m - startMin) * PX_PER_MIN }}>{formatClock(m)}</span>
            ))}
          </div>

          {STAGES.map(stage => (
            <div key={stage.id} className="timeline-col" style={{ height }}>
              {hours.map(m => <div key={m} className="timeline-line" style={{ top: (m - startMin) * PX_PER_MIN }} />)}
              {currentDaySchedule.filter(i => i.stageId === stage.id).map(item => {
                const r = parseRange(item.time);
                const sc = parseRange(item.soundcheck);
                const conflict = overlapIds.has(item.id);
                return (
                  <React.Fragment key={item.id}>
                    {sc && (
                      <div
                        className="timeline-soundcheck"
                        style={{ top: (sc.start - startMin) * PX_PER_MIN, height: Math.max(14, (sc.end - sc.start) * PX_PER_MIN) }}
                        title={`Beállás: ${item.artist} ${item.soundcheck}`}
                      >
                        beállás · {item.artist}
                      </div>
                    )}
                    {r && (
                      <button
                        className={`timeline-block${conflict ? ' conflict' : ''}${item.featured ? ' featured' : ''}`}
                        style={{ top: (r.start - startMin) * PX_PER_MIN, height: Math.max(26, (r.end - r.start) * PX_PER_MIN - 2) }}
                        onClick={() => handleOpenItem(item)}
                      >
                        <strong>{item.artist}</strong>
                        <span>{item.time}</span>
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="ops-table-container">
      <table className="ops-table">
        <thead>
          <tr>
            <th>Idősáv</th>
            <th>Színpad</th>
            <th>Fellépő</th>
            <th>Stílus</th>
            <th>Beállás</th>
            <th>Érkezés</th>
            <th>Doksik</th>
            <th>Felelős</th>
            <th>Státusz</th>
            <th style={{ textAlign: 'right' }}>Művelet</th>
          </tr>
        </thead>
        <tbody>
          {currentDaySchedule.length === 0 ? (
            <tr><td colSpan={10} className="empty-cell">Nincs műsor ezen a napon.</td></tr>
          ) : currentDaySchedule.map(item => (
            <tr key={item.id} onClick={() => handleOpenItem(item)} style={{ cursor: 'pointer' }} className={overlapIds.has(item.id) ? 'row-conflict' : ''}>
              <td style={{ fontWeight: 800, color: '#1d4ed8', whiteSpace: 'nowrap' }}>{item.time}</td>
              <td><span className="badge badge-gray">{stageShortName(item.stageId)}</span></td>
              <td style={{ fontWeight: 800 }}>{item.featured && '★ '}{item.artist}</td>
              <td>{item.genre}</td>
              <td style={{ color: '#1e40af', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.soundcheck}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{item.loadIn}</td>
              <td><div className="act-badges">{renderDocBadges(item)}</div></td>
              <td>{item.stageManager}</td>
              <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <button onClick={(e) => { e.stopPropagation(); handleOpenItem(item); }} title="Adatlap" className="icon-btn"><Eye size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} title="Törlés" className="icon-btn danger"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Nyomtatható napi lap színpadonként (stage managernek papíron)
  const renderPrintSheet = () => (
    <div className="print-only">
      {STAGES.map(stage => {
        const items = sortByTime(daySchedule.filter(s => s.stageId === stage.id));
        if (items.length === 0) return null;
        return (
          <section key={stage.id} className="print-sheet">
            <h1>{stage.name} — {selectedDay}</h1>
            <p>{stage.location} · Nyomtatva: {new Date().toLocaleString('hu-HU')}</p>
            <table>
              <thead>
                <tr><th>Érkezés</th><th>Beállás</th><th>Műsor</th><th>Fellépő</th><th>Kapcsolat</th><th>Felelős</th><th>Megjegyzés / hospitality</th></tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const a = findArtist(artists, item);
                  return (
                    <tr key={item.id}>
                      <td>{item.loadIn}</td>
                      <td>{item.soundcheck}</td>
                      <td><strong>{item.time}</strong></td>
                      <td><strong>{item.artist}</strong>{item.title && item.title !== item.artist ? <div>{item.title}</div> : null}</td>
                      <td>{a?.contact}<div>{a?.phone}</div></td>
                      <td>{item.stageManager}</td>
                      <td>{item.notes}{a?.hospitality ? <div>Hospitality: {a.hospitality}</div> : null}{a?.diet ? <div>Diéta: {a.diet}</div> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );

  const staffNames = users.map(u => u.name);

  return (
    <div>
      <div className="screen-only">
        <div className="view-toolbar">
          <div className="day-switch">
            {DAYS.map(day => (
              <button key={day} onClick={() => setSelectedDay(day)} className={`day-btn${selectedDay === day ? ' active' : ''}`}>
                {day}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            <div className="segmented">
              <button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}><LayoutGrid size={14} /> Színpadok</button>
              <button onClick={() => setViewMode('timeline')} className={viewMode === 'timeline' ? 'active' : ''}><GanttChartSquare size={14} /> Idővonal</button>
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><List size={14} /> Lista</button>
            </div>
            <button onClick={() => window.print()} className="btn-secondary" title="Napi lap nyomtatása színpadonként">
              <Printer size={15} /> Nyomtatás
            </button>
            <button onClick={() => handleAddNew('main_stage')} className="btn-primary">
              <Plus size={16} /> Új műsor
            </button>
          </div>
        </div>

        {overlaps.length > 0 && (
          <div className="alert-box rose">
            <AlertTriangle size={18} />
            <div>
              <strong>{overlaps.length} időpont-ütközés ({selectedDay}):</strong>
              {overlaps.map(o => (
                <div key={`${o.a.id}-${o.b.id}`}>
                  {stageShortName(o.stageId)}: {o.a.artist} ({o.a.time}) ↔ {o.b.artist} ({o.b.time})
                </div>
              ))}
            </div>
          </div>
        )}

        {featured.length > 0 && (
          <div className="alert-box green">
            <Star size={18} fill="#16a34a" color="#16a34a" />
            <div>
              <strong>{selectedDay} kiemelt programjai:</strong>{' '}
              {featured.map((f, i) => (
                <span key={f.id}>{i > 0 && ' · '}{formatClock(parseRange(f.time)?.start ?? 0)} {f.artist} ({stageShortName(f.stageId)})</span>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'board' && renderBoard()}
        {viewMode === 'timeline' && renderTimeline()}
        {viewMode === 'list' && renderList()}
      </div>

      {renderPrintSheet()}

      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={22} color="#2563eb" />
                <div>
                  <h2 className="modal-title">{isNewItem ? 'Új fellépés rögzítése' : `${selectedItem.artist || selectedItem.title} — adatlap`}</h2>
                  <p className="modal-subtitle">Időpont és helyszín a műsorhoz; gázsi, kapcsolat és doksik a fellépőhöz mentődnek</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>

            <form key={formKey} ref={formRef} onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="highlight-box">
                  <label className="field-label big">Fellépő / zenekar neve *</label>
                  <input
                    name="artist"
                    defaultValue={selectedItem.artist}
                    placeholder="pl. Ocho Macho"
                    required
                    className="input-strong"
                    list="artist-names"
                  />
                  <datalist id="artist-names">
                    {artists.map(a => <option key={a.id} value={a.name} />)}
                  </datalist>
                  <label className="field-label" style={{ marginTop: '10px' }}>Vagy válassz a meglévő fellépők közül (kitölti az adatait):</label>
                  <select value="" onChange={(e) => handleSelectExistingArtist(e.target.value)}>
                    <option value="">— Meglévő fellépő kiválasztása —</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.fee ? `${Number(a.fee).toLocaleString('hu-HU')} Ft` : 'gázsi nincs megadva'} • {a.contractStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div>
                    <label className="field-label">Műsor címe (opcionális)</label>
                    <input name="title" defaultValue={selectedItem.title !== selectedItem.artist ? selectedItem.title : ''} placeholder="Üresen hagyva a fellépő neve lesz" />
                  </div>
                  <div>
                    <label className="field-label">Műfaj / stílus</label>
                    <input name="genre" defaultValue={selectedItem.genre} placeholder="pl. Világzene, Balkán, DJ szett" />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label className="field-label">Színpad</label>
                    <select name="stageId" defaultValue={selectedItem.stageId}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Nap</label>
                    <select name="day" defaultValue={selectedItem.day}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Státusz</label>
                    <select name="status" defaultValue={selectedItem.status}>
                      <option value="Tervezett">Tervezett</option>
                      <option value="Egyeztetés alatt">Egyeztetés alatt</option>
                      <option value="Visszaigazolva">Visszaigazolva</option>
                      <option value="Jóváhagyva">Jóváhagyva</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label className="field-label">Koncert (kezdés - vége) *</label>
                    <input name="time" defaultValue={selectedItem.time} placeholder="20:30 - 22:00" required />
                  </div>
                  <div>
                    <label className="field-label">Beállás (soundcheck)</label>
                    <input name="soundcheck" defaultValue={selectedItem.soundcheck} placeholder="17:00 - 17:45" />
                  </div>
                  <div>
                    <label className="field-label">Érkezés (load-in)</label>
                    <input name="loadIn" defaultValue={selectedItem.loadIn} placeholder="16:00" />
                  </div>
                </div>
                <div className="field-hint">Éjfél utáni idő is megadható, pl. 23:30 - 02:00 (a napváltás 06:00-kor van).</div>

                <div className="grid-2">
                  <div>
                    <label className="field-label">Felelős (stage manager)</label>
                    <input name="stageManager" defaultValue={selectedItem.stageManager} list="staff-names" />
                    <datalist id="staff-names">
                      {staffNames.map(n => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="field-label">Műszaki / színpadi megjegyzés</label>
                    <input name="notes" defaultValue={selectedItem.notes} placeholder="Mikrofonok, kordon, füstgép..." />
                  </div>
                </div>

                <label className="checkbox-row">
                  <input type="checkbox" name="featured" defaultChecked={Boolean(selectedItem.featured)} />
                  <Star size={15} color="#f59e0b" /> Kiemelt program (megjelenik a nap kiemelései között)
                </label>

                <div className="section-box">
                  <h4 className="section-title"><FileText size={16} color="#2563eb" /> Fellépő dokumentumai</h4>
                  <div className="grid-3">
                    <DocSlot
                      label="Technikai rider"
                      doc={selectedItem.techRiderDoc}
                      folder="artists/riders"
                      emptyText="Még nincs feltöltve"
                      emptyTone="danger"
                      onChange={(doc) => setSelectedItem(prev => ({ ...prev, techRiderDoc: doc }))}
                      onUploaded={handleDocUploaded('technikai rider')}
                    />
                    <DocSlot
                      label="Szerződés"
                      doc={selectedItem.contractDoc}
                      folder="artists/contracts"
                      onChange={(doc) => setSelectedItem(prev => ({ ...prev, contractDoc: doc }))}
                      onUploaded={handleDocUploaded('szerződés')}
                    />
                    <DocSlot
                      label="Stage plot"
                      doc={selectedItem.stagePlotDoc}
                      folder="artists/stageplots"
                      onChange={(doc) => setSelectedItem(prev => ({ ...prev, stagePlotDoc: doc }))}
                      onUploaded={handleDocUploaded('stage plot')}
                    />
                  </div>
                  <div className="field-hint">A feltöltött fájl a Mentés gombbal rögzül a fellépő adatlapján.</div>
                </div>

                <div className="grid-3">
                  <div>
                    <label className="field-label">Gázsi (Ft)</label>
                    <input type="number" name="fee" defaultValue={selectedItem.fee} min="0" />
                  </div>
                  <div>
                    <label className="field-label">Számlázási mód</label>
                    <select name="feeType" defaultValue={selectedItem.feeType}>
                      <option value="Átutalás / Kft számla">Átutalás / Kft számla</option>
                      <option value="KATA számla">KATA számla</option>
                      <option value="Egyesületi elszámolás">Egyesületi elszámolás</option>
                      <option value="Készpénz helyszínen">Készpénz helyszínen</option>
                      <option value="Saját fellépés (KTSZE stáb)">Saját fellépés (KTSZE stáb)</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Szerződés státusz</label>
                    <select name="contractStatus" defaultValue={selectedItem.contractStatus}>
                      <option value="Tervezet">Tervezet</option>
                      <option value="Kiküldve">Kiküldve</option>
                      <option value="Aláírva">Aláírva</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label className="field-label">Kapcsolattartó</label>
                    <input name="contactName" defaultValue={selectedItem.contactName} placeholder="Menedzser / tour manager" />
                  </div>
                  <div>
                    <label className="field-label">Telefon</label>
                    <input name="contactPhone" type="tel" defaultValue={selectedItem.contactPhone} placeholder="+36 30 ..." />
                  </div>
                  <div>
                    <label className="field-label">E-mail</label>
                    <input name="contactEmail" type="email" defaultValue={selectedItem.contactEmail} placeholder="booking@..." />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label className="field-label">Hospitality / backstage ellátás</label>
                    <input name="hospitality" defaultValue={selectedItem.hospitality} placeholder="pl. 8 fő melegétel, víz, kávé" />
                  </div>
                  <div>
                    <label className="field-label">Étrendi igény</label>
                    <input name="diet" defaultValue={selectedItem.diet} placeholder="pl. 2 vegetáriánus, 1 gluténmentes" />
                  </div>
                </div>

                {formError && <div className="form-error">{formError}</div>}
              </div>

              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {!isNewItem && (
                    <button type="button" onClick={() => handleDelete(selectedItem)} className="text-danger-btn">
                      <Trash2 size={15} /> Törlés
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setSelectedItem(null)} className="btn-secondary">Mégse</button>
                  <button type="submit" className="btn-primary"><CheckCircle2 size={16} /> Mentés</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
