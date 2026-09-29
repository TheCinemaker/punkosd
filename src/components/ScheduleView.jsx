import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Clock, Volume2, UserCheck, AlertCircle, 
  FileText, CheckCircle2, Phone, Mail, Calendar, DollarSign,
  Music, Eye, Radio, X, Download, Upload
} from 'lucide-react';
import { DAYS, STAGES } from '../lib/initialData';

export function ScheduleView({ 
  schedule, 
  onUpdateSchedule, 
  artists, 
  onUpdateArtists, 
  onAddLog, 
  currentUser, 
  searchQuery 
}) {
  const [selectedDay, setSelectedDay] = useState('Péntek');
  const [viewMode, setViewMode] = useState('board');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  const currentDaySchedule = schedule.filter(item => {
    const matchesDay = item.day === selectedDay;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDay && matchesSearch;
  });

  const handleAddNew = (stageId = 'main_stage') => {
    setIsNewItem(true);
    setSelectedItem({
      id: 'sch-' + Date.now(),
      stageId,
      day: selectedDay,
      time: '18:00 - 19:30',
      title: '',
      artist: '',
      genre: 'Világzene',
      soundcheck: '16:30 - 17:15',
      loadIn: '15:00',
      status: 'Visszaigazolva',
      stageManager: currentUser,
      notes: '',
      fee: 0,
      feeType: 'Átutalás / Kft számla',
      contractStatus: 'Tervezet',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      techRiderDoc: null,
      contractDoc: null,
      stagePlotDoc: null,
      hospitality: 'Ásványvíz, kávé, gyümölcstál',
      diet: 'Nincs'
    });
    setIsModalOpen(true);
  };

  const handleOpenItem = (item) => {
    setIsNewItem(false);
    const matchedArtist = artists.find(a => a.name.toLowerCase() === item.artist.toLowerCase());
    
    setSelectedItem({
      ...item,
      fee: item.fee !== undefined ? item.fee : (matchedArtist ? matchedArtist.fee : 0),
      feeType: item.feeType || (matchedArtist ? matchedArtist.feeType : 'Átutalás / Kft számla'),
      contractStatus: item.contractStatus || (matchedArtist ? matchedArtist.contractStatus : 'Aláírva'),
      contactName: item.contactName || (matchedArtist ? matchedArtist.contact : ''),
      contactPhone: item.contactPhone || (matchedArtist ? matchedArtist.phone : ''),
      contactEmail: item.contactEmail || (matchedArtist ? matchedArtist.email : ''),
      techRiderDoc: item.techRiderDoc || (matchedArtist && matchedArtist.techRider ? `${matchedArtist.name}_Technical_Rider.pdf` : null),
      contractDoc: item.contractDoc || (matchedArtist && matchedArtist.contractStatus === 'Aláírva' ? `${matchedArtist.name}_Szerzodes_2026.pdf` : null),
      stagePlotDoc: item.stagePlotDoc || null,
      hospitality: item.hospitality || (matchedArtist ? matchedArtist.hospitality : 'Ásványvíz, kávé'),
      diet: item.diet || (matchedArtist ? matchedArtist.diet : 'Nincs')
    });
    setIsModalOpen(true);
  };

  const handleQuickMoveStage = (item, newStageId) => {
    const oldStage = STAGES.find(s => s.id === item.stageId)?.name || item.stageId;
    const newStage = STAGES.find(s => s.id === newStageId)?.name || newStageId;
    
    const updated = schedule.map(s => s.id === item.id ? { ...s, stageId: newStageId } : s);
    onUpdateSchedule(updated);
    
    onAddLog({
      user: currentUser,
      action: 'UPDATE',
      module: 'Menetrend & Lineup',
      description: `Áthelyezte a fellépőt: "${item.title}" (${oldStage} -> ${newStage})`
    });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const artistName = formData.get('artist') || '';
    const eventTitle = formData.get('title') || artistName || 'Koncert';
    const existingArtist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());

    const updatedItem = {
      ...selectedItem,
      stageId: formData.get('stageId'),
      day: formData.get('day'),
      time: formData.get('time'),
      title: eventTitle,
      artist: artistName,
      genre: formData.get('genre'),
      soundcheck: formData.get('soundcheck'),
      loadIn: formData.get('loadIn'),
      status: formData.get('status'),
      stageManager: formData.get('stageManager'),
      notes: formData.get('notes'),
      fee: Number(formData.get('fee')) || 0,
      feeType: formData.get('feeType'),
      contractStatus: formData.get('contractStatus'),
      contactName: formData.get('contactName'),
      contactPhone: formData.get('contactPhone'),
      contactEmail: formData.get('contactEmail'),
      hospitality: formData.get('hospitality'),
      diet: formData.get('diet'),
      techRiderDoc: selectedItem.techRiderDoc,
      contractDoc: selectedItem.contractDoc,
      stagePlotDoc: selectedItem.stagePlotDoc
    };

    if (isNewItem) {
      onUpdateSchedule([...schedule, updatedItem]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Menetrend & Lineup',
        description: `Új fellépést rögzített (${updatedItem.day}, ${updatedItem.time}): ${updatedItem.artist} - ${updatedItem.title}`
      });
    } else {
      onUpdateSchedule(schedule.map(s => s.id === updatedItem.id ? updatedItem : s));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Menetrend & Lineup',
        description: `Frissítette a program adatlapját: ${updatedItem.artist} (${updatedItem.title})`
      });
    }

    if (!existingArtist && artistName.trim()) {
      const newArtistObj = {
        id: 'art-' + Date.now(),
        name: artistName,
        contact: updatedItem.contactName || currentUser,
        phone: updatedItem.contactPhone || '',
        email: updatedItem.contactEmail || '',
        fee: updatedItem.fee,
        feeType: updatedItem.feeType,
        contractStatus: updatedItem.contractStatus,
        paymentStatus: 'Fizetésre vár',
        techRider: updatedItem.techRiderDoc ? 'Jóváhagyva' : 'Egyeztetés alatt',
        hospitality: updatedItem.hospitality,
        diet: updatedItem.diet,
        accommodation: 'Egyeztetés alatt',
        passes: 3
      };
      onUpdateArtists([...artists, newArtistObj]);
      onAddLog({
        user: currentUser,
        action: 'CREATE',
        module: 'Fellépők Törzsadatbázis',
        description: `Automatikusan felvette a fellépők közé: "${artistName}"`
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Biztosan törölni szeretnéd a(z) "${title}" programot?`)) {
      onUpdateSchedule(schedule.filter(s => s.id !== id));
      onAddLog({
        user: currentUser,
        action: 'DELETE',
        module: 'Menetrend & Lineup',
        description: `Törölte a fellépést: "${title}"`
      });
      setIsModalOpen(false);
    }
  };

  const handleSelectExistingArtist = (artistName) => {
    if (!artistName) return;
    const a = artists.find(item => item.name === artistName);
    if (a) {
      setSelectedItem(prev => ({
        ...prev,
        artist: a.name,
        title: prev.title || `${a.name} Koncert`,
        genre: prev.genre || 'Világzene',
        fee: a.fee || 0,
        feeType: a.feeType || 'Átutalás / Kft számla',
        contractStatus: a.contractStatus || 'Aláírva',
        contactName: a.contact || '',
        contactPhone: a.phone || '',
        contactEmail: a.email || '',
        hospitality: a.hospitality || '',
        diet: a.diet || '',
        techRiderDoc: `${a.name.replace(/\s+/g, '_')}_Technical_Rider.pdf`,
        contractDoc: a.contractStatus === 'Aláírva' ? `${a.name.replace(/\s+/g, '_')}_Szerzodes_2026.pdf` : null
      }));
    }
  };

  const handleSimulatedUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.png,.jpg';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedItem(prev => ({
          ...prev,
          [type]: file.name
        }));
        onAddLog({
          user: currentUser,
          action: 'UPLOAD_DOC',
          module: 'Fellépői Dokumentumok',
          description: `Feltöltötte a dokumentumot (${file.name}) a(z) "${selectedItem.artist || selectedItem.title}" produkcióhoz`
        });
      }
    };
    input.click();
  };

  const handleSimulatedDownload = (fileName) => {
    alert(`Dokumentum letöltése folyamatban: ${fileName}\n(Fájl előkészítve)`);
  };

  return (
    <div>
      {/* Top Bar: Days, View mode, and Add Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Day Selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: selectedDay === day ? '800' : '600',
                backgroundColor: selectedDay === day ? '#2563eb' : '#ffffff',
                color: selectedDay === day ? '#ffffff' : '#0f172a',
                border: '1.5px solid',
                borderColor: selectedDay === day ? '#1d4ed8' : '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* View Switcher & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('board')}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: viewMode === 'board' ? '800' : '600',
                backgroundColor: viewMode === 'board' ? '#2563eb' : 'transparent',
                color: viewMode === 'board' ? '#ffffff' : '#0f172a',
                borderRadius: '4px'
              }}
            >
              Színpad Tábla
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: viewMode === 'list' ? '800' : '600',
                backgroundColor: viewMode === 'list' ? '#2563eb' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#0f172a',
                borderRadius: '4px'
              }}
            >
              Lista Nézet
            </button>
          </div>

          <button
            onClick={() => handleAddNew('main_stage')}
            className="btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <Plus size={16} /> Új Fellépő / Műsor Rögzítése
          </button>
        </div>
      </div>

      {/* Program Highlights Banner for Day */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '8px',
        padding: '12px 18px',
        marginBottom: '16px',
        fontSize: '13.5px',
        color: '#14532d',
        lineHeight: 1.5
      }}>
        {selectedDay === 'Péntek' && (
          <div>
            <strong style={{ color: '#166534' }}>PÉNTEK KIEMELT PROGRAM:</strong> Délután chill afro DJ szettek, este <strong>20:30-tól VÁRDISCO LEGENDS NIGHT</strong> (TornyosiGabi, Kunyik, Magnus, és 23:30-tól <strong>TISZTAFAXXA LIVE</strong> 02:00-ig csendrendeleti felmentéssel!).
          </div>
        )}
        {selectedDay === 'Szombat' && (
          <div>
            <strong style={{ color: '#166534' }}>SZOMBAT KIEMELT PROGRAM:</strong> Napközben tambura & világzene, <strong>21:00-kor OCHO MACHO ÉLŐ NAGYKONCERT</strong> a Nagyszínpadon, a Jurisics téren balkán rézfúvósok!
          </div>
        )}
        {selectedDay === 'Vasárnap' && (
          <div>
            <strong style={{ color: '#166534' }}>VASÁRNAP KIEMELT PROGRAM:</strong> Bohemian Betyars, <strong>20:30-kor SZTÁRFELLÉPŐ (G.w.M / MAJKA)</strong>, utána <strong>OPEN STAGE</strong> (bárki felmehet zenélni)!
          </div>
        )}
        {selectedDay === 'Hétfő' && (
          <div>
            <strong style={{ color: '#166534' }}>HÉTFŐ KIEMELT PROGRAM:</strong> Pünkösdhétfői Fesztivál Gála, Utcazenész verseny díjátadó, és a Parno Graszt nagykoncert a Fő téren!
          </div>
        )}
      </div>

      {/* 1. KANBAN / STAGE BOARD VIEW */}
      {viewMode === 'board' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          {STAGES.map(stage => {
            const stageItems = currentDaySchedule
              .filter(s => s.stageId === stage.id)
              .sort((a, b) => a.time.localeCompare(b.time));

            const isMain = stage.id === 'main_stage';

            return (
              <div
                key={stage.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: isMain ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Stage Column Header */}
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1.5px solid #cbd5e1',
                  backgroundColor: isMain ? '#eff6ff' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '9px 9px 0 0'
                }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: isMain ? '#1e40af' : '#0f172a' }}>
                      {stage.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#334155', fontWeight: '500' }}>{stage.location}</p>
                  </div>
                  <button
                    onClick={() => handleAddNew(stage.id)}
                    title="Új program rögzítése erre a színpadra"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: '800'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Stage Items Cards */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '180px' }}>
                  {stageItems.length === 0 ? (
                    <div style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: '#475569',
                      fontSize: '13px',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc'
                    }}>
                      Nincs betervezett műsor erre a színpadra ezen a napon.
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => handleAddNew(stage.id)}
                          style={{ color: '#2563eb', fontSize: '13px', textDecoration: 'underline', fontWeight: '700' }}
                        >
                          + Új műsor rögzítése
                        </button>
                      </div>
                    </div>
                  ) : (
                    stageItems.map(item => {
                      const isVardisco = item.title.includes('VÁRDISCO') || item.title.includes('TISZTAFAXXA');
                      const matchedArtist = artists.find(a => a.name.toLowerCase() === item.artist.toLowerCase());
                      const hasRider = item.techRiderDoc || (matchedArtist && matchedArtist.techRider);
                      const hasContract = item.contractDoc || (matchedArtist && matchedArtist.contractStatus === 'Aláírva');

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenItem(item)}
                          style={{
                            backgroundColor: '#ffffff',
                            border: isVardisco ? '2px solid #7c3aed' : '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.boxShadow = '0 3px 8px rgba(37, 99, 235, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isVardisco ? '#7c3aed' : '#cbd5e1';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                          }}
                        >
                          {/* Card Top: Time & Status */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{
                              fontWeight: '800',
                              fontSize: '14px',
                              color: '#1d4ed8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <Clock size={15} /> {item.time}
                            </div>
                            <span className={`badge ${item.status === 'Visszaigazolva' || item.status === 'Jóváhagyva' ? 'badge-green' : item.status === 'Egyeztetés alatt' ? 'badge-amber' : 'badge-blue'}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Card Performer & Title */}
                          <div style={{
                            fontWeight: '800',
                            fontSize: '15px',
                            color: '#000000',
                            marginBottom: '2px'
                          }}>
                            {item.artist}
                          </div>
                          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginBottom: '10px' }}>
                            {item.title} • <span style={{ color: '#475569', fontWeight: '500' }}>{item.genre}</span>
                          </div>

                          {/* Soundcheck & Stage Manager */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#1e293b',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '8px',
                            marginTop: '8px'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1e40af', fontWeight: '700' }}>
                              <Volume2 size={13} /> Beállás: {item.soundcheck}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                              <UserCheck size={13} color="#2563eb" /> {item.stageManager}
                            </span>
                          </div>

                          {/* Badges for docs & Quick Move */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed #cbd5e1'
                          }}>
                            <div style={{ display: 'flex', gap: '5px', fontSize: '11px' }}>
                              {hasRider ? (
                                <span className="badge badge-green">Rider OK</span>
                              ) : (
                                <span className="badge badge-rose">Rider nincs</span>
                              )}
                              {hasContract && (
                                <span className="badge badge-blue">Szerződés OK</span>
                              )}
                            </div>

                            {/* Quick Move Dropdown */}
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleQuickMoveStage(item, e.target.value); }}
                              value={item.stageId}
                              title="Gyors áthelyezés másik színpadra"
                              style={{
                                fontSize: '12px',
                                padding: '4px 6px',
                                backgroundColor: '#ffffff',
                                borderColor: '#cbd5e1',
                                color: '#0f172a',
                                fontWeight: '600',
                                width: 'auto'
                              }}
                            >
                              <option disabled value="">Áthelyezés...</option>
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>&rarr; {s.name.split('(')[0]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 2. TABLE / LIST VIEW */
        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Idősáv</th>
                <th>Színpad</th>
                <th>Fellépő / Zenekar</th>
                <th>Produkció Címe</th>
                <th>Stílus</th>
                <th>Beállás</th>
                <th>Dokumentumok</th>
                <th>Felelős</th>
                <th>Státusz</th>
                <th style={{ textAlign: 'right' }}>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {currentDaySchedule.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#475569' }}>
                    Nincs műsor ezen a napon.
                  </td>
                </tr>
              ) : (
                currentDaySchedule.map(item => {
                  const stageObj = STAGES.find(s => s.id === item.stageId);
                  const matchedArtist = artists.find(a => a.name.toLowerCase() === item.artist.toLowerCase());
                  const hasRider = item.techRiderDoc || (matchedArtist && matchedArtist.techRider);
                  const hasContract = item.contractDoc || (matchedArtist && matchedArtist.contractStatus === 'Aláírva');

                  return (
                    <tr key={item.id} onClick={() => handleOpenItem(item)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: '800', color: '#1d4ed8', whiteSpace: 'nowrap' }}>
                        {item.time}
                      </td>
                      <td>
                        <span className={`badge ${item.stageId === 'main_stage' ? 'badge-blue' : item.stageId === 'small_stage_1' ? 'badge-amber' : item.stageId === 'small_stage_2' ? 'badge-green' : 'badge-gray'}`}>
                          {stageObj ? stageObj.name.split('(')[0] : item.stageId}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: '#000000', fontSize: '13.5px' }}>
                        {item.artist}
                      </td>
                      <td style={{ color: '#1e293b', fontWeight: '600' }}>
                        {item.title}
                      </td>
                      <td style={{ fontSize: '13px', color: '#334155' }}>
                        {item.genre}
                      </td>
                      <td style={{ fontSize: '13px', color: '#1e40af', fontWeight: '700' }}>
                        {item.soundcheck}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <span className={`badge ${hasRider ? 'badge-green' : 'badge-rose'}`}>
                            {hasRider ? 'Rider OK' : 'Rider nincs'}
                          </span>
                          {hasContract && <span className="badge badge-blue">Szerz. OK</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>
                        {item.stageManager}
                      </td>
                      <td>
                        <span className={`badge ${item.status === 'Visszaigazolva' || item.status === 'Jóváhagyva' ? 'badge-green' : 'badge-amber'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenItem(item); }}
                          title="Részletek & Doksik"
                          style={{ color: '#2563eb', padding: '4px 6px' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
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
      )}

      {/* 3. MASTER PROGRAM & ARTIST INSPECTOR MODAL WITH DOCS */}
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={22} color="#2563eb" />
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {isNewItem ? 'Új Fellépés / Műsor Rögzítése' : `${selectedItem.artist || selectedItem.title} - Adatlap`}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#334155' }}>
                    Fellépő neve, időpont, helyszín, gázsi és dokumentumok
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh' }}>
                
                {/* 1. KI LÉP FEL? HIGHLIGHTED PROMINENT SECTION */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '14px 16px'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
                      ⭐ Fellépő / Zenekar Neve (Ki lép fel?) *
                    </label>
                    <input
                      name="artist"
                      defaultValue={selectedItem.artist}
                      placeholder="Írd be a zenekar vagy előadó nevét (pl. Ocho Macho, Bohemian Betyars, TornyosiGabi...)"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#000000',
                        border: '2px solid #2563eb',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>

                  {/* Quick Artist Picker from Existing Roster */}
                  <div style={{ borderTop: '1px dashed #93c5fd', paddingTop: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                      VAGY válassz egy már felvitt zenekart a listából:
                    </label>
                    <select
                      onChange={(e) => handleSelectExistingArtist(e.target.value)}
                      style={{ width: '100%', fontSize: '13px', backgroundColor: '#ffffff', color: '#0f172a' }}
                    >
                      <option value="">-- Meglévő zenekar kiválasztása --</option>
                      {artists.map(a => (
                        <option key={a.id} value={a.name}>
                          {a.name} ({a.fee ? `${a.fee.toLocaleString()} Ft` : 'Gázsi nincs megadva'} • {a.contractStatus})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Program Title and Genre */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Produkció / Műsor Címe (Opcionális)
                    </label>
                    <input
                      name="title"
                      defaultValue={selectedItem.title}
                      placeholder="pl. Ocho Macho Élőkoncert (üresen hagyva a zenekar neve lesz)"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Zenei Műfaj / Stílus
                    </label>
                    <input
                      name="genre"
                      defaultValue={selectedItem.genre}
                      placeholder="pl. Világzene, Reggae, Népzene, Utcazene..."
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Section 3: Basic Stage, Day and Status */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Színpad (Helyszín)
                    </label>
                    <select name="stageId" defaultValue={selectedItem.stageId} style={{ width: '100%' }}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Fesztivál Napja
                    </label>
                    <select name="day" defaultValue={selectedItem.day} style={{ width: '100%' }}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Státusz
                    </label>
                    <select name="status" defaultValue={selectedItem.status} style={{ width: '100%' }}>
                      <option value="Tervezett">Tervezett</option>
                      <option value="Egyeztetés alatt">Egyeztetés alatt</option>
                      <option value="Visszaigazolva">Visszaigazolva</option>
                      <option value="Jóváhagyva">Jóváhagyva</option>
                    </select>
                  </div>
                </div>

                {/* Section 4: Timing (Timeup) */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Koncert Idősáv (Kezdés - Vég)
                    </label>
                    <input name="time" defaultValue={selectedItem.time} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Beállás (Soundcheck időpont)
                    </label>
                    <input name="soundcheck" defaultValue={selectedItem.soundcheck} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Érkezés (Load-in)
                    </label>
                    <input name="loadIn" defaultValue={selectedItem.loadIn} style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 5: DOCUMENTS SECTION (Tech Rider & Contract & Stage Plot) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#2563eb" /> Dokumentumok & Csatolmányok (Rider, Szerződés, Stage Plot)
                  </h4>
                  <div className="grid-3">
                    {/* Tech Rider */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                        Technical Rider
                      </div>
                      {selectedItem.techRiderDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '700' }}>
                            {selectedItem.techRiderDoc}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload(selectedItem.techRiderDoc)}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Download size={13} /> Letöltés
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '8px', fontWeight: '600' }}>
                            Még nincs feltöltve
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedUpload('techRiderDoc')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Upload size={13} /> PDF Feltöltése
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Contract */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                        Szerződés (PDF)
                      </div>
                      {selectedItem.contractDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '700' }}>
                            {selectedItem.contractDoc}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload(selectedItem.contractDoc)}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Download size={13} /> Letöltés
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                            Nincs csatolva
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedUpload('contractDoc')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Upload size={13} /> Feltöltés
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage Plot */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                        Stage Plot (Színpadrajz)
                      </div>
                      {selectedItem.stagePlotDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '700' }}>
                            {selectedItem.stagePlotDoc}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload(selectedItem.stagePlotDoc)}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Download size={13} /> Letöltés
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                            Nincs külön rajz
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSimulatedUpload('stagePlotDoc')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                          >
                            <Upload size={13} /> Rajz Csatolása
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 6: Financials & Contracts */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Tiszteletdíj / Gázsi (Ft)
                    </label>
                    <input
                      type="number"
                      name="fee"
                      defaultValue={selectedItem.fee}
                      placeholder="pl. 1500000"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Számlázási Mód
                    </label>
                    <select name="feeType" defaultValue={selectedItem.feeType} style={{ width: '100%' }}>
                      <option value="Átutalás / Kft számla">Átutalás / Kft számla</option>
                      <option value="KATA számla">KATA számla</option>
                      <option value="Egyesületi elszámolás">Egyesületi elszámolás</option>
                      <option value="Készpénz helyszínen">Készpénz helyszínen</option>
                      <option value="Saját fellépés (KTSZE stáb)">Saját fellépés (KTSZE stáb)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Szerződés Státusz
                    </label>
                    <select name="contractStatus" defaultValue={selectedItem.contractStatus} style={{ width: '100%' }}>
                      <option value="Tervezet">Tervezet</option>
                      <option value="Kiküldve">Kiküldve</option>
                      <option value="Aláírva">Aláírva</option>
                    </select>
                  </div>
                </div>

                {/* Section 7: Contacts */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Kapcsolattartó Neve
                    </label>
                    <input name="contactName" defaultValue={selectedItem.contactName} placeholder="Menedzser / Tour mgr" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Telefonszám
                    </label>
                    <input name="contactPhone" defaultValue={selectedItem.contactPhone} placeholder="+36 30..." style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      E-mail cím
                    </label>
                    <input name="contactEmail" defaultValue={selectedItem.contactEmail} placeholder="booking@..." style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 8: Hospitality & Diet */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Hospitality / Backstage Ellátás
                    </label>
                    <input name="hospitality" defaultValue={selectedItem.hospitality} placeholder="pl. 8 fő melegétel, víz, kávé" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Speciális Étrendi Igény (Diéta)
                    </label>
                    <input name="diet" defaultValue={selectedItem.diet} placeholder="pl. 2 vegetáriánus, 1 gluténmentes" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 9: Stage Manager & Notes */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Felelős (Stage Manager)
                    </label>
                    <input name="stageManager" defaultValue={selectedItem.stageManager} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                      Műszaki & Színpadi Megjegyzés
                    </label>
                    <input name="notes" defaultValue={selectedItem.notes} placeholder="Mikrofonok, kordonok, füst..." style={{ width: '100%' }} />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {!isNewItem && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedItem.id, selectedItem.title)}
                      style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} /> Műsor Törlése
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
