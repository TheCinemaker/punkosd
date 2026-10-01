import React, { useState } from 'react';
import { Phone, Wine, Utensils, Zap, Droplets, Trash2, Plus, Edit2, AlertCircle, DollarSign, X, FileSignature, StickyNote } from 'lucide-react';
import { DocSlot } from './DocSlot';
import { docUrl } from '../lib/files';
import { uid } from '../lib/store';
import { telHref } from '../lib/artists';
import { responsibleCalls } from '../lib/contacts';
import { numOr } from '../lib/form';

// Szerződés állapotai (sorrend = folyamat)
const CONTRACT_STATUSES = [
  { value: 'Nincs még', badge: 'badge-gray' },
  { value: 'Egyeztetés folyamatban', badge: 'badge-amber' },
  { value: 'Kiküldve, aláírásra vár', badge: 'badge-blue' },
  { value: 'Aláírva', badge: 'badge-green' },
  { value: 'Visszalépett / lemondta', badge: 'badge-rose' }
];
const contractBadge = (status) => CONTRACT_STATUSES.find(c => c.value === status)?.badge || 'badge-gray';

export function VendorsView({ vendors, onUpdateVendors, contractors = [], onAddLog, currentUser, searchQuery }) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filteredVendors = vendors.filter(v => {
    const matchesLoc =
      selectedLocation === 'all' ? true :
      selectedLocation === 'wine' ? (v.category || '').includes('Borászat') :
      (v.category || '').includes('Ételek');

    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      [v.name, v.code, v.contact, v.location, v.notes, v.contractStatus].some(x => (x || '').toLowerCase().includes(q));

    return matchesLoc && matchesSearch;
  });

  // Calculate total power demand
  const total32ACount = vendors.filter(v => (v.power || '').includes('3x32A')).length;
  const total16ACount = vendors.filter(v => (v.power || '').includes('16A')).length;
  const signedCount = vendors.filter(v => v.contractStatus === 'Aláírva').length;
  const pendingCount = vendors.filter(v => ['Egyeztetés folyamatban', 'Kiküldve, aláírásra vár'].includes(v.contractStatus)).length;
  const totalTrashBags = vendors.reduce((sum, v) => sum + (v.trashBagsIssued || 0), 0);
  const totalTrashBins = vendors.reduce((sum, v) => sum + (v.trashBins || 0), 0);
  const totalDeposits = vendors.reduce((sum, v) => sum + (v.deposit || 0), 0);

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedVendor({
      id: uid('ven'),
      code: `STAND-${String(vendors.length + 1).padStart(2, '0')}`,
      name: '',
      category: 'Borászat (Fő tér)',
      location: '',
      contact: '',
      phone: '',
      power: '1x16A (Hűtőkhöz)',
      water: false,
      trashBins: 1,
      trashBagsIssued: 0,
      deposit: 0,
      fee: 0,
      status: 'Visszaigazolva',
      contractStatus: 'Nincs még',
      contractDoc: null,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setIsNew(false);
    setSelectedVendor(v);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedVendor,
      code: formData.get('code'),
      name: formData.get('name'),
      category: formData.get('category'),
      location: formData.get('location'),
      contact: formData.get('contact'),
      phone: formData.get('phone'),
      power: formData.get('power'),
      water: formData.get('water') === 'true',
      trashBins: numOr(formData.get('trashBins'), 1),
      trashBagsIssued: numOr(formData.get('trashBagsIssued'), 5),
      deposit: Number(formData.get('deposit')) || 0,
      fee: Number(formData.get('fee')) || 0,
      feePaid: formData.get('feePaid') === 'true',
      status: formData.get('status') || 'Visszaigazolva',
      contractStatus: formData.get('contractStatus') || 'Nincs még',
      contractDoc: selectedVendor.contractDoc || null,
      notes: (formData.get('notes') || '').trim()
    };

    if (isNew) {
      onUpdateVendors([...vendors, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Árusok & Gasztro',
        description: `Új kitelepülőt vett fel: ${updated.name} (${updated.code})`
      });
    } else {
      onUpdateVendors(vendors.map(v => v.id === updated.id ? updated : v));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Árusok & Gasztro',
        description: `Módosította a kitelepülőt: ${updated.name} (szerződés: ${updated.contractStatus})`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Biztosan törlöd a vendéglátót: "${name}"?`)) {
      onUpdateVendors(vendors.filter(v => v.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Árusok & Gasztro',
        description: `Törölte a vendéglátót: "${name}"`
      });
    }
  };

  return (
    <div>
      {/* KPI Cards: Power, Waste, Deposit */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#14532d', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSignature size={15} color="#059669" /> Szerződések
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {signedCount} / {vendors.length} aláírva
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            {pendingCount} folyamatban · {vendors.length - signedCount - pendingCount} nincs még / lemondta
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="#b45309" /> Összesített Áramigény
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {total32ACount}x 3x32A Ipari • {total16ACount}x 16A
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Fő tér borhűtők & Jurisics tér food truckok
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={15} color="#2563eb" /> Kiosztott Szemétkezelés
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1d4ed8', marginTop: '4px' }}>
            {totalTrashBins} db kuka • {totalTrashBags} db 120L zsák
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Árusonként nyomon követve
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#14532d', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={15} color="#059669" /> Kauciók & Helypénzek
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
            {totalDeposits.toLocaleString()} Ft letétben
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Tisztaság és zárás után visszajár
          </div>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedLocation('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: selectedLocation === 'all' ? '800' : '600',
              backgroundColor: selectedLocation === 'all' ? '#2563eb' : '#ffffff',
              color: selectedLocation === 'all' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: selectedLocation === 'all' ? '#1d4ed8' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Minden kitelepülő ({vendors.length})
          </button>
          <button
            onClick={() => setSelectedLocation('wine')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: selectedLocation === 'wine' ? '800' : '600',
              backgroundColor: selectedLocation === 'wine' ? '#7c3aed' : '#ffffff',
              color: selectedLocation === 'wine' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: selectedLocation === 'wine' ? '#6d28d9' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Wine size={14} /> Borok Tere (Fő tér)
          </button>
          <button
            onClick={() => setSelectedLocation('food')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: selectedLocation === 'food' ? '800' : '600',
              backgroundColor: selectedLocation === 'food' ? '#d97706' : '#ffffff',
              color: selectedLocation === 'food' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: selectedLocation === 'food' ? '#b45309' : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Utensils size={14} /> Ételek Utcája (Jurisics tér)
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={16} /> Új Árus / Stand Rögzítése
        </button>
      </div>

      {/* Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Stand Kód</th>
              <th>Árus / Pincészet Neve</th>
              <th>Kategória & Helyszín</th>
              <th>Kapcsolattartó</th>
              <th>Áramigény (Betáp)</th>
              <th>Vízvétel</th>
              <th>Szemeteskuka</th>
              <th>120L Zsák</th>
              <th>Kaució (Ft)</th>
              <th>Szerződés</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található vendéglátó a kiválasztott szűrőkkel.
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.id} onClick={() => handleOpenEdit(v)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '800', color: '#1d4ed8', fontFamily: 'JetBrains Mono', fontSize: '12.5px' }}>
                    {v.code}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#000000', fontSize: '13.5px' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {v.location}
                    </div>
                    {v.notes && (
                      <div className="vendor-note" title={v.notes}>
                        <StickyNote size={12} /> {v.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${(v.category || '').includes('Bor') ? 'badge-blue' : 'badge-amber'}`}>
                      {v.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '600' }}>{v.contact}</div>
                    <div style={{ fontSize: '11.5px', color: '#1d4ed8', fontWeight: '600' }}>{telHref(v.phone) && <a href={telHref(v.phone)} onClick={(e) => e.stopPropagation()} className="call-icon" title="Hívás" aria-label="Hívás"><Phone size={14} /></a>}<a href={telHref(v.phone) || undefined} onClick={(e) => e.stopPropagation()} className="phone-link">{v.phone}</a></div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '12px',
                      color: (v.power || '').includes('3x32A') ? '#b45309' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Zap size={13} color={(v.power || '').includes('3x32A') ? '#d97706' : '#2563eb'} />
                      {v.power}
                    </span>
                  </td>
                  <td>
                    {v.water ? (
                      <span className="badge badge-green" style={{ fontSize: '11px' }}>
                        <Droplets size={11} /> Víz + Szennyvíz
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Nem kér</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#000000' }}>
                    {v.trashBins} db
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: '#1d4ed8' }}>
                    {v.trashBagsIssued} db
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#047857' }}>
                    {v.deposit ? `${v.deposit.toLocaleString()} Ft` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${contractBadge(v.contractStatus)}`}>
                      {v.contractStatus || 'Nincs még'}
                    </span>
                    {docUrl(v.contractDoc) && (
                      <a href={docUrl(v.contractDoc)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="phone-link" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                        Szerződés megnyitása
                      </a>
                    )}
                    {v.status && v.status !== 'Visszaigazolva' && (
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '3px' }}>{v.status}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(v); }}
                      title="Szerkesztés"
                      style={{ color: '#2563eb', padding: '4px 6px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(v.id, v.name); }}
                      title="Törlés"
                      style={{ color: '#dc2626', padding: '4px 6px', marginLeft: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedVendor && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isNew ? 'Új Árus / Stand Rögzítése' : `${selectedVendor.name} (${selectedVendor.code})`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!isNew && (telHref(selectedVendor.phone) || responsibleCalls(contractors, 'food').length > 0) && (
                  <div className="map-calls" style={{ marginTop: 0 }}>
                    {telHref(selectedVendor.phone) && (
                      <a href={telHref(selectedVendor.phone)} className="call-row">
                        <Phone size={18} />
                        <span><strong>Árus hívása</strong><small>{selectedVendor.contact} · {selectedVendor.phone}</small></span>
                      </a>
                    )}
                    {responsibleCalls(contractors, 'food').map(h => (
                      <a key={h.name} href={telHref(h.phone)} className="call-row">
                        <Phone size={18} />
                        <span><strong>{h.label}</strong><small>{h.name}{h.person ? ` · ${h.person}` : ''}</small></span>
                      </a>
                    ))}
                  </div>
                )}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Stand Kód</label>
                    <input name="code" defaultValue={selectedVendor.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Árus / Pincészet Neve *</label>
                    <input name="name" defaultValue={selectedVendor.name} placeholder="pl. Stefanich Pincészet" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Kategória</label>
                    <select name="category" defaultValue={selectedVendor.category} style={{ width: '100%' }}>
                      <option value="Borászat (Fő tér)">Borászat (Fő tér)</option>
                      <option value="Ételek utcája (Jurisics tér)">Ételek utcája (Jurisics tér)</option>
                      <option value="Kézműves">Kézműves</option>
                      <option value="Kávé / Édesség">Kávé / Édesség</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Pontos Helyszín / Stand</label>
                    <input name="location" defaultValue={selectedVendor.location} placeholder="pl. Fő tér 1. pavilon" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Kapcsolattartó</label>
                    <input name="contact" defaultValue={selectedVendor.contact} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Telefonszám</label>
                    <input name="phone" type="tel" defaultValue={selectedVendor.phone} style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="section-box">
                  <h4 className="section-title"><FileSignature size={16} color="#059669" /> Szerződés</h4>
                  <div className="grid-2">
                    <div>
                      <label className="field-label">Szerződés állapota</label>
                      <select name="contractStatus" defaultValue={selectedVendor.contractStatus || 'Nincs még'}>
                        {CONTRACT_STATUSES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                      </select>
                    </div>
                    <DocSlot
                      label="Aláírt szerződés"
                      doc={selectedVendor.contractDoc}
                      folder="vendors/contracts"
                      emptyText="Nincs feltöltve"
                      onChange={(doc) => setSelectedVendor(prev => ({ ...prev, contractDoc: doc }))}
                    />
                  </div>
                  <div className="field-hint">A feltöltött fájl a Mentés gombbal rögzül.</div>
                </div>

                <div>
                  <label className="field-label">Megjegyzés</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={selectedVendor.notes}
                    placeholder="pl. Csak péntektől jön, saját aggregátort hoz, a számlát az egyesület nevére kéri..."
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Áramigény</label>
                    <select name="power" defaultValue={selectedVendor.power} style={{ width: '100%' }}>
                      <option value="1x16A (Hűtőkhöz)">1x16A (Hűtőkhöz / 230V)</option>
                      <option value="3x16A">3x16A</option>
                      <option value="3x32A Ipari (Fritőz + rostlap)">3x32A Ipari (Fritőz + rostlap)</option>
                      <option value="Nem kér">Nem kér</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Vízvétel igény</label>
                    <select name="water" defaultValue={String(selectedVendor.water)} style={{ width: '100%' }}>
                      <option value="false">Nem kér</option>
                      <option value="true">Igen (Vízvétel + Szennyvíz)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Kiosztott Szemeteskuka</label>
                    <input type="number" name="trashBins" defaultValue={selectedVendor.trashBins} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>120L Zsák Kiosztva</label>
                    <input type="number" name="trashBagsIssued" defaultValue={selectedVendor.trashBagsIssued} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Kaució Letét (Ft)</label>
                    <input type="number" name="deposit" defaultValue={selectedVendor.deposit} style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label className="field-label">Standdíj / helypénz (Ft)</label>
                    <input type="number" name="fee" min="0" defaultValue={selectedVendor.fee} />
                  </div>
                  <div>
                    <label className="field-label">Standdíj fizetve?</label>
                    <select name="feePaid" defaultValue={String(Boolean(selectedVendor.feePaid))}>
                      <option value="false">Még nem</option>
                      <option value="true">Igen, kifizetve</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Helyszíni állapot</label>
                    <select name="status" defaultValue={selectedVendor.status || 'Visszaigazolva'}>
                      <option value="Visszaigazolva">Visszaigazolva (még nem települt)</option>
                      <option value="Települt / Ellenőrizve">Települt / ellenőrizve</option>
                      <option value="Elbontott, rendben">Elbontott, rendben</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Mégse</button>
                <button type="submit" className="btn-primary">Mentés</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
