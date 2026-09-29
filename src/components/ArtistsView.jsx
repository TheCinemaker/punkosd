import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, Mail, FileText, CheckCircle2, DollarSign, Utensils, Hotel, Car, X, Tag } from 'lucide-react';
import { telHref, hasRider as artistHasRider } from '../lib/artists';
import { docUrl } from '../lib/files';
import { uid } from '../lib/store';
import { DocSlot } from './DocSlot';

export function ArtistsView({ artists, onUpdateArtists, onAddLog, currentUser, searchQuery }) {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filteredArtists = artists.filter(a => {
    return !searchQuery ||
      (a.name && a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.contact && a.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.phone && a.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.diet && a.diet.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const totalFeeHuf = artists.reduce((sum, a) => sum + (a.fee || 0), 0);

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedArtist({
      id: uid('art'),
      name: '',
      contact: '',
      phone: '+36 ',
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
      name: formData.get('name').trim(),
      contact: formData.get('contact').trim(),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim(),
      fee: Number(formData.get('fee')) || 0,
      feeType: formData.get('feeType'),
      contractStatus: formData.get('contractStatus'),
      paymentStatus: formData.get('paymentStatus'),
      techRider: formData.get('techRider'),
      riderApproved: formData.get('riderApproved') === 'on',
      hospitality: formData.get('hospitality'),
      diet: formData.get('diet'),
      accommodation: formData.get('accommodation'),
      passes: Number(formData.get('passes')) || 1
    };

    if (!updated.name) {
      alert('Kérlek add meg a fellépő vagy zenekar nevét!');
      return;
    }

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
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            Fellépők Törzsadatbázisa & Riderek
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Összesen {artists.length} regisztrált előadó • Összes gázsi: <strong style={{ color: '#0f172a' }}>{totalFeeHuf.toLocaleString()} Ft</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={16} /> Új Fellépő / Zenekar Rögzítése
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
              <th style={{ textAlign: 'right' }}>Gázsi (Ft)</th>
              <th>Számlázási Mód</th>
              <th>Szerződés</th>
              <th>Tech Rider</th>
              <th>Hospitality & Diéta</th>
              <th>Szállás</th>
              <th style={{ textAlign: 'center' }}>VIP Pass</th>
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
                const hasRider = artistHasRider(a);
                const riderUrl = docUrl(a.techRiderDoc);

                return (
                  <tr key={a.id} onClick={() => handleOpenEdit(a)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: '800', color: '#000000', whiteSpace: 'nowrap' }}>
                      {a.name}
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '600' }}>
                      {a.contact}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <div style={{ color: '#1d4ed8', fontWeight: '700' }}><a href={telHref(a.phone) || undefined} onClick={(e) => e.stopPropagation()} className="phone-link">{a.phone}</a></div>
                      <div style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: '500' }}>{a.email}</div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#000000', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {a.fee ? `${a.fee.toLocaleString()} Ft` : '0 Ft'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#0f172a', fontWeight: '600' }}>
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
                      {riderUrl && (
                        <a href={riderUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="phone-link" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                          Rider megnyitása
                        </a>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                      <div style={{ color: '#0f172a', fontWeight: '500' }}>{a.hospitality}</div>
                      {a.diet && a.diet !== 'Nincs' && (
                        <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: '700' }}>Diéta: {a.diet}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#0f172a', fontWeight: '500' }}>
                      {a.accommodation}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '800', color: '#1d4ed8' }}>
                      {a.passes} db
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(a); }}
                        title="Szerkesztés"
                        style={{ color: '#2563eb', padding: '4px 6px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id, a.name); }}
                        title="Törlés"
                        style={{ color: '#dc2626', padding: '4px 6px', marginLeft: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: New / Edit Performer */}
      {isModalOpen && selectedArtist && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#2563eb" />
                {isNew ? 'Új Fellépő / Zenekar Felvétele' : `${selectedArtist.name} — Adatlap`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b', padding: '6px', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78vh' }}>
                
                {/* 1. KI LÉP FEL - A LEGFONTOSABB MEZŐ */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1.5px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e40af', marginBottom: '4px' }}>
                    Zenekar / Fellépő Neve (Ki lép fel?) *
                  </label>
                  <input
                    name="name"
                    defaultValue={selectedArtist.name}
                    placeholder="pl. Ocho Macho, Besh o droM, DJ Desert, Bohemian Betyars..."
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      fontSize: '15px',
                      fontWeight: '700',
                      backgroundColor: '#ffffff',
                      borderColor: '#3b82f6',
                      color: '#0f172a'
                    }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#1e40af', marginTop: '3px' }}>
                    Ide írd be az együttes vagy zenész hivatalos nevét!
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      Kapcsolattartó / Menedzser
                    </label>
                    <input name="contact" defaultValue={selectedArtist.contact} placeholder="pl. Kovács Péter" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      Telefonszám
                    </label>
                    <input name="phone" defaultValue={selectedArtist.phone} placeholder="+36 30 123 4567" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      E-mail cím
                    </label>
                    <input name="email" defaultValue={selectedArtist.email} placeholder="booking@zenekar.hu" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      Gázsi / Tiszteletdíj (Ft)
                    </label>
                    <input type="number" name="fee" defaultValue={selectedArtist.fee} style={{ width: '100%', fontWeight: '700' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      VIP / Backstage Behajtó Pass (db)
                    </label>
                    <input type="number" name="passes" defaultValue={selectedArtist.passes} style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="section-box">
                  <h4 className="section-title"><FileText size={16} color="#2563eb" /> Dokumentumok</h4>
                  <div className="grid-3">
                    <DocSlot label="Technikai rider" doc={selectedArtist.techRiderDoc} folder="artists/riders" emptyTone="danger"
                      onChange={(doc) => setSelectedArtist(prev => ({ ...prev, techRiderDoc: doc }))} />
                    <DocSlot label="Szerződés" doc={selectedArtist.contractDoc} folder="artists/contracts"
                      onChange={(doc) => setSelectedArtist(prev => ({ ...prev, contractDoc: doc }))} />
                    <DocSlot label="Stage plot" doc={selectedArtist.stagePlotDoc} folder="artists/stageplots"
                      onChange={(doc) => setSelectedArtist(prev => ({ ...prev, stagePlotDoc: doc }))} />
                  </div>
                  <div className="field-hint">A feltöltött fájl a Mentés gombbal rögzül.</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                    Technical Rider Igények (Csatornák, mikrofonok, áram)
                  </label>
                  <textarea name="techRider" defaultValue={selectedArtist.techRider} rows={3} style={{ width: '100%' }} />
                  <label className="checkbox-row" style={{ marginTop: '8px' }}>
                    <input type="checkbox" name="riderApproved" defaultChecked={Boolean(selectedArtist.riderApproved)} />
                    Rider egyeztetve, jóváhagyva
                  </label>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      Hospitality Rider (Öltöző, ital, snack)
                    </label>
                    <input name="hospitality" defaultValue={selectedArtist.hospitality} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                      Különleges Diéta (Vegán, Gluténmentes stb.)
                    </label>
                    <input name="diet" defaultValue={selectedArtist.diet} placeholder="pl. 1 vegán, 1 laktózérzékeny" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                    Szállás és Parkolás Kőszegen
                  </label>
                  <input name="accommodation" defaultValue={selectedArtist.accommodation} placeholder="pl. Hotel Írottkő 4 db 2 ágyas szoba" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Mégse
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontWeight: '700' }}>
                  {isNew ? 'Fellépő Mentése' : 'Módosítások Mentése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
