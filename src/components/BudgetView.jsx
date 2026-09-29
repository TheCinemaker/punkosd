import React, { useState } from 'react';
import { DollarSign, Download, Plus, Edit2, Trash2, CheckCircle2, PieChart, FileSpreadsheet, X } from 'lucide-react';

export function BudgetView({ budget, onUpdateBudget, onAddLog, currentUser, onExportExcel, searchQuery }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const categories = [
    'Összes tétel',
    'Színpad- és Hangtechnika',
    'Fellépői Tiszteletdíjak',
    'Higiénia és Hulladékkezelés',
    'Biztonság és Engedélyek',
    'Marketing és Nyomda',
    'Infrastruktúra és Áram',
    'Tartalékkeret'
  ];

  const filtered = budget.filter(b => {
    const matchesCat = selectedCat === 'all' || b.category === selectedCat;
    const matchesSearch = !searchQuery ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.invoice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalCost = budget.reduce((sum, b) => sum + (b.qty * b.unitPrice), 0);
  const totalGrant = budget.reduce((sum, b) => sum + (b.grant || 0), 0);
  const totalOwn = budget.reduce((sum, b) => sum + (b.own || 0), 0);
  const grantIntensity = totalCost > 0 ? ((totalGrant / totalCost) * 100).toFixed(1) : '0.0';

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedItem({
      id: 'bgt-' + Date.now(),
      code: `KTG-0${budget.length + 1}`,
      category: 'Színpad- és Hangtechnika',
      name: '',
      qty: 1,
      unit: 'db',
      unitPrice: 100000,
      grant: 80000,
      own: 20000,
      supplier: '',
      invoice: '-',
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
    const qty = Number(formData.get('qty')) || 1;
    const unitPrice = Number(formData.get('unitPrice')) || 0;
    const grant = Number(formData.get('grant')) || 0;
    const own = Number(formData.get('own')) || (qty * unitPrice - grant);

    const updated = {
      ...selectedItem,
      code: formData.get('code'),
      category: formData.get('category'),
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
        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
            TELJES PROJEKT KÖLTSÉGVETÉS
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>
            {totalCost.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Bruttó összköltség Kőszeg Fesztivál
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234', borderLeft: '3px solid #3b82f6' }}>
          <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase' }}>
            IGÉNYELT PÁLYÁZATI TÁMOGATÁS
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
            {totalGrant.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
            Támogatási intenzitás: <strong>{grantIntensity}%</strong>
          </div>
        </div>

        <div className="ops-card" style={{ padding: '14px 18px', backgroundColor: '#182234', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase' }}>
            KTSZE SAJÁT FORRÁS / ÖNRÉSZ
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
            {totalOwn.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Egyesületi önrész és szponzori bevételek
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
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map(cat => {
            const isAll = cat === 'Összes tétel';
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
                  border: '1px solid',
                  borderColor: isActive ? '#3b82f6' : '#27354d',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onExportExcel}
            className="btn-success"
            style={{ padding: '7px 14px', fontSize: '12.5px' }}
          >
            <Download size={14} /> Pályázati Excel Letöltése
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '12.5px' }}
          >
            <Plus size={14} /> Új Költségvetési Tétel
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
              <th>Szállító / Partner</th>
              <th>Bizonylatszám</th>
              <th>Státusz</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Nem található költségtétel a keresési feltételekkel.
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} onClick={() => handleOpenEdit(b)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '700', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {b.code}
                  </td>
                  <td>
                    <span className="badge badge-gray">{b.category}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: '#f8fafc', maxWidth: '280px' }}>
                    {b.name}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {b.qty} {b.unit}
                  </td>
                  <td style={{ textAlign: 'right', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                    {b.unitPrice.toLocaleString()} Ft
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap' }}>
                    {(b.qty * b.unitPrice).toLocaleString()} Ft
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                    {b.grant.toLocaleString()} Ft
                  </td>
                  <td style={{ textAlign: 'right', color: '#fbbf24', whiteSpace: 'nowrap' }}>
                    {b.own.toLocaleString()} Ft
                  </td>
                  <td style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    {b.supplier}
                  </td>
                  <td style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
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
                      style={{ color: '#38bdf8', padding: '4px 6px' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(b.id, b.code, b.name); }}
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
                {isNew ? 'Új Pályázati Költségvetési Tétel' : `${selectedItem.code} — Költségtétel`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Tétel Kód</label>
                    <input name="code" defaultValue={selectedItem.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Költségvetési Főkategória</label>
                    <select name="category" defaultValue={selectedItem.category} style={{ width: '100%' }}>
                      {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Tétel Pontos Megnevezése</label>
                  <input name="name" defaultValue={selectedItem.name} required style={{ width: '100%' }} />
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Mennyiség</label>
                    <input type="number" name="qty" defaultValue={selectedItem.qty} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Egység</label>
                    <input name="unit" defaultValue={selectedItem.unit} placeholder="db, csomag..." style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Egységár (Bruttó Ft)</label>
                    <input type="number" name="unitPrice" defaultValue={selectedItem.unitPrice} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Pályázatból Igényelt (Ft)</label>
                    <input type="number" name="grant" defaultValue={selectedItem.grant} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>KTSZE Önrész (Ft)</label>
                    <input type="number" name="own" defaultValue={selectedItem.own} style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Szállító / Partner</label>
                    <input name="supplier" defaultValue={selectedItem.supplier} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Számlaszám / Bizonylat</label>
                    <input name="invoice" defaultValue={selectedItem.invoice} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>Státusz</label>
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
