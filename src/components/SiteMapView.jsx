import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, AlertCircle, CheckCircle2, Phone, Navigation, Crosshair, Pencil, Plus,
  Trash2, X, Search, LocateFixed, Radio, Clock
} from 'lucide-react';
import { getStages } from '../lib/stages';
import { FESTIVAL, MAP_ZONES } from '../lib/config';
import { uid } from '../lib/store';
import { telHref } from '../lib/artists';
import { responsibleCalls } from '../lib/contacts';
import { getFestivalClock, parseRange, sortByTime, formatClock } from '../lib/time';

const TYPES = {
  stage: { label: 'Színpad', color: '#2563eb' },
  wine: { label: 'Borászat', color: '#7c3aed' },
  food: { label: 'Étel / ital', color: '#d97706' },
  power: { label: 'Áram', color: '#ca8a04' },
  water: { label: 'Víz', color: '#0891b2' },
  toilet: { label: 'WC', color: '#059669' },
  medical: { label: 'Mentő / EÜ', color: '#db2777' },
  info: { label: 'Info', color: '#0f172a' },
  waste: { label: 'Hulladék', color: '#64748b' },
  backstage: { label: 'Backstage', color: '#475569' },
  street: { label: 'Utcazene', color: '#9333ea' }
};
const POINT_TYPES = ['power', 'water', 'toilet', 'medical', 'info', 'waste', 'backstage', 'street'];

const hasPos = (it) => typeof it.lat === 'number' && typeof it.lng === 'number';
const round = (n) => Math.round(n * 1e7) / 1e7;
const esc = (str) => String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Ez az eszköz nem ad helyadatot.')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      err => reject(new Error(err.code === 1 ? 'A helyhozzáférés le van tiltva. Engedélyezd a böngészőben!' : 'Nem sikerült meghatározni a helyzetet.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  });
}

