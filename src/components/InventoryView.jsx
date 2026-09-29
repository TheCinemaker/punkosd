import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Tag, CheckCircle2, AlertTriangle, MapPin, UserCheck } from 'lucide-react';

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
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map(cat => {
            const isAll = cat === 'Összes kategória';
            const isActive = isAll ? selectedCat === 'all' : selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(isAll ? 'all' : cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? '#2563eb' : '#1e293b',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: '1px solid #27354d',
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
          style={{ padding: '7px 14px', fontSize: '12.5px' }}
        >
          <Plus size={15} /> Új Készlet / Kellék Tétel
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
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Nem található eszköz a keresési feltételekkel.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} onClick={() => handleOpenEdit(item)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '700', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {item.code}
                  </td>
                  <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                    {item.name}
                  </td>
                  <td>
                    <span className="badge badge-gray">{item.category}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#fbbf24', whiteSpace: 'nowrap' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1', fontSize: '12px' }}>
                      <MapPin size={12} color="#38bdf8" /> {item.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <UserCheck size={12} color="#60a5fa" /> {item.responsible}
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
                      style={{ color: '#38bdf8', padding: '4px 6px' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.code, item.name); }}
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
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>
                {isNew ? 'Új Készlet / Kellék Rögzítése' : `${selectedItem.code} — ${selectedItem.name}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#94a3b8', fontSize: '18px' }}>✕</button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Azonosító Kód (pl. ZSAK-01, KUKA-02)
                    </label>
                    <input name="code" defaultValue={selectedItem.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" defaultValue={selectedItem.category} style={{ width: '100%' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Tétel Pontos Megnevezése
                  </label>
                  <input name="name" defaultValue={selectedItem.name} placeholder="pl. 120L Extra Erős Zsákok (Kék Kommunális)" required style={{ width: '100%' }} />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Mennyiség
                    </label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Mértékegység
                    </label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="pl. db, tekercs, méter" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Helyszíni Zóna / Telepítési Pont
                    </label>
                    <input name="location" defaultValue={selectedItem.location} placeholder="pl. Jurisics tér Ételek utcája" required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Felelős Személy
                    </label>
                    <input name="responsible" defaultValue={selectedItem.responsible} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Státusz
                  </label>
                  <select name="status" defaultValue={selectedItem.status} style={{ width: '100%' }}>
                    <option value="Raktáron">Raktáron</option>
                    <option value="Kiadva">Kiadva</option>
                    <option value="Telepítve">Telepítve</option>
                    <option value="Használatban">Használatban</option>
                    <option value="Ellenőrizve">Ellenőrizve</option>
                    <option value="Hiányzik / Fogyóban">Hiányzik / Fogyóban</option>
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
