import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, Mail, FileText, CheckCircle2, DollarSign, Utensils, Hotel, Car, X } from 'lucide-react';

export function ArtistsView({ artists, onUpdateArtists, onAddLog, currentUser, searchQuery }) {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filteredArtists = artists.filter(a => {
    return !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.diet && a.diet.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const totalFeeHuf = artists.reduce((sum, a) => sum + (a.fee || 0), 0);

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedArtist({
      id: 'art-' + Date.now(),
      name: '',
      contact: '',
      phone: '',
      email: '',
      fee: 0,
      feeType: 'Átutalás / Kft számla',
      contractStatus: 'Tervezet',
      paymentStatus: 'Fizetésre vár',
      techRider: 'Egyeztetés alatt',
      hospitality: 'Ásványvíz, kávé, gyümölcstál',
      diet: 'Nincs',
      accommodation: 'Egyeztetés alatt',
      passes: 2
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (artist) => {
    setIsNew(false);
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedArtist,
      name: formData.get('name'),
      contact: formData.get('contact'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      fee: Number(formData.get('fee')) || 0,
      feeType: formData.get('feeType'),
      contractStatus: formData.get('contractStatus'),
      paymentStatus: formData.get('paymentStatus'),
      techRider: formData.get('techRider'),
      hospitality: formData.get('hospitality'),
      diet: formData.get('diet'),
      accommodation: formData.get('accommodation'),
      passes: Number(formData.get('passes')) || 1
    };

    if (isNew) {
      onUpdateArtists([...artists, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Fellépők Menedzsere',
        description: `Új fellépőt rögzített a törzsadatbázisba: "${updated.name}" (${updated.fee.toLocaleString()} Ft)`
      });
    } else {
      onUpdateArtists(artists.map(a => a.id === updated.id ? updated : a));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Fellépők Menedzsere',
        description: `Módosította a fellépő adatait: "${updated.name}"`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Biztosan törlöd a fellépőt: "${name}"?`)) {
      onUpdateArtists(artists.filter(a => a.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Fellépők Menedzsere',
        description: `Törölte a fellépőt: "${name}"`
      });
    }
  };

  return (
    <div>
      {/* Top Controls & KPI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>
              Fellépők Törzsadatbázisa & Riderek
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Összesen {artists.length} regisztrált előadó • Gázsik: <strong>{totalFeeHuf.toLocaleString()} Ft</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '12.5px' }}
        >
          <Plus size={15} /> Új Fellépő Hozzáadása
        </button>
      </div>

      {/* Artists Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Zenekar / Fellépő</th>
              <th>Kapcsolattartó</th>
              <th>Telefon & Email</th>
              <th>Gázsi (Ft)</th>
              <th>Számlázási Mód</th>
              <th>Szerződés</th>
              <th>Tech Rider</th>
              <th>Hospitality & Diéta</th>
              <th>Szállás</th>
              <th>VIP Pass</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtists.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Nem található fellépő a keresési feltételekkel.
                </td>
              </tr>
            ) : (
              filteredArtists.map(a => {
                const isSigned = a.contractStatus === 'Aláírva';
                const hasRider = a.techRider && a.techRider.includes('Jóváhagyva');

                return (
                  <tr key={a.id} onClick={() => handleOpenEdit(a)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap' }}>
                      {a.name}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {a.contact}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <div style={{ color: '#38bdf8' }}>{a.phone}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{a.email}</div>
                    </td>
                    <td style={{ fontWeight: '700', color: '#fbbf24', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {a.fee ? `${a.fee.toLocaleString()} Ft` : '0 Ft'}
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                      {a.feeType}
                    </td>
                    <td>
                      <span className={`badge ${isSigned ? 'badge-green' : 'badge-amber'}`}>
                        {a.contractStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${hasRider ? 'badge-green' : 'badge-blue'}`}>
                        {hasRider ? 'Rider OK' : a.techRider}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '220px' }}>
                      <div style={{ color: '#cbd5e1' }}>{a.hospitality}</div>
                      {a.diet && a.diet !== 'Nincs' && (
                        <div style={{ fontSize: '11px', color: '#f87171' }}>Diéta: {a.diet}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      {a.accommodation}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#38bdf8' }}>
                      {a.passes} db
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(a); }}
                        title="Szerkesztés"
                        style={{ color: '#38bdf8', padding: '4px 6px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id, a.name); }}
                        title="Törlés"
                        style={{ color: '#f87171', padding: '4px 6px', marginLeft: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && selectedArtist && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>
                {isNew ? 'Új Fellépő Felvétele' : `${selectedArtist.name} — Adatlap`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Zenekar / Előadó Neve
                  </label>
                  <input name="name" defaultValue={selectedArtist.name} placeholder="pl. Ocho Macho" required style={{ width: '100%' }} />
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Kapcsolattartó Neve
                    </label>
                    <input name="contact" defaultValue={selectedArtist.contact} placeholder="Menedzser neve" required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Telefonszám
                    </label>
                    <input name="phone" defaultValue={selectedArtist.phone} placeholder="+36 30..." required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      E-mail cím
                    </label>
                    <input name="email" defaultValue={selectedArtist.email} placeholder="booking@..." required style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Gázsi / Tiszteletdíj (Ft)
                    </label>
                    <input type="number" name="fee" defaultValue={selectedArtist.fee} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Számlázási Mód
                    </label>
                    <select name="feeType" defaultValue={selectedArtist.feeType} style={{ width: '100%' }}>
                      <option value="Átutalás / Kft számla">Átutalás / Kft számla</option>
                      <option value="KATA számla">KATA számla</option>
                      <option value="Egyesületi elszámolás">Egyesületi elszámolás</option>
                      <option value="Készpénz helyszínen">Készpénz helyszínen</option>
                      <option value="Saját fellépés (KTSZE stáb)">Saját fellépés (KTSZE stáb)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Szerződés Státusza
                    </label>
                    <select name="contractStatus" defaultValue={selectedArtist.contractStatus} style={{ width: '100%' }}>
                      <option value="Tervezet">Tervezet</option>
                      <option value="Kiküldve">Kiküldve</option>
                      <option value="Aláírva">Aláírva</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Fizetési Állapot
                    </label>
                    <select name="paymentStatus" defaultValue={selectedArtist.paymentStatus} style={{ width: '100%' }}>
                      <option value="Fizetésre vár">Fizetésre vár</option>
                      <option value="Előleg kifizetve (50%)">Előleg kifizetve (50%)</option>
                      <option value="Helyszínen fizetendő">Helyszínen fizetendő</option>
                      <option value="Teljesen kifizetve">Teljesen kifizetve</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      VIP / Backstage Behajtó Pass (db)
                    </label>
                    <input type="number" name="passes" defaultValue={selectedArtist.passes} style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Technical Rider Igények
                  </label>
                  <textarea name="techRider" defaultValue={selectedArtist.techRider} rows={2} style={{ width: '100%' }} />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Hospitality / Backstage Igény
                    </label>
                    <input name="hospitality" defaultValue={selectedArtist.hospitality} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      Speciális Étrendi Igény (Vegán, Glutén...)
                    </label>
                    <input name="diet" defaultValue={selectedArtist.diet} style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                    Szállás Igény Kőszegen
                  </label>
                  <input name="accommodation" defaultValue={selectedArtist.accommodation} placeholder="pl. 5 szoba a Hotel Írottkőben" style={{ width: '100%' }} />
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
