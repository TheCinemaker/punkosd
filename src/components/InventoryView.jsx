import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Tag, CheckCircle2, AlertTriangle, MapPin, UserCheck, X } from 'lucide-react';

export function InventoryView({ inventory, onUpdateInventory, onAddLog, currentUser, searchQuery }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const categories = [
    'Összes kategória',
    'Higiénia & Szemét',
    'Áram & Kábel',
    'Kordon & Védelem',
    'Színpad & Bútor',
    'Biztonság & Mentés'
  ];

  const filtered = inventory.filter(i => {
    const matchesCat = selectedCat === 'all' || i.category === selectedCat;
    const matchesSearch = !searchQuery ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedItem({
      id: 'inv-' + Date.now(),
      code: `ZSAK-0${inventory.length + 1}`,
      name: '',
      category: 'Higiénia & Szemét',
      qty: 1,
      unit: 'db',
      location: 'KTSZE Raktár',
      responsible: currentUser,
      status: 'Raktáron'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsNew(false);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedItem,
      code: formData.get('code'),
      name: formData.get('name'),
      category: formData.get('category'),
      qty: Number(formData.get('qty')) || 1,
      unit: formData.get('unit'),
      location: formData.get('location'),
      responsible: formData.get('responsible'),
      status: formData.get('status')
    };

    if (isNew) {
      onUpdateInventory([...inventory, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Készlet & Eszközök',
        description: `Új tételt vett fel a raktárba: ${updated.code} - ${updated.name}`
      });
    } else {
      onUpdateInventory(inventory.map(i => i.id === updated.id ? updated : i));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Készlet & Eszközök',
        description: `Módosította a készlet tételt: ${updated.code} (${updated.status})`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, code, name) => {
    if (window.confirm(`Biztosan törölni szeretnéd a(z) "${code} - ${name}" tételt?`)) {
      onUpdateInventory(inventory.filter(i => i.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Készlet & Eszközök',
        description: `Törölte a tételt: ${code} (${name})`
      });
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isAll = cat === 'Összes kategória';
            const isActive = isAll ? selectedCat === 'all' : selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(isAll ? 'all' : cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? '800' : '600',
                  backgroundColor: isActive ? '#2563eb' : '#ffffff',
                  color: isActive ? '#ffffff' : '#0f172a',
                  border: '1.5px solid',
                  borderColor: isActive ? '#1d4ed8' : '#cbd5e1',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={16} /> Új Készlet / Kellék Tétel
        </button>
      </div>

      {/* Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Eszköz Kód</th>
              <th>Megnevezés</th>
              <th>Kategória</th>
              <th>Mennyiség & Egység</th>
              <th>Helyszíni Zóna / Telepítés</th>
              <th>Felelős Személy</th>
              <th>Státusz</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található eszköz a keresési feltételekkel.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} onClick={() => handleOpenEdit(item)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '800', color: '#1d4ed8', fontFamily: 'JetBrains Mono', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {item.code}
                  </td>
                  <td style={{ fontWeight: '700', color: '#000000', fontSize: '13.5px' }}>
                    {item.name}
                  </td>
                  <td>
                    <span className="badge badge-gray">{item.category}</span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#000000', whiteSpace: 'nowrap' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontSize: '12.5px', fontWeight: '500' }}>
                      <MapPin size={13} color="#2563eb" /> {item.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#0f172a', fontWeight: '600' }}>
                      <UserCheck size={13} color="#2563eb" /> {item.responsible}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Telepítve' || item.status === 'Raktáron' || item.status === 'Ellenőrizve' ? 'badge-green' : item.status === 'Kiadva' || item.status === 'Használatban' ? 'badge-blue' : 'badge-rose'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                      title="Szerkesztés"
                      style={{ color: '#2563eb', padding: '4px 6px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.code, item.name); }}
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
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isNew ? 'Új Készlet / Kellék Rögzítése' : `${selectedItem.code} — ${selectedItem.name}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Azonosító Kód (pl. ZSAK-01, KUKA-02)
                    </label>
                    <input name="code" defaultValue={selectedItem.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" defaultValue={selectedItem.category} style={{ width: '100%' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Eszköz / Tétel Megnevezése *
                  </label>
                  <input name="name" defaultValue={selectedItem.name} placeholder="pl. 120L Gurulós Szemetes Kuka" required style={{ width: '100%' }} />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Mennyiség
                    </label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Egység
                    </label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="db, tekercs, m..." required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Helyszíni Zóna / Elhelyezés
                    </label>
                    <input name="location" defaultValue={selectedItem.location} placeholder="pl. Fő tér nagyszínpad mögött" required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Felelős Személy
                    </label>
                    <input name="responsible" defaultValue={selectedItem.responsible} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Állapot / Státusz
                  </label>
                  <select name="status" defaultValue={selectedItem.status} style={{ width: '100%' }}>
                    <option value="Raktáron">Raktáron</option>
                    <option value="Ellenőrizve">Ellenőrizve</option>
                    <option value="Kiadva">Kiadva</option>
                    <option value="Telepítve">Telepítve</option>
                    <option value="Karbantartás alatt">Karbantartás alatt</option>
                  </select>
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
