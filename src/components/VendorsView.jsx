import React, { useState } from 'react';
import { Wine, Utensils, Zap, Droplets, Trash2, Plus, Edit2, AlertCircle, ShieldCheck, DollarSign, X } from 'lucide-react';

export function VendorsView({ vendors, onUpdateVendors, onAddLog, currentUser, searchQuery }) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filteredVendors = vendors.filter(v => {
    const matchesLoc =
      selectedLocation === 'all' ? true :
      selectedLocation === 'wine' ? v.category.includes('Borászat') :
      v.category.includes('Ételek');

    const matchesSearch = !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLoc && matchesSearch;
  });

  // Calculate total power demand
  const total32ACount = vendors.filter(v => v.power.includes('3x32A')).length;
  const total16ACount = vendors.filter(v => v.power.includes('16A')).length;
  const totalTrashBags = vendors.reduce((sum, v) => sum + (v.trashBagsIssued || 0), 0);
  const totalTrashBins = vendors.reduce((sum, v) => sum + (v.trashBins || 0), 0);
  const totalDeposits = vendors.reduce((sum, v) => sum + (v.deposit || 0), 0);

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedVendor({
      id: 'ven-' + Date.now(),
      code: `BOR-0${vendors.length + 1}`,
      name: '',
      category: 'Borászat (Fő tér)',
      location: 'Fő tér pavilon',
      contact: '',
      phone: '',
      power: '1x16A (Hűtőkhöz)',
      water: false,
      trashBins: 1,
      trashBagsIssued: 6,
      deposit: 50000,
      fee: 120000,
      status: 'Visszaigazolva'
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
      trashBins: Number(formData.get('trashBins')) || 1,
      trashBagsIssued: Number(formData.get('trashBagsIssued')) || 5,
      deposit: Number(formData.get('deposit')) || 0,
      fee: Number(formData.get('fee')) || 0,
      status: formData.get('status')
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
        description: `Módosította a kitelepülőt: ${updated.name} (Áram: ${updated.power})`
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
        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234' }}>
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#fbbf24" /> Összesített Áramigény
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
            {total32ACount}x 3x32A Ipari • {total16ACount}x 16A
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            Fő tér borhűtők & Jurisics tér food truckok
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234' }}>
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={14} color="#38bdf8" /> Kiosztott Szemétkezelés
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
            {totalTrashBins} db kuka • {totalTrashBags} db 120L zsák
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            Árusonként nyomon követve
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234' }}>
          <div style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="#34d399" /> Kauciók & Helypénzek
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
            {totalDeposits.toLocaleString()} Ft letétben
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
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
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setSelectedLocation('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: selectedLocation === 'all' ? '700' : '500',
              backgroundColor: selectedLocation === 'all' ? '#2563eb' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: selectedLocation === 'all' ? '#3b82f6' : '#334155'
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
              fontWeight: selectedLocation === 'wine' ? '700' : '500',
              backgroundColor: selectedLocation === 'wine' ? '#8b5cf6' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: selectedLocation === 'wine' ? '#a855f7' : '#334155'
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
              fontWeight: selectedLocation === 'food' ? '700' : '500',
              backgroundColor: selectedLocation === 'food' ? '#d97706' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: selectedLocation === 'food' ? '#f59e0b' : '#334155'
            }}
          >
            <Utensils size={14} /> Ételek Utcája (Jurisics tér)
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '12.5px' }}
        >
          <Plus size={15} /> Új Árus / Stand
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
              <th>Státusz</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Nem található vendéglátó a kiválasztott szűrőkkel.
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.id} onClick={() => handleOpenEdit(v)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '700', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {v.code}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#f8fafc' }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {v.location}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${v.category.includes('Bor') ? 'badge-blue' : 'badge-amber'}`}>
                      {v.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{v.contact}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>{v.phone}</div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '11.5px',
                      color: v.power.includes('3x32A') ? '#fbbf24' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Zap size={12} color={v.power.includes('3x32A') ? '#fbbf24' : '#94a3b8'} />
                      {v.power}
                    </span>
                  </td>
                  <td>
                    {v.water ? (
                      <span className="badge badge-green" style={{ fontSize: '10.5px' }}>
                        <Droplets size={10} /> Víz + Szennyvíz
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Nem kér</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>
                    {v.trashBins} db
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#38bdf8' }}>
                    {v.trashBagsIssued} db
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#34d399' }}>
                    {v.deposit ? `${v.deposit.toLocaleString()} Ft` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${v.status.includes('Települt') || v.status === 'Visszaigazolva' ? 'badge-green' : 'badge-amber'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(v); }}
                      title="Szerkesztés"
                      style={{ color: '#38bdf8', padding: '4px 6px' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(v.id, v.name); }}
                      title="Törlés"
                      style={{ color: '#f87171', padding: '4px 6px', marginLeft: '4px' }}
                    >
                      <Trash2 size={15} />
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>
                {isNew ? 'Új Árus / Stand Rögzítése' : `${selectedVendor.name} (${selectedVendor.code})`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Stand Kód</label>
                    <input name="code" defaultValue={selectedVendor.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Árus / Pincészet Neve</label>
                    <input name="name" defaultValue={selectedVendor.name} placeholder="pl. Stefanich Pincészet" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Kategória</label>
                    <select name="category" defaultValue={selectedVendor.category} style={{ width: '100%' }}>
                      <option value="Borászat (Fő tér)">Borászat (Fő tér)</option>
                      <option value="Ételek utcája (Jurisics tér)">Ételek utcája (Jurisics tér)</option>
                      <option value="Kézműves">Kézműves</option>
                      <option value="Kávé / Édesség">Kávé / Édesség</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Pontos Helyszín / Stand</label>
                    <input name="location" defaultValue={selectedVendor.location} placeholder="pl. Fő tér 1. pavilon" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Kapcsolattartó</label>
                    <input name="contact" defaultValue={selectedVendor.contact} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Telefonszám</label>
                    <input name="phone" defaultValue={selectedVendor.phone} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Áramigény</label>
                    <select name="power" defaultValue={selectedVendor.power} style={{ width: '100%' }}>
                      <option value="1x16A (Hűtőkhöz)">1x16A (Hűtőkhöz / 230V)</option>
                      <option value="3x16A">3x16A</option>
                      <option value="3x32A Ipari (Fritőz + rostlap)">3x32A Ipari (Fritőz + rostlap)</option>
                      <option value="Nem kér">Nem kér</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Vízvétel igény</label>
                    <select name="water" defaultValue={String(selectedVendor.water)} style={{ width: '100%' }}>
                      <option value="false">Nem kér</option>
                      <option value="true">Igen (Vízvétel + Szennyvíz)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>Kiosztott Szemeteskuka</label>
                    <input type="number" name="trashBins" defaultValue={selectedVendor.trashBins} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>120L Zsák Kiosztva</label>
                    <input type="number" name="trashBagsIssued" defaultValue={selectedVendor.trashBagsIssued} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Kaució Letét (Ft)</label>
                    <input type="number" name="deposit" defaultValue={selectedVendor.deposit} style={{ width: '100%' }} />
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
