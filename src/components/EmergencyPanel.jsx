import React, { useState } from 'react';
import { Siren, Phone, Pencil, Plus, Trash2, X, CloudLightning, ShieldAlert } from 'lucide-react';
import { uid } from '../lib/store';
import { telHref } from '../lib/artists';

const OFFICIAL = [
  { name: 'Általános segélyhívó', phone: '112' },
  { name: 'Mentők', phone: '104' },
  { name: 'Tűzoltóság', phone: '105' },
  { name: 'Rendőrség', phone: '107' }
];
const SUGGESTED_ROLES = ['Polgármesteri ügyelet', 'Áramszolgáltató hibaelhárítás', 'Vízmű ügyelet', 'Helyi rendőrőrs', 'Orvosi ügyelet', 'Biztonsági cég vezetője', 'Gázszolgáltató'];

// Vészhelyzeti lap: hivatalos számok, saját vészkontaktok, vészhelyzeti terv
export function EmergencyPanel({ emergency, onUpdateEmergency, plan, onUpdatePlan, onAddLog, currentUser }) {
  const [editingContact, setEditingContact] = useState(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const p = plan || {};

  const saveContact = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = { ...editingContact, role: f.get('role').trim(), name: f.get('name').trim(), phone: f.get('phone').trim() };
    const exists = emergency.some(x => x.id === item.id);
    onUpdateEmergency(exists ? emergency.map(x => (x.id === item.id ? item : x)) : [...emergency, item]);
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Vészhelyzet', description: `Vészkontakt: ${item.role} — ${item.name}` });
    setEditingContact(null);
  };

  const savePlan = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    onUpdatePlan({
      id: 'emergencyPlan',
      decisionMaker: f.get('decisionMaker').trim(),
      assemblyPoints: f.get('assemblyPoints').trim(),
      evacuation: f.get('evacuation').trim(),
      weatherRule: f.get('weatherRule').trim(),
      updatedBy: currentUser,
      updatedAt: new Date().toISOString()
    });
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Vészhelyzet', description: 'Módosította a vészhelyzeti tervet' });
    setEditingPlan(false);
  };

  return (
    <section className="emergency-panel">
      <div className="emergency-head"><Siren size={20} /> Vészhelyzet</div>

      <div className="emergency-official">
        {OFFICIAL.map(o => (
          <a key={o.phone} href={`tel:${o.phone}`} className="emergency-btn">
            <strong>{o.phone}</strong><span>{o.name}</span>
          </a>
        ))}
      </div>

      <div className="emergency-contacts">
        {emergency.map(c => (
          <div key={c.id} className="emergency-contact">
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{c.role}</strong>
              <div className="dash-sub">{c.name}{c.phone ? ` · ${c.phone}` : ''}</div>
            </div>
            {telHref(c.phone) && <a href={telHref(c.phone)} className="call-pill danger" style={{ marginLeft: 0 }}><Phone size={14} /> Hívás</a>}
            <button className="icon-btn" onClick={() => setEditingContact(c)} aria-label="Szerkesztés"><Pencil size={15} /></button>
          </div>
        ))}
        <button className="btn-secondary" onClick={() => setEditingContact({ id: uid('vsz'), role: '', name: '', phone: '' })}><Plus size={14} /> Vészkontakt (pl. polgármesteri ügyelet, áram-hibaelhárítás)</button>
      </div>

      <div className="emergency-plan">
        <div className="emergency-plan-head">
          <strong><ShieldAlert size={16} /> Vészhelyzeti terv</strong>
          <a href="https://www.met.hu/idojaras/veszelyjelzes/" target="_blank" rel="noopener noreferrer" className="btn-secondary compact-btn" style={{ textDecoration: 'none' }}><CloudLightning size={14} /> Viharjelzés (met.hu)</a>
          <button className="btn-secondary compact-btn" onClick={() => setEditingPlan(true)}><Pencil size={14} /> Szerkesztés</button>
        </div>
        {p.decisionMaker || p.assemblyPoints || p.evacuation || p.weatherRule ? (
          <div className="map-facts">
            {p.decisionMaker && <div><span>Ki dönt a leállításról</span><strong>{p.decisionMaker}</strong></div>}
            {p.weatherRule && <div><span>Vihar / időjárás</span><strong>{p.weatherRule}</strong></div>}
            {p.assemblyPoints && <div><span>Gyülekezőpontok</span><strong>{p.assemblyPoints}</strong></div>}
            {p.evacuation && <div><span>Kiürítés</span><strong>{p.evacuation}</strong></div>}
          </div>
        ) : <div className="dash-muted">Még nincs kitöltve. Kattints a Szerkesztésre — vihar vagy baj esetén mindenki innen tudja, mi a teendő.</div>}
      </div>

      {editingContact && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Vészhelyzeti kontakt</h2>
              <button onClick={() => setEditingContact(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={saveContact}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="field-label">Szerep *</label>
                  <input name="role" defaultValue={editingContact.role} required list="em-roles" placeholder="pl. Polgármesteri ügyelet" />
                  <datalist id="em-roles">{SUGGESTED_ROLES.map(r => <option key={r} value={r} />)}</datalist>
                </div>
                <div className="grid-2">
                  <div><label className="field-label">Név</label><input name="name" defaultValue={editingContact.name} /></div>
                  <div><label className="field-label">Telefon *</label><input name="phone" type="tel" defaultValue={editingContact.phone} required /></div>
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{emergency.some(x => x.id === editingContact.id) && (
                  <button type="button" className="text-danger-btn" onClick={() => { onUpdateEmergency(emergency.filter(x => x.id !== editingContact.id)); setEditingContact(null); }}><Trash2 size={15} /> Törlés</button>
                )}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditingContact(null)}>Mégse</button>
                  <button type="submit" className="btn-primary">Mentés</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPlan && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Vészhelyzeti terv</h2>
              <button onClick={() => setEditingPlan(false)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={savePlan}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div><label className="field-label">Ki dönt a program leállításáról?</label><input name="decisionMaker" defaultValue={p.decisionMaker} placeholder="pl. Gábor (főszervező), távollétében Szilveszter" /></div>
                <div><label className="field-label">Vihar / időjárás esetén</label><textarea name="weatherRule" rows={2} defaultValue={p.weatherRule} placeholder="pl. 60 km/h feletti szélnél a nagyszínpadon a műsor leáll, a molinókat leengedjük" /></div>
                <div><label className="field-label">Gyülekezőpontok</label><textarea name="assemblyPoints" rows={2} defaultValue={p.assemblyPoints} placeholder="pl. Fő tér: Városháza előtt · Jurisics tér: a vár bejárata · Várárok: a játszótér kapuja" /></div>
                <div><label className="field-label">Kiürítés menete, menekülőutak</label><textarea name="evacuation" rows={3} defaultValue={p.evacuation} placeholder="Ki mondja be, merre küldjük a közönséget, ki zárja le az áramot..." /></div>
                <div className="field-hint" style={{ marginTop: 0 }}>A gyülekezőpontokat a térképen is elhelyezheted („Gyülekezőpont” típus).</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingPlan(false)}>Mégse</button>
                <button type="submit" className="btn-primary">Mentés</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
