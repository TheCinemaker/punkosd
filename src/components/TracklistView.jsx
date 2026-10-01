import React, { useState } from 'react';
import { Music, Plus, Edit2, Trash2, CheckCircle2, Clock, X } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';

export function TracklistView({ tracklist, onUpdateTracklist, artists, onAddLog, currentUser, searchQuery }) {
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const filtered = tracklist.filter(t => {
    const matchesArtist = selectedArtist === 'all' || t.artist === selectedArtist;
    const matchesSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.composers.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.lyricists && t.lyricists.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesArtist && matchesSearch;
  });

  const uniqueArtists = Array.from(new Set(tracklist.map(t => t.artist)));

  const handleOpenAdd = () => {
    setIsNew(true);
    setSelectedTrack({
      id: uid('trk'),
      artist: uniqueArtists[0] || artists[0]?.name || '',
      order: tracklist.length + 1,
      title: '',
      composers: '',
      lyricists: '',
      duration: '03:45',
      type: 'Saját szerzemény',
      reported: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track) => {
    setIsNew(false);
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedTrack,
      artist: formData.get('artist'),
      order: numOr(formData.get('order'), 1),
      title: formData.get('title'),
      composers: formData.get('composers'),
      lyricists: formData.get('lyricists'),
      duration: formData.get('duration'),
      type: formData.get('type'),
      reported: formData.get('reported') === 'true'
    };

    if (isNew) {
      onUpdateTracklist([...tracklist, updated]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Artisjus Tracklist',
        description: `Új dalt vett fel az Artisjus listára: ${updated.artist} - "${updated.title}"`
      });
    } else {
      onUpdateTracklist(tracklist.map(t => t.id === updated.id ? updated : t));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Artisjus Tracklist',
        description: `Frissítette a dalt: ${updated.artist} - "${updated.title}"`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Biztosan törlöd a dalt: "${title}"?`)) {
      onUpdateTracklist(tracklist.filter(t => t.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Artisjus Tracklist',
        description: `Törölte a dalt az Artisjus listáról: "${title}"`
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Artisjus Szerzői Jogdíj & Tracklist Menedzser
            </h2>
            <p style={{ fontSize: '12px', color: '#475569' }}>
              Kötelező adatszolgáltatás a pályázathoz és az Artisjus felé ({tracklist.length} dal rögzítve)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            <option value="all">Minden előadó dala</option>
            {uniqueArtists.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} /> Új Dal Rögzítése
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ops-table-container">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Előadó / Zenekar</th>
              <th>Ssz.</th>
              <th>Zenemű / Dal Címe</th>
              <th>Zeneszerző(k) Teljes Neve</th>
              <th>Szövegíró(k) Teljes Neve</th>
              <th>Hossz</th>
              <th>Mű Jellege</th>
              <th>Artisjus Bejelentve</th>
              <th style={{ textAlign: 'right' }}>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                  Nem található zeneszám ezen szűrőkkel.
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} onClick={() => handleOpenEdit(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: '800', color: '#1d4ed8' }}>
                    {t.artist}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                    {t.order}.
                  </td>
                  <td style={{ fontWeight: '700', color: '#000000', fontSize: '13.5px' }}>
                    {t.title}
                  </td>
                  <td style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '500' }}>
                    {t.composers}
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>
                    {t.lyricists || '-'}
                  </td>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#6d28d9', fontWeight: '700' }}>
                      <Clock size={12} /> {t.duration}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{t.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${t.reported ? 'badge-green' : 'badge-amber'}`}>
                      {t.reported ? 'Jelentve' : 'Folyamatban'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(t); }}
                      title="Szerkesztés"
                      style={{ color: '#2563eb', padding: '4px 6px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.title); }}
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
      {isModalOpen && selectedTrack && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {isNew ? 'Új Zenemű Rögzítése (Artisjus)' : `${selectedTrack.title} (${selectedTrack.artist})`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Előadó / Zenekar *</label>
                    <input name="artist" defaultValue={selectedTrack.artist} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Sorszám a műsorban</label>
                    <input type="number" name="order" defaultValue={selectedTrack.order} required style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Dal / Mű Címe *</label>
                  <input name="title" defaultValue={selectedTrack.title} placeholder="pl. Jó nekem" required style={{ width: '100%' }} />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Zeneszerző(k) Teljes Neve *</label>
                    <input name="composers" defaultValue={selectedTrack.composers} placeholder="pl. Kirchknopf Gergő, Csík András" required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Szövegíró(k) Teljes Neve</label>
                    <input name="lyricists" defaultValue={selectedTrack.lyricists} placeholder="pl. Kirchknopf Gergő" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Hossz (perc:mp)</label>
                    <input name="duration" defaultValue={selectedTrack.duration} placeholder="03:45" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Mű Jellege</label>
                    <select name="type" defaultValue={selectedTrack.type} style={{ width: '100%' }}>
                      <option value="Saját szerzemény">Saját szerzemény</option>
                      <option value="Feldolgozás">Feldolgozás</option>
                      <option value="Tradicionális">Tradicionális</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Artisjus Bejelentve?</label>
                    <select name="reported" defaultValue={String(selectedTrack.reported)} style={{ width: '100%' }}>
                      <option value="false">Folyamatban</option>
                      <option value="true">Igen (Bejelentve)</option>
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
