import React, { useState } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, Phone, Mail, FileText, 
  CheckCircle2, DollarSign, X
} from 'lucide-react';
import { uid } from '../lib/store';
import { DocSlot } from './DocSlot';
import { docName } from '../lib/files';
import { telHref } from '../lib/artists';

export function ContractorsView({ contractors, onUpdateContractors, onAddLog, currentUser, searchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const categories = [
    'Összes szolgáltató',
    'Színpad- és Hangtechnika',
    'Kukás & Hulladékkezelés',
    'Villanyszerelő & E.ON',
    'Mentőszolgálat & Egészségügy',
    'Biztonsági Szolgálat & Őrzés',
    'Mobil WC & Higiénia',
    'Aggregátor & Tartalék Áram',
    'Nyomda & Reklámfelület',
    'Kordonok & Sátorbérlés',
    'Felelősségbiztosítás'
  ];

  // Filtering
  const filtered = contractors.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // KPI Calculations
  const totalContractedHuf = contractors.reduce((sum, c) => sum + (c.feeHuf || 0), 0);
  const signedCount = contractors.filter(c => c.contractStatus === 'Aláírva').length;
  const pendingCount = contractors.filter(c => c.contractStatus !== 'Aláírva').length;

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedContractor({
      id: uid('cnt'),
      code: `SZOLG-0${contractors.length + 1}`,
      companyName: '',
      category: 'Színpad- és Hangtechnika',
      service: '',
      contactName: '',
      phone: '',
      email: '',
      feeHuf: 0,
      contractStatus: 'Tárgyalás alatt',
      paymentStatus: 'Fizetésre vár',
      invoiceNumber: '-',
      contractDoc: null,
      quoteDoc: null,
      completionDoc: null,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contractor) => {
    setIsNew(false);
    setSelectedContractor(contractor);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedContractor,
      code: formData.get('code') || selectedContractor.code,
      companyName: formData.get('companyName'),
      category: formData.get('category'),
      service: formData.get('service'),
      contactName: formData.get('contactName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      feeHuf: Number(formData.get('feeHuf')) || 0,
      contractStatus: formData.get('contractStatus'),
      paymentStatus: formData.get('paymentStatus'),
      invoiceNumber: formData.get('invoiceNumber'),
      notes: formData.get('notes'),
      contractDoc: selectedContractor.contractDoc,
      quoteDoc: selectedContractor.quoteDoc,
      completionDoc: selectedContractor.completionDoc
    };

    if (isNew) {
      onUpdateContractors([...contractors, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Szerződött Szolgáltatók',
        description: `Új alvállalkozót rögzített: ${updated.companyName} (${updated.category})`
      });
    } else {
      onUpdateContractors(contractors.map(c => c.id === updated.id ? updated : c));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Szerződött Szolgáltatók',
        description: `Módosította a szolgáltatót: ${updated.companyName} (${updated.feeHuf.toLocaleString()} Ft)`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Biztosan törölni szeretnéd a(z) "${name}" partnert a nyilvántartásból?`)) {
      onUpdateContractors(contractors.filter(c => c.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Szerződött Szolgáltatók',
        description: `Törölte a szolgáltatót: ${name}`
      });
      setIsModalOpen(false);
    }
  };

  const handleDocUploaded = (label) => (doc) => {
    onAddLog({
      user: currentUser,
      action: 'UPLOAD_DOC',
      module: 'Szolgáltatói Dokumentumok',
      description: `Feltöltötte: ${label} (${doc.name}) — "${selectedContractor.companyName || 'új partner'}"`
    });
  };

  const setDoc = (field) => (doc) => setSelectedContractor(prev => ({ ...prev, [field]: doc }));

  return (
    <div>
      {/* KPI Cards Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={15} color="#2563eb" /> Szerződött Szolgáltatók
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
            {contractors.length} cég / partner
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Technika, hulladék, villany, mentő, őrzés, WC
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={15} color="#b45309" /> Alvállalkozói Keretösszeg
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
            {totalContractedHuf.toLocaleString()} Ft
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            Összes leszerződött és tervezett költség
          </div>
        </div>

        <div className="ops-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
          <div style={{ fontSize: '11.5px', color: '#14532d', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} color="#059669" /> Szerződések Állapota
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
            {signedCount} aláírva <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '700' }}>({pendingCount} folyamatban)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>
            PDF csatolmányok rendelkezésre állása
          </div>
        </div>
      </div>

      {/* Filter and Add Button Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '85%', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isAll = cat === 'Összes szolgáltató';
            const isActive = isAll ? selectedCategory === 'all' : selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isAll ? 'all' : cat)}
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
          <Plus size={16} /> Új Szolgáltató
        </button>
      </div>

      {/* Contractors Table / List */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Azonosító</th>
              <th>Cég / Vállalkozó Neve</th>
              <th>Szakterület / Kategória</th>
              <th>Megrendelt Szolgáltatás</th>
              <th>Kapcsolattartó</th>
              <th>Összeg (Ft)</th>
              <th>Szerződés Státusz</th>
              <th>Fizetés</th>
              <th>Dokumentumok</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található szolgáltató ezen feltételekkel.
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const isSigned = c.contractStatus === 'Aláírva';
                const hasContract = Boolean(c.contractDoc);
                const hasQuote = Boolean(c.quoteDoc);
                const hasInvoice = Boolean(c.completionDoc);

                return (
                  <tr key={c.id} onClick={() => handleOpenEdit(c)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: '800', color: '#1d4ed8', fontFamily: 'JetBrains Mono', fontSize: '12.5px' }}>
                      {c.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#000000', fontSize: '13.5px' }}>
                        {c.companyName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569' }}>
                        Szla: {c.invoiceNumber}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{c.category}</span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#1e293b', maxWidth: '280px', fontWeight: '500' }}>
                      {c.service}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#0f172a' }}>
                        {c.contactName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#1d4ed8', fontWeight: '600' }}>
                        {telHref(c.phone) && <a href={telHref(c.phone)} onClick={(e) => e.stopPropagation()} className="call-icon" title="Hívás" aria-label="Hívás"><Phone size={14} /></a>}<a href={telHref(c.phone) || undefined} onClick={(e) => e.stopPropagation()} className="phone-link">{c.phone}</a>
                      </div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#b45309', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {c.feeHuf ? `${c.feeHuf.toLocaleString()} Ft` : '-'}
                    </td>
                    <td>
                      <span className={`badge ${isSigned ? 'badge-green' : 'badge-amber'}`}>
                        {c.contractStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.paymentStatus.includes('Kifizetve') || c.paymentStatus.includes('Előleg') ? 'badge-blue' : 'badge-gray'}`}>
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {hasContract ? (
                          <span className="badge badge-green" title={docName(c.contractDoc)}>Szerződés</span>
                        ) : (
                          <span className="badge badge-rose" title="Szerződés még nincs csatolva">Nincs szerz.</span>
                        )}
                        {hasQuote && <span className="badge badge-blue" title={docName(c.quoteDoc)}>Ajánlat</span>}
                        {hasInvoice && <span className="badge badge-amber" title={docName(c.completionDoc)}>Számla</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(c); }}
                        title="Adatlap & Doksik szerkesztése"
                        style={{ color: '#2563eb', padding: '4px 6px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.companyName); }}
                        title="Törlés"
                        style={{ color: '#dc2626', padding: '4px 6px', marginLeft: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail & Document Inspector Modal */}
      {isModalOpen && selectedContractor && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#2563eb" />
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {isNew ? 'Új Szerződött Szolgáltató Felvétele' : `${selectedContractor.companyName} — Adatlap & Doksik`}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#475569' }}>
                    Szolgáltatási leírás, árak, számlaszám és csatolmányok
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh' }}>
                
                {/* Row 1: Code, Company, Category */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Azonosító Kód
                    </label>
                    <input name="code" defaultValue={selectedContractor.code} required style={{ width: '100%', fontFamily: 'JetBrains Mono' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Cég / Vállalkozás Neve *
                    </label>
                    <input name="companyName" defaultValue={selectedContractor.companyName} placeholder="pl. Stage Pro Hungary Kft." required style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Row 2: Category and Service description */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szakterület / Kategória
                    </label>
                    <select name="category" defaultValue={selectedContractor.category} style={{ width: '100%' }}>
                      {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Megrendelt Szolgáltatás / Munkakör *
                    </label>
                    <input name="service" defaultValue={selectedContractor.service} placeholder="pl. 10x8m fedett nagyszínpad és hangtechnika" required style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Row 3: Contacts */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kapcsolattartó Neve
                    </label>
                    <input name="contactName" defaultValue={selectedContractor.contactName} placeholder="pl. Kovács Péter" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Telefonszám
                    </label>
                    <input name="phone" defaultValue={selectedContractor.phone} placeholder="+36 30 123 4567" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      E-mail cím
                    </label>
                    <input name="email" defaultValue={selectedContractor.email} placeholder="iroda@partner.hu" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Row 4: Financials */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szerződéses Összeg (Bruttó Ft)
                    </label>
                    <input type="number" name="feeHuf" defaultValue={selectedContractor.feeHuf} placeholder="pl. 3900000" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szerződés Státusza
                    </label>
                    <select name="contractStatus" defaultValue={selectedContractor.contractStatus} style={{ width: '100%' }}>
                      <option value="Tárgyalás alatt">Tárgyalás alatt</option>
                      <option value="Kiküldve">Kiküldve</option>
                      <option value="Aláírva">Aláírva</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Fizetési Állapot
                    </label>
                    <select name="paymentStatus" defaultValue={selectedContractor.paymentStatus} style={{ width: '100%' }}>
                      <option value="Fizetésre vár">Fizetésre vár</option>
                      <option value="Előleg kifizetve (30%)">Előleg kifizetve (30%)</option>
                      <option value="Előleg kifizetve (50%)">Előleg kifizetve (50%)</option>
                      <option value="Kifizetve">Kifizetve</option>
                    </select>
                  </div>
                </div>

                {/* DOCUMENT MANAGEMENT SECTION (Contract, Quote, Completion) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#2563eb" /> Szerződés és Számla Dokumentumtár
                  </h4>

                  <div className="grid-3">
                    <DocSlot label="Hivatalos szerződés" doc={selectedContractor.contractDoc} folder="contractors/contracts"
                      emptyTone="danger" onChange={setDoc('contractDoc')} onUploaded={handleDocUploaded('szerződés')} />
                    <DocSlot label="Árajánlat / műszaki terv" doc={selectedContractor.quoteDoc} folder="contractors/quotes"
                      emptyText="Nincs csatolva" onChange={setDoc('quoteDoc')} onUploaded={handleDocUploaded('árajánlat')} />
                    <DocSlot label="Számla / teljesítésigazolás" doc={selectedContractor.completionDoc} folder="contractors/invoices"
                      emptyText="Még nem érkezett be" onChange={setDoc('completionDoc')} onUploaded={handleDocUploaded('számla')} />
                  </div>
                  <div className="field-hint">A feltöltött fájl a Mentés gombbal rögzül.</div>
                </div>

                {/* Notes and Invoicing number */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Bizonylatszám / Számlaszám
                    </label>
                    <input name="invoiceNumber" defaultValue={selectedContractor.invoiceNumber} placeholder="pl. SPH-2026/041" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Helyszíni Időpont / Telepítési Megjegyzés
                    </label>
                    <input name="notes" defaultValue={selectedContractor.notes} placeholder="pl. Építés: Csütörtök 08:00 Fő tér" style={{ width: '100%' }} />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {!isNew && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedContractor.id, selectedContractor.companyName)}
                      style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} /> Partner Törlése
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    Mégse
                  </button>
                  <button type="submit" className="btn-primary">
                    <CheckCircle2 size={16} /> Mentés & Rögzítés
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
