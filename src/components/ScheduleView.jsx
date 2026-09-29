import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Clock, Volume2, UserCheck, AlertCircle, 
  Sparkles, FileText, ArrowRightLeft, Download, Upload, CheckCircle2, 
  Phone, Mail, Calendar, DollarSign, Utensils, Music, ShieldCheck, Eye,
  Radio, Compass, FileCheck, Layers, X
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
    const artistName = formData.get('artist');
    const existingArtist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());

    const updatedItem = {
      ...selectedItem,
      stageId: formData.get('stageId'),
      day: formData.get('day'),
      time: formData.get('time'),
      title: formData.get('title'),
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
        description: `Új fellépést rögzített (${updatedItem.day}, ${updatedItem.time}): ${updatedItem.title} - ${updatedItem.artist}`
      });
    } else {
      onUpdateSchedule(schedule.map(s => s.id === updatedItem.id ? updatedItem : s));
      onAddLog({
        user: currentUser,
        action: 'UPDATE',
        module: 'Menetrend & Lineup',
        description: `Frissítette a program adatlapját: ${updatedItem.title} (${updatedItem.artist})`
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
    alert(`Dokumentum letöltése folyamatban: ${fileName}\n(Fájl sikeresen előkészítve a helyi gépre mentéshez)`);
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
        <div style={{ display: 'flex', gap: '6px' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: selectedDay === day ? '800' : '600',
                backgroundColor: selectedDay === day ? '#2563eb' : '#1e293b',
                color: '#ffffff',
                border: '1.5px solid',
                borderColor: selectedDay === day ? '#3b82f6' : '#334155',
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
            backgroundColor: '#172033',
            border: '1.5px solid #334155',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('board')}
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: viewMode === 'board' ? '800' : '600',
                backgroundColor: viewMode === 'board' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                borderRadius: '4px'
              }}
            >
              Színpad Tábla
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: viewMode === 'list' ? '800' : '600',
                backgroundColor: viewMode === 'list' ? '#2563eb' : 'transparent',
                color: '#ffffff',
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
            <Plus size={16} /> Új Műsor / Fellépő
          </button>
        </div>
      </div>

      {/* Program Highlights Banner for Day */}
      <div style={{
        backgroundColor: '#172033',
        border: '1.5px solid #3b82f6',
        borderRadius: '8px',
        padding: '12px 18px',
        marginBottom: '16px',
        fontSize: '13.5px',
        color: '#ffffff',
        lineHeight: 1.5
      }}>
        {selectedDay === 'Péntek' && (
          <div>
            <strong style={{ color: '#60a5fa' }}>PÉNTEK KIEMELT PROGRAM:</strong> Délután chill afro DJ szettek, este <strong>20:30-tól VÁRDISCO LEGENDS NIGHT</strong> (TornyosiGabi, Kunyik, Magnus, és 23:30-tól <strong>TISZTAFAXXA LIVE</strong> 02:00-ig csendrendeleti felmentéssel!).
          </div>
        )}
        {selectedDay === 'Szombat' && (
          <div>
            <strong style={{ color: '#fbbf24' }}>SZOMBAT KIEMELT PROGRAM:</strong> Napközben tambura & világzene, <strong>21:00-kor OCHO MACHO ÉLŐ NAGYKONCERT</strong> a Nagyszínpadon, a Jurisics téren balkán rézfúvósok!
          </div>
        )}
        {selectedDay === 'Vasárnap' && (
          <div>
            <strong style={{ color: '#38bdf8' }}>VASÁRNAP KIEMELT PROGRAM:</strong> Bohemian Betyars, <strong>20:30-kor SZTÁRFELLÉPŐ (G.w.M / MAJKA)</strong>, utána <strong>OPEN STAGE</strong> (bárki felmehet zenélni)!
          </div>
        )}
        {selectedDay === 'Hétfő' && (
          <div>
            <strong style={{ color: '#34d399' }}>HÉTFŐ KIEMELT PROGRAM:</strong> Pünkösdhétfői Fesztivál Gála, Utcazenész verseny díjátadó, és a Parno Graszt nagykoncert a Fő téren!
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
                  backgroundColor: '#111827',
                  border: isMain ? '2px solid #2563eb' : '1.5px solid #334155',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Stage Column Header */}
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1.5px solid #334155',
                  backgroundColor: '#172033',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '9px 9px 0 0'
                }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                      {stage.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#cbd5e1' }}>{stage.location}</p>
                  </div>
                  <button
                    onClick={() => handleAddNew(stage.id)}
                    title="Új program ezen a színpadon"
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid #475569',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Stage Items Cards */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '180px' }}>
                  {stageItems.length === 0 ? (
                    <div style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '13px',
                      border: '1.5px dashed #334155',
                      borderRadius: '8px'
                    }}>
                      Nincs betervezett műsor erre a színpadra ezen a napon.
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => handleAddNew(stage.id)}
                          style={{ color: '#38bdf8', fontSize: '12.5px', textDecoration: 'underline', fontWeight: '700' }}
                        >
                          + Program hozzáadása
                        </button>
                      </div>
                    </div>
                  ) : (
                    stageItems.map(item => {
                      const isVardisco = item.title.includes('VÁRDISCO') || item.title.includes('TISZTAFAXXA');
                      const isOcho = item.title.includes('OCHO MACHO');
                      const matchedArtist = artists.find(a => a.name.toLowerCase() === item.artist.toLowerCase());
                      const hasRider = item.techRiderDoc || (matchedArtist && matchedArtist.techRider);
                      const hasContract = item.contractDoc || (matchedArtist && matchedArtist.contractStatus === 'Aláírva');

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenItem(item)}
                          style={{
                            backgroundColor: isVardisco ? '#1e1b4b' : isOcho ? '#3b2506' : '#172033',
                            border: isVardisco ? '2px solid #8b5cf6' : isOcho ? '2px solid #f59e0b' : '1.5px solid #334155',
                            borderRadius: '8px',
                            padding: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = isVardisco ? '#8b5cf6' : isOcho ? '#f59e0b' : '#334155'}
                        >
                          {/* Card Top: Time & Status */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{
                              fontWeight: '800',
                              fontSize: '13.5px',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <Clock size={14} /> {item.time}
                            </div>
                            <span className={`badge ${item.status === 'Visszaigazolva' || item.status === 'Jóváhagyva' ? 'badge-green' : item.status === 'Egyeztetés alatt' ? 'badge-amber' : 'badge-blue'}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Card Title & Artist */}
                          <div style={{
                            fontWeight: '800',
                            fontSize: '14.5px',
                            color: isVardisco ? '#c084fc' : isOcho ? '#fbbf24' : '#ffffff',
                            marginBottom: '4px'
                          }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '13px', color: '#f1f5f9', marginBottom: '10px' }}>
                            {item.artist} • <span style={{ color: '#cbd5e1' }}>{item.genre}</span>
                          </div>

                          {/* Soundcheck & Stage Manager */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#cbd5e1',
                            borderTop: '1px solid #334155',
                            paddingTop: '8px',
                            marginTop: '8px'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#93c5fd', fontWeight: '700' }}>
                              <Volume2 size={13} /> Beállás: {item.soundcheck}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={13} color="#60a5fa" /> {item.stageManager}
                            </span>
                          </div>

                          {/* Badges for docs & Quick Move */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed #334155'
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
                                fontSize: '11px',
                                padding: '3px 6px',
                                backgroundColor: '#0a0f1d',
                                borderColor: '#334155',
                                color: '#ffffff'
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
                <th>Produkció Címe</th>
                <th>Fellépő</th>
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
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
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
                      <td style={{ fontWeight: '800', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                        {item.time}
                      </td>
                      <td>
                        <span className={`badge ${item.stageId === 'main_stage' ? 'badge-blue' : item.stageId === 'small_stage_1' ? 'badge-amber' : item.stageId === 'small_stage_2' ? 'badge-green' : 'badge-gray'}`}>
                          {stageObj ? stageObj.name.split('(')[0] : item.stageId}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: '#ffffff' }}>
                        {item.title}
                      </td>
                      <td style={{ color: '#ffffff', fontWeight: '600' }}>
                        {item.artist}
                      </td>
                      <td style={{ fontSize: '13px', color: '#cbd5e1' }}>
                        {item.genre}
                      </td>
                      <td style={{ fontSize: '13px', color: '#93c5fd', fontWeight: '700' }}>
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
                      <td style={{ fontSize: '13px', color: '#ffffff' }}>
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
                          style={{ color: '#38bdf8', padding: '4px 6px' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
                          title="Törlés"
                          style={{ color: '#f87171', padding: '4px 6px', marginLeft: '4px' }}
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
                <Radio size={22} color="#3b82f6" />
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                    {isNewItem ? 'Új Fellépés / Program Rögzítése' : selectedItem.title || 'Műsor és Fellépő Adatlap'}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    Adatlap, gázsi, rider, szerződés és színpadi áthelyezés
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh' }}>
                
                {/* Quick Artist Picker from Existing Roster */}
                <div style={{
                  backgroundColor: '#172033',
                  border: '1.5px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '14px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: '#93c5fd' }}>
                      Gyorsválasztó létező fellépőből (Automatikus kitöltés):
                    </label>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      Bármelyik zenekar bármelyik színpadra betehető
                    </span>
                  </div>
                  <select
                    onChange={(e) => handleSelectExistingArtist(e.target.value)}
                    style={{ width: '100%', fontSize: '13.5px', backgroundColor: '#0a0f1d' }}
                  >
                    <option value="">-- Válassz egy már felvitt fellépőt a listából --</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.fee ? `${a.fee.toLocaleString()} Ft` : 'Gázsi nincs megadva'} • {a.contractStatus})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section 1: Basic Stage, Day and Title */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Színpad (Áthelyezhető!)
                    </label>
                    <select name="stageId" defaultValue={selectedItem.stageId} style={{ width: '100%' }}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Fesztivál Napja
                    </label>
                    <select name="day" defaultValue={selectedItem.day} style={{ width: '100%' }}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
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

                {/* Section 2: Program and Artist Names */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Produkció / Műsor Címe
                    </label>
                    <input
                      name="title"
                      defaultValue={selectedItem.title}
                      placeholder="pl. Ocho Macho Élőkoncert"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Fellépő / Zenekar Neve
                    </label>
                    <input
                      name="artist"
                      defaultValue={selectedItem.artist}
                      placeholder="pl. Ocho Macho"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Section 3: Timing (Timeup) */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Koncert Idősáv (Kezdés - Vég)
                    </label>
                    <input name="time" defaultValue={selectedItem.time} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Beállás (Soundcheck időpont)
                    </label>
                    <input name="soundcheck" defaultValue={selectedItem.soundcheck} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Érkezés (Load-in)
                    </label>
                    <input name="loadIn" defaultValue={selectedItem.loadIn} style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 4: DOCUMENTS SECTION (Tech Rider & Contract & Stage Plot) */}
                <div style={{
                  backgroundColor: '#0a0f1d',
                  border: '1.5px solid #334155',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} /> Dokumentumok & Csatolmányok (Rider, Szerződés, Stage Plot)
                  </h4>
                  <div className="grid-3">
                    {/* Tech Rider */}
                    <div style={{ backgroundColor: '#172033', border: '1px solid #334155', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                        Technical Rider
                      </div>
                      {selectedItem.techRiderDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '600' }}>
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
                          <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '8px' }}>
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
                    <div style={{ backgroundColor: '#172033', border: '1px solid #334155', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                        Szerződés (PDF)
                      </div>
                      {selectedItem.contractDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '600' }}>
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
                          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
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
                    <div style={{ backgroundColor: '#172033', border: '1px solid #334155', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                        Stage Plot (Színpadrajz)
                      </div>
                      {selectedItem.stagePlotDoc ? (
                        <div>
                          <div style={{ fontSize: '12px', color: '#34d399', marginBottom: '8px', wordBreak: 'break-all', fontWeight: '600' }}>
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
                          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
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

                {/* Section 5: Financials & Contracts */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Szerződés Státusz
                    </label>
                    <select name="contractStatus" defaultValue={selectedItem.contractStatus} style={{ width: '100%' }}>
                      <option value="Tervezet">Tervezet</option>
                      <option value="Kiküldve">Kiküldve</option>
                      <option value="Aláírva">Aláírva</option>
                    </select>
                  </div>
                </div>

                {/* Section 6: Contacts */}
                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Kapcsolattartó Neve
                    </label>
                    <input name="contactName" defaultValue={selectedItem.contactName} placeholder="Menedzser / Tour mgr" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Telefonszám
                    </label>
                    <input name="contactPhone" defaultValue={selectedItem.contactPhone} placeholder="+36 30..." style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      E-mail cím
                    </label>
                    <input name="contactEmail" defaultValue={selectedItem.contactEmail} placeholder="booking@..." style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 7: Hospitality & Diet */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Hospitality / Backstage Ellátás
                    </label>
                    <input name="hospitality" defaultValue={selectedItem.hospitality} placeholder="pl. 8 fő melegétel, víz, kávé" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Speciális Étrendi Igény (Diéta)
                    </label>
                    <input name="diet" defaultValue={selectedItem.diet} placeholder="pl. 2 vegetáriánus, 1 gluténmentes" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Section 8: Stage Manager & Notes */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                      Felelős (Stage Manager)
                    </label>
                    <input name="stageManager" defaultValue={selectedItem.stageManager} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
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
                      style={{ color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
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
