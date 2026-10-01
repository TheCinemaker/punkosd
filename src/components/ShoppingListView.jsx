import React, { useState } from 'react';
import { 
  ShoppingCart, CheckSquare, Square, Plus, Edit2, Trash2, 
  Store, DollarSign, Receipt, UserCheck, Calendar, X, 
  User, Check, Layers, Tag
} from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';

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

  // Beszerzési források: a már használtakból (szabadon bővíthető)
  const stores = [
    'Összes beszerzési forrás',
    ...Array.from(new Set(shoppingList.map(i => i.store).filter(Boolean))).sort((x, y) => x.localeCompare(y, 'hu'))
  ];

  const teamMembers = [
    'Összes felelős',
    ...(users.length > 0 ? users.map(u => u.name) : ['Szilveszter', 'Gábor', 'Robi', 'Péter', 'Adrienn', 'Bea'])
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
    const timeString = `${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

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
    const timeString = `${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;

    setIsNew(true);
    setSelectedItem({
      id: uid('shp'),
      name: '',
      category: 'Kellékek & Barkács',
      store: '',
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
      qty: numOr(formData.get('qty'), 1),
      unit: formData.get('unit'),
      estimatedPrice: numOr(formData.get('estimatedPrice'), 0),
      actualPrice: numOr(formData.get('actualPrice'), 0),
      createdBy: selectedItem.createdBy || currentUser,
      createdAt: selectedItem.createdAt || new Date().toLocaleString('sv-SE').slice(0, 16),
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
        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={15} color="#2563eb" /> Mester Beszerzési Igények
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {shoppingList.length} tétel <span style={{ fontSize: '14px', color: '#b45309', fontWeight: '700' }}>({pendingCount} beszerzendő)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            {purchasedCount} tétel már átvéve és számlázva
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={15} color="#d97706" /> Tervezett Beszerzési Keret
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
            {totalEstimatedHuf.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Színpadtól a fogyóanyagokig összesítve
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '11.5px', color: '#14532d', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={15} color="#059669" /> Ténylegesen Fizetett Összeg
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
            {totalActualHuf.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: filterStatus === 'all' ? '800' : '600',
              backgroundColor: filterStatus === 'all' ? '#2563eb' : '#ffffff',
              color: filterStatus === 'all' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'all' ? '#1d4ed8' : '#cbd5e1',
              cursor: 'pointer'
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
              backgroundColor: filterStatus === 'pending' ? '#d97706' : '#ffffff',
              color: filterStatus === 'pending' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'pending' ? '#b45309' : '#cbd5e1',
              cursor: 'pointer'
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
              backgroundColor: filterStatus === 'purchased' ? '#059669' : '#ffffff',
              color: filterStatus === 'purchased' ? '#ffffff' : '#0f172a',
              border: '1.5px solid',
              borderColor: filterStatus === 'purchased' ? '#047857' : '#cbd5e1',
              cursor: 'pointer'
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
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600', width: 'auto' }}
          >
            {categories.map(c => <option key={c} value={c === 'Összes kategória' ? 'all' : c}>{c}</option>)}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600', width: 'auto' }}
          >
            {teamMembers.map(m => <option key={m} value={m === 'Összes felelős' ? 'all' : m}>{m}</option>)}
          </select>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '8px 16px', fontWeight: '700' }}
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
                <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: '#475569', fontSize: '14px' }}>
                  Nincs megjeleníthető beszerzési tétel a kiválasztott szűrőkkel.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: item.isPurchased ? '#f0fdf4' : '#ffffff'
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      title={item.isPurchased ? 'Visszavonás' : 'Beszerezve / Pipálás'}
                      style={{
                        color: item.isPurchased ? '#059669' : '#64748b',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {item.isPurchased ? <CheckSquare size={22} color="#059669" /> : <Square size={22} color="#64748b" />}
                    </button>
                  </td>
                  <td>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '14px',
                      color: item.isPurchased ? '#475569' : '#000000',
                      textDecoration: item.isPurchased ? 'line-through' : 'none'
                    }}>
                      {item.name}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px', fontWeight: '500' }}>
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-gray" style={{ fontSize: '11.5px', fontWeight: '700' }}>
                      {item.category || 'Kellékek'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#000000', whiteSpace: 'nowrap' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ color: '#0f172a', fontWeight: '600', fontSize: '13px' }}>
                    {item.store}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: '#1d4ed8' }}>
                      <UserCheck size={14} color="#2563eb" /> {item.responsible}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                      {item.createdBy || 'Szilveszter'}
                    </div>
                    {item.createdAt && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.createdAt}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', color: '#0f172a', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {`${Number(item.estimatedPrice || 0).toLocaleString('hu-HU')} Ft`}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: item.actualPrice ? '#047857' : '#64748b', whiteSpace: 'nowrap' }}>
                    {item.isPurchased || item.actualPrice ? `${Number(item.actualPrice || 0).toLocaleString('hu-HU')} Ft` : '-'}
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
                        color: '#14532d',
                        fontWeight: '800',
                        backgroundColor: '#dcfce7',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #86efac'
                      }}>
                        <Check size={13} /> {item.purchasedBy} ({item.purchasedAt})
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontWeight: '600' }}>Folyamatban</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Szerkesztés"
                      style={{ color: '#2563eb', padding: '6px 8px', cursor: 'pointer' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Törlés"
                      style={{ color: '#dc2626', padding: '6px 8px', marginLeft: '4px', cursor: 'pointer' }}
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isNew ? 'Új Beszerzési Igény Rögzítése' : `Szerkesztés: ${selectedItem.name}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Tétel Megnevezése *
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kategória
                    </label>
                    <select name="category" defaultValue={selectedItem.category || 'Kellékek & Barkács'} style={{ width: '100%', fontSize: '13.5px' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Beszerzési Forrás / Szállító / Bolt
                    </label>
                    <input name="store" defaultValue={selectedItem.store} list="store-list" placeholder="pl. Metro Szombathely, bérlő cég neve..." style={{ width: '100%', fontSize: '13.5px' }} />
                    <datalist id="store-list">
                      {stores.slice(1).map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kinek a dolga beszerezni? (Felelős)
                    </label>
                    <select name="responsible" defaultValue={selectedItem.responsible} style={{ width: '100%', fontSize: '13.5px' }}>
                      {teamMembers.slice(1).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Mennyiség
                    </label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Mértékegység
                    </label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="db, tekercs, karton, készlet" required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Becsült Költség (Ft)
                    </label>
                    <input type="number" name="estimatedPrice" defaultValue={selectedItem.estimatedPrice} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Ténylegesen Fizetett Összeg (Ft)
                    </label>
                    <input type="number" name="actualPrice" defaultValue={selectedItem.actualPrice} placeholder="Vásárlás után kitöltendő" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Áfás Számla Kérve és Elrakva?
                  </label>
                  <select name="hasReceipt" defaultValue={String(selectedItem.hasReceipt)} style={{ width: '100%' }}>
                    <option value="true">Igen (KTSZE névre szóló számla leadva)</option>
                    <option value="false">Még nincs számla</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Mire kell odafigyelni? (Megjegyzés, műszaki specifikáció)
                  </label>
                  <textarea name="notes" defaultValue={selectedItem.notes} rows={2} placeholder="pl. Csak fekete színű jó, min. 60 mikron, csütörtök délig be kell érkeznie..." style={{ width: '100%' }} />
                </div>

                <div style={{ fontSize: '12px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span>Ki rögzítette: </span>
                  <strong style={{ color: '#0f172a' }}>{selectedItem.createdBy || currentUser}</strong>
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
