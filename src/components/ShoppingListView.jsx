import React, { useState } from 'react';
import { 
  ShoppingCart, CheckSquare, Square, Plus, Edit2, Trash2, 
  Store, DollarSign, Receipt, UserCheck, Calendar, X, AlertTriangle, 
  User, Check, Layers, Tag
} from 'lucide-react';

export function ShoppingListView({ shoppingList, onUpdateShoppingList, onAddLog, currentUser, searchQuery, users = [] }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'purchased'
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const categories = [
    'Összes kategória',
    'Színpad- és Hangtechnika',
    'Áram & Gépbérlés',
    'Higiénia & Szemétkezelés',
    'Biztonság & Kordon',
    'Catering & Backstage',
    'Kellékek & Barkács',
    'Iroda & Nyomda'
  ];

  const stores = [
    'Összes beszerzési forrás',
    'Stage Pro Hungary Kft.',
    'Acoustic Sound Kft.',
    'Aggregátor Bérlés Kft.',
    'ToiToi & Dixi Kft.',
    'Kőszegi Kommunális Kft.',
    'Kordonbér Kft.',
    'Savaria Nyomda Kft.',
    'Metro Szombathely (Nagyker)',
    'Bauhaus / Praktiker (Barkács)',
    'Kőszegi Élelmiszer / Coop / Spar',
    'Kőszegi Tüzép / Építőanyag',
    'Irodaszer & Nyomda'
  ];

  const teamMembers = [
    'Összes felelős',
    ...(users.length > 0 ? users.map(u => u.name) : ['Szilveszter', 'Gábor', 'Zoltán', 'Műszaki Stáb', 'Önkéntes Csapat'])
  ];

  const filtered = shoppingList.filter(item => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? !item.isPurchased :
      item.isPurchased;
    const matchesAssignee = filterAssignee === 'all' || item.responsible === filterAssignee;

    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesStatus && matchesAssignee && matchesSearch;
  });

  // KPI calculations
  const totalEstimatedHuf = shoppingList.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
  const totalActualHuf = shoppingList.reduce((sum, i) => sum + (i.actualPrice || 0), 0);
  const pendingCount = shoppingList.filter(i => !i.isPurchased).length;
  const purchasedCount = shoppingList.filter(i => i.isPurchased).length;

  const handleTogglePurchased = (item) => {
    const isNowPurchased = !item.isPurchased;
    const now = new Date();
    const timeString = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = {
      ...item,
      isPurchased: isNowPurchased,
      purchasedBy: isNowPurchased ? currentUser : null,
      purchasedAt: isNowPurchased ? timeString : null
    };

    onUpdateShoppingList(shoppingList.map(i => i.id === item.id ? updated : i));

    onAddLog({
      user: currentUser,
      action: isNowPurchased ? 'ITEM_PURCHASED' : 'ITEM_UNPURCHASED',
      module: 'Beszerzési Igénylista',
      description: isNowPurchased
        ? `Megvásároltnak / elintézettnek jelölte: "${item.name}" (${item.qty} ${item.unit})`
        : `Visszavonta a beszerzés státuszt: "${item.name}"`
    });
  };

  const handleOpenAdd = () => {
    const now = new Date();
    const timeString = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

    setIsNew(true);
    setSelectedItem({
      id: 'shp-' + Date.now(),
      name: '',
      category: 'Kellékek & Barkács',
      store: 'Metro Szombathely (Nagyker)',
      qty: 1,
      unit: 'db',
      estimatedPrice: 5000,
      actualPrice: 0,
      createdBy: currentUser,
      createdAt: timeString,
      responsible: currentUser,
      priority: 'Normál',
      isPurchased: false,
      purchasedBy: null,
      purchasedAt: null,
      hasReceipt: true,
      notes: ''
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
      name: formData.get('name'),
      category: formData.get('category'),
      store: formData.get('store'),
      qty: Number(formData.get('qty')) || 1,
      unit: formData.get('unit'),
      estimatedPrice: Number(formData.get('estimatedPrice')) || 0,
      actualPrice: Number(formData.get('actualPrice')) || 0,
      createdBy: selectedItem.createdBy || currentUser,
      createdAt: selectedItem.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
      responsible: formData.get('responsible') || currentUser,
      priority: formData.get('priority') || 'Normál',
      hasReceipt: formData.get('hasReceipt') === 'true',
      notes: formData.get('notes')
    };

    if (isNew) {
      onUpdateShoppingList([updated, ...shoppingList]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Beszerzési Igénylista',
        description: `Új beszerzési igényt rögzített: "${updated.name}" | Felelős: ${updated.responsible}`
      });
    } else {
      onUpdateShoppingList(shoppingList.map(i => i.id === updated.id ? updated : i));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Beszerzési Igénylista',
        description: `Módosította a tételt: "${updated.name}"`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Biztosan törlöd a tételt: "${name}"?`)) {
      onUpdateShoppingList(shoppingList.filter(i => i.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Beszerzési Igénylista',
        description: `Törölte a beszerzési tételt: "${name}"`
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* KPI Cards Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#172033', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={14} color="#60a5fa" /> Mester Beszerzési Igények
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
            {shoppingList.length} tétel <span style={{ fontSize: '14px', color: '#fde68a', fontWeight: '700' }}>({pendingCount} beszerzendő)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            {purchasedCount} tétel már átvéve és számlázva
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#172033', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', color: '#fde68a', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={14} color="#fbbf24" /> Tervezett Beszerzési Keret
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
            {totalEstimatedHuf.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            Színpadtól a fogyóanyagokig összesítve
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#172033', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={14} color="#34d399" /> Ténylegesen Fizetett Összeg
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
            {totalActualHuf.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            Számlával igazolt kifizetések
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Status Toggle Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: filterStatus === 'all' ? '800' : '600',
              backgroundColor: filterStatus === 'all' ? '#2563eb' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: filterStatus === 'all' ? '#3b82f6' : '#334155'
            }}
          >
            Összes tétel ({shoppingList.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: filterStatus === 'pending' ? '800' : '600',
              backgroundColor: filterStatus === 'pending' ? '#d97706' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: filterStatus === 'pending' ? '#f59e0b' : '#334155'
            }}
          >
            Beszerzésre vár ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('purchased')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: filterStatus === 'purchased' ? '800' : '600',
              backgroundColor: filterStatus === 'purchased' ? '#059669' : '#1e293b',
              color: '#ffffff',
              border: '1.5px solid',
              borderColor: filterStatus === 'purchased' ? '#10b981' : '#334155'
            }}
          >
            Beszerezve / Kész ({purchasedCount})
          </button>
        </div>

        {/* Dropdown Filters and Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            {categories.map(c => <option key={c} value={c === 'Összes kategória' ? 'all' : c}>{c}</option>)}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            {teamMembers.map(m => <option key={m} value={m === 'Összes felelős' ? 'all' : m}>{m}</option>)}
          </select>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '7px 15px', fontWeight: '800' }}
          >
            <Plus size={16} /> Új Beszerzési Igény
          </button>
        </div>
      </div>

      {/* High Density, High Legibility Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th style={{ width: '44px', textAlign: 'center' }}>Állapot</th>
              <th>Tétel Pontos Megnevezése & Részletek</th>
              <th>Kategória</th>
              <th>Mennyiség</th>
              <th>Forrás / Szállító</th>
              <th>Kinek a dolga beszerezni?</th>
              <th>Ki írta be?</th>
              <th style={{ textAlign: 'right' }}>Becsült Ár</th>
              <th style={{ textAlign: 'right' }}>Tényleges Ár</th>
              <th>Számla?</th>
              <th>Kipipálta / Mikor</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: '#cbd5e1', fontSize: '14px' }}>
                  Nincs megjeleníthető beszerzési tétel a kiválasztott szűrőkkel.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: item.isPurchased ? 'rgba(6, 78, 59, 0.2)' : 'transparent'
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      title={item.isPurchased ? 'Visszavonás' : 'Beszerezve / Pipálás'}
                      style={{
                        color: item.isPurchased ? '#34d399' : '#94a3b8',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {item.isPurchased ? <CheckSquare size={22} color="#34d399" /> : <Square size={22} color="#94a3b8" />}
                    </button>
                  </td>
                  <td>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '14px',
                      color: item.isPurchased ? '#e2e8f0' : '#ffffff',
                      textDecoration: item.isPurchased ? 'line-through' : 'none'
                    }}>
                      {item.name}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-gray" style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: '700' }}>
                      {item.category || 'Kellékek'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#ffffff', whiteSpace: 'nowrap' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ color: '#ffffff', fontWeight: '600', fontSize: '13px' }}>
                    {item.store}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: '#60a5fa' }}>
                      <UserCheck size={14} color="#60a5fa" /> {item.responsible}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                      {item.createdBy || 'Szilveszter'}
                    </div>
                    {item.createdAt && (
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {item.createdAt}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', color: '#f1f5f9', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {item.estimatedPrice ? `${item.estimatedPrice.toLocaleString()} Ft` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: item.actualPrice ? '#34d399' : '#94a3b8', whiteSpace: 'nowrap' }}>
                    {item.actualPrice ? `${item.actualPrice.toLocaleString()} Ft` : '-'}
                  </td>
                  <td>
                    {item.hasReceipt ? (
                      <span className="badge badge-green" style={{ fontWeight: '800' }}>Számla OK</span>
                    ) : (
                      <span className="badge badge-rose" style={{ fontWeight: '800' }}>Nincs számla</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {item.isPurchased ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#34d399',
                        fontWeight: '800',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <Check size={13} /> {item.purchasedBy} ({item.purchasedAt})
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: '600' }}>Folyamatban</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Szerkesztés"
                      style={{ color: '#38bdf8', padding: '6px 8px', cursor: 'pointer' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Törlés"
                      style={{ color: '#f87171', padding: '6px 8px', marginLeft: '4px', cursor: 'pointer' }}
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

      {/* Add / Edit Modal */}
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                {isNew ? 'Új Beszerzési Igény Rögzítése' : `Szerkesztés: ${selectedItem.name}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                    Tétel Megnevezése (A színpadtól a szemeteszsákig)
                  </label>
                  <input
                    name="name"
                    defaultValue={selectedItem.name}
                    placeholder="pl. 120L extra erős szemeteszsákok (60 mikron, 30 tekercs)"
                    required
                    style={{ width: '100%', fontSize: '14px' }}
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" defaultValue={selectedItem.category || 'Kellékek & Barkács'} style={{ width: '100%', fontSize: '13.5px' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Beszerzési Forrás / Szállító / Bolt
                    </label>
                    <select name="store" defaultValue={selectedItem.store} style={{ width: '100%', fontSize: '13.5px' }}>
                      {stores.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Kinek a dolga beszerezni / egyeztetni? (Felelős)
                    </label>
                    <select name="responsible" defaultValue={selectedItem.responsible} style={{ width: '100%', fontSize: '13.5px' }}>
                      {teamMembers.slice(1).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Prioritás
                    </label>
                    <select name="priority" defaultValue={selectedItem.priority || 'Normál'} style={{ width: '100%', fontSize: '13.5px' }}>
                      <option value="Sürgős">Sürgős (Azonnali)</option>
                      <option value="Magas">Magas</option>
                      <option value="Normál">Normál</option>
                      <option value="Alacsony">Alacsony</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Mennyiség
                    </label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Mértékegység
                    </label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="db, tekercs, karton, készlet" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Becsült Költség (Ft)
                    </label>
                    <input type="number" name="estimatedPrice" defaultValue={selectedItem.estimatedPrice} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                      Ténylegesen Fizetett Összeg (Ft)
                    </label>
                    <input type="number" name="actualPrice" defaultValue={selectedItem.actualPrice} placeholder="Vásárlás után kitöltendő" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                    Áfás Számla Kérve és Elrakva?
                  </label>
                  <select name="hasReceipt" defaultValue={String(selectedItem.hasReceipt)} style={{ width: '100%' }}>
                    <option value="true">Igen (KTSZE névre szóló számla leadva)</option>
                    <option value="false">Még nincs számla</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                    Mire kell odafigyelni? (Megjegyzés, műszaki specifikáció)
                  </label>
                  <textarea name="notes" defaultValue={selectedItem.notes} rows={2} placeholder="pl. Csak fekete színű jó, min. 60 mikron, csütörtök délig be kell érkeznie..." style={{ width: '100%' }} />
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                  <span>Ki rögzítette: </span>
                  <strong style={{ color: '#ffffff' }}>{selectedItem.createdBy || currentUser}</strong>
                  {selectedItem.createdAt && <span> ({selectedItem.createdAt})</span>}
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
