import React, { useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, CheckCircle2, PieChart, X } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';

export function BudgetView({ budget, onUpdateBudget, assigned = {}, onAddLog, currentUser, searchQuery }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const suggestedCategories = Array.from(new Set([
    'Színpad- és Hangtechnika',
    'Fellépői Tiszteletdíjak',
    'Higiénia és Hulladékkezelés',
    'Biztonság és Engedélyek',
    'Marketing és Nyomda',
    'Infrastruktúra és Áram',
    'Tartalékkeret',
    ...budget.map(b => b.category).filter(Boolean)
  ]));
  const categories = ['Összes tétel', ...Array.from(new Set(budget.map(b => b.category).filter(Boolean)))];

  const filtered = budget.filter(b => {
    const matchesCat = selectedCat === 'all' || b.category === selectedCat;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q || [b.code, b.name, b.supplier, b.invoice, b.category].some(v => (v || '').toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const totalCost = budget.reduce((sum, b) => sum + (b.qty * b.unitPrice), 0);
  const totalGrant = budget.reduce((sum, b) => sum + (b.grant || 0), 0);
  const totalOwn = budget.reduce((sum, b) => sum + (b.own || 0), 0);
  const grantIntensity = totalCost > 0 ? ((totalGrant / totalCost) * 100).toFixed(1) : '0.0';

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedItem({
      id: uid('bgt'),
      code: `KTG-${String(budget.length + 1).padStart(2, '0')}`,
      category: '',
      name: '',
      qty: 1,
      unit: 'db',
      unitPrice: 0,
      grant: 0,
      own: '',
      supplier: '',
      invoice: '',
      status: 'Tervezett'
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
    const qty = numOr(formData.get('qty'), 1);
    const unitPrice = numOr(formData.get('unitPrice'), 0);
    const grant = numOr(formData.get('grant'), 0);
    const own = numOr(formData.get('own'), qty * unitPrice - grant);

    const updated = {
      ...selectedItem,
      code: formData.get('code'),
      category: (formData.get('category') || '').trim(),
      name: formData.get('name'),
      qty,
      unit: formData.get('unit'),
      unitPrice,
      grant,
      own,
      supplier: formData.get('supplier'),
      invoice: formData.get('invoice'),
      status: formData.get('status')
    };

    if (isNew) {
      onUpdateBudget([...budget, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Költségvetés & Pályázat',
        description: `Új költségvetési sort rögzített: ${updated.code} - ${updated.name} (${(qty * unitPrice).toLocaleString()} Ft)`
      });
    } else {
      onUpdateBudget(budget.map(b => b.id === updated.id ? updated : b));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Költségvetés & Pályázat',
        description: `Módosította a költségvetési sort: ${updated.code} (${updated.status})`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, code, name) => {
    if (window.confirm(`Biztosan törlöd a költségvetési tételt: "${code} - ${name}"?`)) {
      onUpdateBudget(budget.filter(b => b.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Költségvetés & Pályázat',
        description: `Törölte a tételt: ${code} (${name})`
      });
    }
  };

  return (
    <div>
      {/* KPI Cards for Grant Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#334155', fontWeight: '800', textTransform: 'uppercase' }}>
            TELJES PROJEKT KÖLTSÉGVETÉS
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {totalCost.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Bruttó összköltség Kőszeg Fesztivál
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase' }}>
            IGÉNYELT PÁLYÁZATI TÁMOGATÁS
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8', marginTop: '4px' }}>
            {totalGrant.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#1e3a8a', marginTop: '2px', fontWeight: '600' }}>
            Támogatási intenzitás: <strong>{grantIntensity}%</strong>
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '800', textTransform: 'uppercase' }}>
            KTSZE SAJÁT FORRÁS / ÖNRÉSZ
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
            {totalOwn.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Egyesületi önrész és szponzori forrás
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
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isAll = cat === 'Összes tétel';
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

        <div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} /> Új Költségvetési Tétel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Kód</th>
              <th>Kategória</th>
              <th>Tétel Pontos Megnevezése</th>
              <th>Mennyiség</th>
              <th>Egységár</th>
              <th>Összköltség</th>
              <th>Pályázatból (Ft)</th>
              <th>KTSZE Önrész</th>
              <th title="A fellépők, szolgáltatók, beszerzések és engedélyek közül ehhez a sorhoz rendelt kiadások">Tény (hozzárendelve)</th>
              <th>Eltérés</th>
              <th>Szállító / Partner</th>
              <th>Bizonylatszám</th>
              <th>Státusz</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található költségtétel a szűrési feltételekkel.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} onClick={() => handleOpenEdit(b)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '800', color: '#1d4ed8', fontFamily: 'JetBrains Mono', fontSize: '12.5px' }}>
                    {b.code}
                  </td>
                  <td>
                    <span className="badge badge-gray">{b.category}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#000000', maxWidth: '280px' }}>
                    {b.name}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: '600' }}>
                    {b.qty} {b.unit}
                  </td>
                  <td style={{ textAlign: 'right', color: '#0f172a', whiteSpace: 'nowrap', fontWeight: '600' }}>
                    {Number(b.unitPrice || 0).toLocaleString('hu-HU')} Ft
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#000000', whiteSpace: 'nowrap' }}>
                    {Number((b.qty || 0) * (b.unitPrice || 0)).toLocaleString('hu-HU')} Ft
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#1d4ed8', whiteSpace: 'nowrap' }}>
                    {Number(b.grant || 0).toLocaleString('hu-HU')} Ft
                  </td>
                  <td style={{ textAlign: 'right', color: '#b45309', whiteSpace: 'nowrap', fontWeight: '700' }}>
                    {Number(b.own || 0).toLocaleString('hu-HU')} Ft
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: '700' }}>
                    {Number(assigned[b.id]?.total || 0).toLocaleString('hu-HU')} Ft
                    {assigned[b.id]?.count ? <div className="dash-muted" style={{ fontSize: '11px' }}>{assigned[b.id].count} tétel</div> : null}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: '800', color: (b.qty * b.unitPrice) - (assigned[b.id]?.total || 0) < 0 ? '#b91c1c' : '#047857' }}>
                    {Number((b.qty * b.unitPrice) - (assigned[b.id]?.total || 0)).toLocaleString('hu-HU')} Ft
                  </td>
                  <td style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '500' }}>
                    {b.supplier}
                  </td>
                  <td style={{ fontSize: '11.5px', color: '#334155', fontFamily: 'JetBrains Mono', fontWeight: '600' }}>
                    {b.invoice}
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'Kifizetve' || b.status === 'Megrendelve' || b.status === 'Jóváhagyva' ? 'badge-green' : b.status === 'Szerződés alatt' ? 'badge-amber' : 'badge-blue'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(b); }}
                      title="Szerkesztés"
                      style={{ color: '#2563eb', padding: '4px 6px' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(b.id, b.code, b.name); }}
                      title="Törlés"
                      style={{ color: '#dc2626', padding: '4px 6px', marginLeft: '4px' }}
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
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isNew ? 'Új Pályázati Költségvetési Tétel' : `${selectedItem.code} — Költségtétel`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Tétel Kód</label>
                    <input name="code" defaultValue={selectedItem.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Költségvetési Főkategória</label>
                    <input name="category" defaultValue={selectedItem.category} list="budget-categories" required placeholder="Válassz vagy írj be újat" style={{ width: '100%' }} />
                    <datalist id="budget-categories">
                      {suggestedCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Tétel Pontos Megnevezése</label>
                  <input name="name" defaultValue={selectedItem.name} required style={{ width: '100%' }} />
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Mennyiség</label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Egység</label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="db, csomag..." style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Egységár (Bruttó Ft)</label>
                    <input type="number" name="unitPrice" defaultValue={selectedItem.unitPrice} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Pályázatból Igényelt (Ft)</label>
                    <input type="number" name="grant" defaultValue={selectedItem.grant} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>KTSZE Önrész (Ft)</label>
                    <input type="number" name="own" defaultValue={selectedItem.own} placeholder="üresen: összköltség − támogatás" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Szállító / Partner</label>
                    <input name="supplier" defaultValue={selectedItem.supplier} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Számlaszám / Bizonylat</label>
                    <input name="invoice" defaultValue={selectedItem.invoice} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Státusz</label>
                    <select name="status" defaultValue={selectedItem.status} style={{ width: '100%' }}>
                      <option value="Tervezett">Tervezett</option>
                      <option value="Szerződés alatt">Szerződés alatt</option>
                      <option value="Megrendelve">Megrendelve</option>
                      <option value="Jóváhagyva">Jóváhagyva</option>
                      <option value="Kifizetve">Kifizetve</option>
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