export function SiteMapView({
  points, onUpdatePoints, vendors, onUpdateVendors, stages = [], onUpdateStages, schedule, contractors = [], incidents, onUpdateIncidents,
  onAddLog, currentUser, searchQuery
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [localQuery, setLocalQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [placingKey, setPlacingKey] = useState(null);
  const [message, setMessage] = useState('');
  const [newPointOpen, setNewPointOpen] = useState(false);

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const meMarkerRef = useRef(null);
  const mapClickRef = useRef(null);

  // ---------- Minden térképi elem egy listában ----------
  const items = useMemo(() => [
    ...getStages().filter(s => !s.parallel || hasPos(s)).map(s => ({
      key: `stage:${s.id}`, kind: 'stage', id: s.id, type: 'stage',
      code: s.name.split('(')[0].trim(), name: s.name, location: s.location,
      lat: s.lat, lng: s.lng
    })),
    ...vendors.map(v => ({
      key: `vendor:${v.id}`, kind: 'vendor', id: v.id,
      type: (v.category || '').includes('Bor') ? 'wine' : 'food',
      code: v.code, name: v.name, location: v.location, contact: v.contact, phone: v.phone,
      power: v.power, status: v.status, lat: v.lat, lng: v.lng,
      hasProblem: v.hasProblem, problemText: v.problemText
    })),
    ...points.filter(p => POINT_TYPES.includes(p.type)).map(p => ({
      key: `point:${p.id}`, kind: 'point', id: p.id, type: p.type,
      code: p.code, name: p.name, contact: p.contact, phone: p.phone,
      power: p.power, status: p.status, lat: p.lat, lng: p.lng,
      hasProblem: p.hasProblem, problemText: p.problemText
    }))
  ], [points, vendors, stages]);

  const q = `${searchQuery || ''} ${localQuery}`.trim().toLowerCase();
  const matches = (it) => !q || q.split(/\s+/).every(w =>
    [it.code, it.name, it.contact, it.location, TYPES[it.type]?.label].some(v => v && v.toLowerCase().includes(w))
  );
  const filtered = items.filter(it => (typeFilter === 'all' || it.type === typeFilter) && matches(it));
  const placed = filtered.filter(hasPos);
  const unplaced = items.filter(it => !hasPos(it));
  const problems = items.filter(it => it.hasProblem);
  const selected = items.find(it => it.key === selectedKey) || null;
  const placingItem = items.find(it => it.key === placingKey) || null;

  // ---------- Mentések ----------
  const savePosition = (it, lat, lng) => {
    const pos = lat == null ? { lat: null, lng: null } : { lat: round(lat), lng: round(lng) };
    if (it.kind === 'vendor') onUpdateVendors(vendors.map(v => (v.id === it.id ? { ...v, ...pos } : v)));
    else if (it.kind === 'point') onUpdatePoints(points.map(p => (p.id === it.id ? { ...p, ...pos } : p)));
    else if (it.kind === 'stage' && onUpdateStages) onUpdateStages(getStages().map(st => (st.id === it.id ? { ...st, ...pos } : st)));
    else return;
    onAddLog({
      user: currentUser,
      action: 'MAP_POSITION',
      module: 'Helyszínrajz & Térkép',
      description: lat == null ? `Levette a térképről: ${it.code} (${it.name})` : `Elhelyezte a térképen: ${it.code} (${it.name})`
    });
  };

  const flyTo = (lat, lng, zoom = 19) => {
    mapRef.current?.flyTo([lat, lng], Math.max(zoom, mapRef.current.getZoom()), { duration: 0.6 });
  };

  const selectItem = (it) => {
    setSelectedKey(it.key);
    if (hasPos(it)) flyTo(it.lat, it.lng);
  };

  // ---------- Térkép létrehozása ----------
  useEffect(() => {
    const map = L.map(mapEl.current, { maxZoom: 20, zoomControl: true, tap: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    MAP_ZONES.filter(z => z.area).forEach(z => {
      L.polygon(z.area, { color: '#2563eb', weight: 2, dashArray: '6 6', fillOpacity: 0.06, interactive: false }).addTo(map);
    });
    map.fitBounds(L.latLngBounds(MAP_ZONES.map(z => z.center)).pad(0.4));
    map.on('click', (e) => mapClickRef.current?.(e.latlng));

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => { clearTimeout(t); map.remove(); mapRef.current = null; };
  }, []);

  // Koppintás a térképen = a kiválasztott elem ide kerül
  mapClickRef.current = placingItem
    ? (latlng) => {
      savePosition(placingItem, latlng.lat, latlng.lng);
      setSelectedKey(placingItem.key);
      setPlacingKey(null);
    }
    : null;

  // ---------- Jelölők ----------
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    placed.forEach(it => {
      const color = TYPES[it.type]?.color || '#334155';
      const isSel = it.key === selectedKey;
      const icon = L.divIcon({
        className: 'map-pin-anchor',
        iconSize: [0, 0],
        html: `<div class="map-pin${it.hasProblem ? ' problem' : ''}${isSel ? ' selected' : ''}${it.kind === 'stage' ? ' stage' : ''}" style="--pin:${color}"><span>${esc(it.code)}</span>${it.hasProblem ? '<b>!</b>' : ''}</div>`
      });
      const marker = L.marker([it.lat, it.lng], {
        icon,
        draggable: editMode,
        zIndexOffset: isSel ? 1000 : it.hasProblem ? 500 : it.kind === 'stage' ? 300 : 0,
        keyboard: false
      });
      marker.on('click', () => setSelectedKey(it.key));
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        savePosition(it, lat, lng);
        setSelectedKey(it.key);
      });
      marker.addTo(layer);
    });
  }); // minden rendernél frissül (kevés jelölő, így olcsó)

  // ---------- Helymeghatározás ----------
  const showMyLocation = async () => {
    setMessage('Helyzet meghatározása...');
    try {
      const c = await getCurrentPosition();
      if (meMarkerRef.current) meMarkerRef.current.remove();
      meMarkerRef.current = L.circleMarker([c.latitude, c.longitude], {
        radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1
      }).addTo(mapRef.current);
      flyTo(c.latitude, c.longitude, 18);
      setMessage(`Itt vagy (pontosság kb. ${Math.round(c.accuracy)} m).`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const placeHereByGps = async (it) => {
    setMessage('Helyzet meghatározása...');
    try {
      const c = await getCurrentPosition();
      savePosition(it, c.latitude, c.longitude);
      setSelectedKey(it.key);
      flyTo(c.latitude, c.longitude);
      setMessage(`${it.code} a jelenlegi helyedre került (pontosság kb. ${Math.round(c.accuracy)} m).`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // ---------- Hibajelzés (SOS-t is küld) ----------
  const toggleProblem = (it) => {
    const time = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    const apply = (patch) => {
      if (it.kind === 'vendor') onUpdateVendors(vendors.map(v => (v.id === it.id ? { ...v, ...patch } : v)));
      else onUpdatePoints(points.map(p => (p.id === it.id ? { ...p, ...patch } : p)));
    };

    if (!it.hasProblem) {
      const text = window.prompt(`Mi a probléma itt: ${it.code} (${it.name})?`, '');
      if (text === null) return;
      const problemText = text.trim() || 'Azonnali beavatkozás szükséges a helyszínen!';
      apply({ hasProblem: true, problemText });
      onUpdateIncidents([{
        id: uid('inc'), severity: 'critical', location: `${it.code} — ${it.name}`, pointId: it.id,
        reporter: currentUser, time, text: problemText, isResolved: false, resolvedBy: null, resolvedAt: null
      }, ...incidents]);
      onAddLog({ user: currentUser, action: 'FLAG_ISSUE', module: 'Helyszínrajz & Térkép', description: `[PROBLÉMA] ${it.code} (${it.name}): ${problemText}` });
      return;
    }

    apply({ hasProblem: false, problemText: '' });
    if (incidents.some(i => i.pointId === it.id && !i.isResolved)) {
      onUpdateIncidents(incidents.map(i => (
        i.pointId === it.id && !i.isResolved ? { ...i, isResolved: true, resolvedBy: currentUser, resolvedAt: time } : i
      )));
    }
    onAddLog({ user: currentUser, action: 'RESOLVE_ISSUE', module: 'Helyszínrajz & Térkép', description: `[MEGOLDVA] ${it.code} (${it.name})` });
  };

  // ---------- Új / törölt infrastruktúra-pont ----------
  const createPoint = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const id = uid('pt');
    onUpdatePoints([...points, {
      id,
      code: f.get('code').trim() || f.get('name').trim().slice(0, 12).toUpperCase(),
      name: f.get('name').trim(),
      type: f.get('type'),
      contact: f.get('contact').trim(),
      phone: f.get('phone').trim(),
      power: f.get('power').trim(),
      status: 'Üzemel',
      hasProblem: false,
      problemText: ''
    }]);
    onAddLog({ user: currentUser, action: 'CREATE', module: 'Helyszínrajz & Térkép', description: `Új térképpont: ${f.get('name')}` });
    setNewPointOpen(false);
    setPlacingKey(`point:${id}`);
  };

  const savePointDetails = (e, it) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const patch = {
      name: f.get('name').trim(),
      code: f.get('code').trim(),
      type: f.get('type'),
      contact: f.get('contact').trim(),
      phone: f.get('phone').trim(),
      power: f.get('power').trim()
    };
    onUpdatePoints(points.map(p => (p.id === it.id ? { ...p, ...patch } : p)));
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Helyszínrajz & Térkép', description: `Módosította a térképpontot: ${patch.code} (${patch.name})` });
    setMessage('Pont adatai mentve.');
  };

  const deletePoint = (it) => {
    if (!window.confirm(`Biztosan törlöd a pontot: ${it.code} (${it.name})?`)) return;
    onUpdatePoints(points.filter(p => p.id !== it.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Helyszínrajz & Térkép', description: `Törölte a térképpontot: ${it.code} (${it.name})` });
    setSelectedKey(null);
  };

  // ---------- Színpad műsora ----------
  const clock = getFestivalClock();
  const stageDay = clock.day || FESTIVAL.days[0].name;
  const stageActs = (stageId) => sortByTime(schedule.filter(s => s.stageId === stageId && s.day === stageDay));

  const renderDetail = (it) => {
    const color = TYPES[it.type]?.color;
    const href = telHref(it.phone || ((it.contact || '').match(/\+?\d[\d\s-]{6,}/) || [])[0]);
    const acts = it.kind === 'stage' ? stageActs(it.id) : [];
    const helpers = responsibleCalls(contractors, it.type);
    return (
      <div className="map-detail">
        <div className="map-detail-head">
          <span className="map-type" style={{ background: color }}>{TYPES[it.type]?.label}</span>
          <span className="map-code">{it.code}</span>
          <button className="icon-btn" onClick={() => setSelectedKey(null)} aria-label="Bezárás"><X size={18} /></button>
        </div>
        <h3>{it.name}</h3>
        {it.location && <div className="dash-sub">{it.location}</div>}

        {it.hasProblem && (
          <div className="alert-box rose" style={{ margin: '10px 0 0' }}>
            <AlertCircle size={16} /> <div><strong>Jelzett probléma:</strong> {it.problemText}</div>
          </div>
        )}

        <div className="map-facts">
          {it.contact && <div><span>Kapcsolat</span><strong>{it.contact}</strong></div>}
          {it.power && <div><span>Áram</span><strong>{it.power}</strong></div>}
          {it.status && <div><span>Állapot</span><strong>{it.status}</strong></div>}
          {!hasPos(it) && <div><span>Térkép</span><strong style={{ color: '#b45309' }}>Még nincs elhelyezve</strong></div>}
        </div>

        {it.kind === 'stage' && (
          <div className="map-acts">
            <div className="field-label"><Radio size={13} /> {stageDay} műsora</div>
            {acts.length === 0 ? <div className="dash-muted">Nincs műsor.</div> : acts.map(a => {
              const r = parseRange(a.time);
              const live = clock.status === 'during' && r && r.start <= clock.minutes && clock.minutes < r.end;
              return (
                <div key={a.id} className={`map-act${live ? ' live' : ''}`}>
                  <span><Clock size={12} /> {r ? `${formatClock(r.start)}–${formatClock(r.end)}` : a.time}</span>
                  <strong>{live && <span className="live-dot" />} {a.artist}</strong>
                </div>
              );
            })}
          </div>
        )}

        {helpers.length > 0 && (
          <div className="map-calls">
            {helpers.map(h => (
              <a key={h.name} href={telHref(h.phone)} className="call-row">
                <Phone size={18} />
                <span><strong>{h.label}</strong><small>{h.name}{h.person ? ` · ${h.person}` : ''}</small></span>
              </a>
            ))}
          </div>
        )}

        <div className="map-actions">
          {href && <a href={href} className="call-pill"><Phone size={14} /> {it.kind === 'vendor' ? 'Árus hívása' : 'Hívás'}</a>}
          {hasPos(it) && (
            <a
              className="btn-secondary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={14} /> Útvonal
            </a>
          )}
          {it.kind !== 'stage' && (
            <button onClick={() => toggleProblem(it)} className={it.hasProblem ? 'btn-success' : 'btn-danger'}>
              {it.hasProblem ? <><CheckCircle2 size={15} /> Megoldva</> : <><AlertCircle size={15} /> Hiba jelzése</>}
            </button>
          )}
        </div>

        {editMode && (
          <div className="map-edit-actions">
            <button className="btn-secondary" onClick={() => setPlacingKey(it.key)}><Crosshair size={14} /> Elhelyezés koppintással</button>
            <button className="btn-secondary" onClick={() => placeHereByGps(it)}><LocateFixed size={14} /> Ide, ahol állok</button>
            {hasPos(it) && <button className="btn-secondary" onClick={() => savePosition(it, null, null)}>Levétel a térképről</button>}
            {it.kind === 'point' && <button className="text-danger-btn" onClick={() => deletePoint(it)}><Trash2 size={14} /> Pont törlése</button>}
          </div>
        )}
        {editMode && it.kind === 'point' && (
          <form key={it.key} onSubmit={(e) => savePointDetails(e, it)} className="map-new-point" style={{ marginTop: '12px', borderBottom: 'none', paddingBottom: 0 }}>
            <div className="field-label">Pont adatai</div>
            <input name="name" defaultValue={it.name} placeholder="Megnevezés" required />
            <div className="grid-2">
              <input name="code" defaultValue={it.code} placeholder="Kód" />
              <select name="type" defaultValue={it.type}>
                {POINT_TYPES.map(t => <option key={t} value={t}>{TYPES[t].label}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <input name="contact" defaultValue={it.contact} placeholder="Felelős / kapcsolattartó" />
              <input name="phone" type="tel" defaultValue={it.phone} placeholder="Telefon" />
            </div>
            <input name="power" defaultValue={it.power} placeholder="Áram (pl. 3x32A)" />
            <button type="submit" className="btn-primary">Adatok mentése</button>
          </form>
        )}
        {editMode && it.kind === 'stage' && (
          <div className="field-hint" style={{ marginTop: '10px' }}>A helyszín nevét és adatait a Menetrend → Helyszínek gombbal lehet módosítani.</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><MapPin size={20} color="#2563eb" /> Helyszínrajz</h2>
          <p className="view-subtitle">Színpadok, árusok és infrastruktúra — koppints egy pontra a részletekért</p>
        </div>
        <button onClick={() => { setEditMode(m => !m); setPlacingKey(null); }} className={editMode ? 'btn-primary' : 'btn-secondary'}>
          <Pencil size={15} /> {editMode ? 'Szerkesztés vége' : 'Pontok szerkesztése'}
        </button>
      </div>

      {problems.length > 0 && (
        <div className="alert-box rose">
          <AlertCircle size={18} />
          <div>
            <strong>{problems.length} helyen van jelzett probléma:</strong>{' '}
            {problems.map((p, i) => (
              <button key={p.key} className="link-btn" onClick={() => selectItem(p)}>{i > 0 && ' · '}{p.code}</button>
            ))}
          </div>
        </div>
      )}

      <div className="map-toolbar">
        <div className="chip-row">
          {MAP_ZONES.map(z => (
            <button key={z.id} className="chip" onClick={() => flyTo(z.center[0], z.center[1], z.zoom)}>{z.name}</button>
          ))}
          <button className="chip" onClick={() => mapRef.current?.fitBounds(L.latLngBounds(MAP_ZONES.map(z => z.center)).pad(0.4))}>Mind</button>
          <button className="chip locate" onClick={showMyLocation}><LocateFixed size={14} /> Hol vagyok?</button>
        </div>
        <div className="contacts-search">
          <Search size={16} />
          <input type="search" placeholder="Keresés: lángos, BOR-04, WC..." value={localQuery} onChange={(e) => setLocalQuery(e.target.value)} />
        </div>
        <div className="chip-row">
          <button className={`chip small${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>Minden</button>
          {Object.entries(TYPES).map(([t, meta]) => (
            <button
              key={t}
              className={`chip small${typeFilter === t ? ' active' : ''}`}
              onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
            >
              <span className="type-dot" style={{ background: meta.color }} /> {meta.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="map-message">
          {message} <button className="icon-btn" onClick={() => setMessage('')} aria-label="Bezárás"><X size={14} /></button>
        </div>
      )}

      {placingItem && (
        <div className="map-placing">
          <Crosshair size={18} />
          <span>Koppints a térképen oda, ahol <strong>{placingItem.code} — {placingItem.name}</strong> lesz.</span>
          <button className="btn-secondary" onClick={() => placeHereByGps(placingItem).then(() => setPlacingKey(null))}>
            <LocateFixed size={14} /> Ide, ahol állok
          </button>
          <button className="btn-secondary" onClick={() => setPlacingKey(null)}>Mégse</button>
        </div>
      )}

      <div className="map-layout">
        <div className={`leaflet-box${placingItem ? ' placing' : ''}`} ref={mapEl} />

        <aside className="map-side">
          {selected && renderDetail(selected)}

          {q && (
            <div className="map-card">
              <div className="field-label">Találatok ({filtered.length})</div>
              <div className="map-list">
                {filtered.slice(0, 30).map(it => (
                  <button key={it.key} className="map-list-item" onClick={() => selectItem(it)}>
                    <span className="type-dot" style={{ background: TYPES[it.type]?.color }} />
                    <span><strong>{it.code}</strong> {it.name}</span>
                    {!hasPos(it) && <span className="badge badge-amber">nincs helye</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {editMode && (
            <div className="map-card">
              <div className="map-card-head">
                <div className="field-label">Elhelyezésre vár ({unplaced.length})</div>
                <button className="btn-secondary" onClick={() => setNewPointOpen(o => !o)}><Plus size={14} /> Új pont</button>
              </div>

              {newPointOpen && (
                <form onSubmit={createPoint} className="map-new-point">
                  <input name="name" placeholder="Megnevezés (pl. Fő tér WC 2)" required />
                  <div className="grid-2">
                    <input name="code" placeholder="Kód (pl. WC-02)" />
                    <select name="type" defaultValue="toilet">
                      {POINT_TYPES.map(t => <option key={t} value={t}>{TYPES[t].label}</option>)}
                    </select>
                  </div>
                  <div className="grid-2">
                    <input name="contact" placeholder="Kapcsolattartó" />
                    <input name="phone" type="tel" placeholder="Telefon" />
                  </div>
                  <input name="power" placeholder="Áram (pl. 1x16A)" />
                  <button type="submit" className="btn-primary"><Plus size={14} /> Létrehozás és elhelyezés</button>
                  <div className="field-hint" style={{ marginTop: 0 }}>Árust az Árusok menüben vegyél fel — itt csak elhelyezed.</div>
                </form>
              )}

              {unplaced.length === 0 ? (
                <div className="dash-empty"><CheckCircle2 size={16} color="#059669" /> Minden pont a térképen van.</div>
              ) : (
                <div className="map-list">
                  {unplaced.map(it => (
                    <div key={it.key} className="map-list-item static">
                      <span className="type-dot" style={{ background: TYPES[it.type]?.color }} />
                      <span><strong>{it.code}</strong> {it.name}</span>
                      <button className="btn-primary compact" onClick={() => { setSelectedKey(it.key); setPlacingKey(it.key); }}>
                        <Crosshair size={13} /> Elhelyezés
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="field-hint" style={{ marginTop: '8px' }}>
                Szerkesztés módban a jelölők húzhatók is. A helyszínen legegyszerűbb: állj oda, és „Ide, ahol állok”.
              </div>
            </div>
          )}

          {!selected && !q && !editMode && (
            <div className="map-card dash-muted">
              Koppints egy jelölőre a részletekért. {unplaced.length > 0 && `${unplaced.length} pont még nincs elhelyezve — a „Pontok szerkesztése” gombbal teheted fel őket.`}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
