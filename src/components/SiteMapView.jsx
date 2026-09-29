import React, { useState } from 'react';
import { 
  MapPin, Wine, Utensils, Zap, Droplets, Trash2, 
  AlertCircle, CheckCircle2, Phone, Eye, ShieldCheck, HeartPulse, Radio, Music
} from 'lucide-react';
import { MAP_POINTS, MAP_ZONES } from '../lib/initialData';

export function SiteMapView({ onAddLog, currentUser, searchQuery }) {
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activePoint, setActivePoint] = useState(MAP_POINTS[0]);
  const [points, setPoints] = useState(MAP_POINTS);

  const filteredPoints = points.filter(p => {
    const matchesZone = selectedZone === 'all' || p.zoneId === selectedZone;
    const matchesType = selectedType === 'all' || p.type === selectedType;
    const matchesSearch = !searchQuery ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesType && matchesSearch;
  });

  const handleToggleProblem = (pointId) => {
    const updated = points.map(p => {
      if (p.id === pointId) {
        const willHaveProblem = !p.hasProblem;
        return {
          ...p,
          hasProblem: willHaveProblem,
          status: willHaveProblem ? 'HIBA JELENTVE (SOS)' : 'Üzemel (Rendben)',
          problemText: willHaveProblem ? 'Azonnali beavatkozás szükséges a helyszínen!' : ''
        };
      }
      return p;
    });

    setPoints(updated);
    const target = updated.find(p => p.id === pointId);
    if (target) {
      setActivePoint(target);
      onAddLog({
        user: currentUser,
        action: target.hasProblem ? 'FLAG_ISSUE' : 'RESOLVE_ISSUE',
        module: 'Helyszínrajz & Térkép',
        description: target.hasProblem
          ? `[PROBLÉMA JELZÉS] a standnál: ${target.code} (${target.name})`
          : `[MEGOLDVA] a standnál: ${target.code} (${target.name})`
      });
    }
  };

  const getPointColor = (p) => {
    if (p.hasProblem) return '#dc2626';
    if (p.type === 'stage') return '#2563eb';
    if (p.type === 'wine') return '#7c3aed';
    if (p.type === 'food') return '#d97706';
    if (p.type === 'power') return '#b45309';
    if (p.type === 'water') return '#0284c7';
    if (p.type === 'toilet') return '#059669';
    if (p.type === 'medical') return '#db2777';
    return '#64748b';
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'wine': return <Wine size={13} />;
      case 'food': return <Utensils size={13} />;
      case 'stage': return <Radio size={13} />;
      case 'power': return <Zap size={13} />;
      case 'water': return <Droplets size={13} />;
      case 'toilet': return <CheckCircle2 size={13} />;
      case 'medical': return <HeartPulse size={13} />;
      case 'waste': return <Trash2 size={13} />;
      case 'street': return <Music size={13} />;
      default: return <MapPin size={13} />;
    }
  };

  return (
    <div>
      {/* Top Header & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2563eb" /> Kőszeg Belváros Helyszínrajz & Stand Térkép
          </h2>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Minden boros pavilon, kajás food truck, színpad és közmű pont pontos elhelyezkedése
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            <option value="all">Minden Zóna</option>
            {MAP_ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ fontSize: '13px', padding: '7px 12px', fontWeight: '600' }}
          >
            <option value="all">Minden típus</option>
            <option value="wine">Borászatok (Fő tér)</option>
            <option value="food">Ételek Utcája (Kajások)</option>
            <option value="stage">Színpadok</option>
            <option value="power">Áramelosztók</option>
            <option value="water">Vízvételi pontok</option>
            <option value="toilet">Mobil WC-k</option>
            <option value="medical">Mentő & EÜ</option>
          </select>
        </div>
      </div>

      {/* Main Map Viewport + Side Inspector Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '16px', alignItems: 'start' }}>
        
        {/* Visual Interactive Map Canvas (Light Mode) */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          minHeight: '640px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Grid lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
            opacity: 0.6
          }} />

          {/* Zone 1 Outline: FŐ TÉR */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            width: '92%',
            height: '42%',
            border: '2px dashed #93c5fd',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            padding: '12px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              KŐSZEG FŐ TÉR — BOROK HELYSZÍNE & NAGYSZÍNPAD
            </span>
          </div>

          {/* Zone 2 Outline: JURISICS TÉR */}
          <div style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
            width: '92%',
            height: '48%',
            border: '2px dashed #fde68a',
            borderRadius: '12px',
            backgroundColor: '#fffbeb',
            padding: '12px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              JURISICS TÉR — ÉTELEK UTCÁJA (GASZTRO SOR) & KISSZÍNPAD 1
            </span>
          </div>

          {/* Render All Map Pins */}
          {filteredPoints.map(p => {
            const isSelected = activePoint && activePoint.id === p.id;
            const pinColor = getPointColor(p);

            return (
              <div
                key={p.id}
                onClick={() => setActivePoint(p)}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 50 : 20,
                  cursor: 'pointer'
                }}
              >
                {/* Ping animation if problem active */}
                {p.hasProblem && (
                  <div style={{
                    position: 'absolute',
                    inset: '-6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(220, 38, 38, 0.4)',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }} />
                )}

                {/* Pin Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                  border: `2px solid ${isSelected ? '#1d4ed8' : pinColor}`,
                  color: isSelected ? '#ffffff' : '#0f172a',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  boxShadow: isSelected
                    ? `0 4px 14px rgba(37, 99, 235, 0.35)`
                    : '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: isSelected ? '#ffffff' : pinColor }}>{renderIcon(p.type)}</span>
                  <span>{p.code}</span>
                  {p.hasProblem && <span style={{ color: isSelected ? '#ffffff' : '#dc2626', fontWeight: '900' }}>!</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Stand / Point Inspector */}
        {activePoint ? (
          <div className="ops-card" style={{ padding: '22px', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className={`badge ${activePoint.type === 'wine' ? 'badge-blue' : activePoint.type === 'food' ? 'badge-amber' : activePoint.type === 'stage' ? 'badge-gray' : 'badge-green'}`}>
                {activePoint.type.toUpperCase()}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontWeight: '800',
                color: activePoint.hasProblem ? '#dc2626' : '#2563eb',
                fontSize: '14px'
              }}>
                {activePoint.code}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
              {activePoint.name}
            </h3>

            {/* Problem Alert Banner if active */}
            {activePoint.hasProblem && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1.5px solid #f87171',
                borderRadius: '8px',
                padding: '12px 14px',
                margin: '14px 0',
                fontSize: '13px',
                color: '#991b1b'
              }}>
                <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <AlertCircle size={16} color="#dc2626" /> AKTÍV PROBLÉMA A STANDNÁL!
                </div>
                <div>{activePoint.problemText || 'Helyszíni beavatkozás szükséges!'}</div>
              </div>
            )}

            {/* Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Áramellátás:</span>
                <span style={{ fontWeight: '800', color: activePoint.power.includes('32A') ? '#b45309' : '#0f172a' }}>
                  {activePoint.power}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Kapcsolattartó:</span>
                <span style={{ fontWeight: '700', color: '#000000' }}>
                  {activePoint.contact}
                </span>
              </div>

              {activePoint.trashBags && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#475569' }}>Kiadott 120L zsák:</span>
                  <span style={{ fontWeight: '800', color: '#1d4ed8' }}>
                    {activePoint.trashBags} db zsák
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Állapot:</span>
                <span className={`badge ${activePoint.hasProblem ? 'badge-rose' : 'badge-green'}`}>
                  {activePoint.status}
                </span>
              </div>
            </div>

            {/* Emergency Action Buttons */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleToggleProblem(activePoint.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  backgroundColor: activePoint.hasProblem ? '#059669' : '#dc2626',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {activePoint.hasProblem ? (
                  <>
                    <CheckCircle2 size={16} /> Probléma Megoldva Jelölése
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} /> HIBA / SOS PROBLÉMA JELENTÉSE
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="ops-card" style={{ padding: '36px', textAlign: 'center', color: '#475569', backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1' }}>
            Kattints a térképen bármelyik standra vagy színpadra a részletekért!
          </div>
        )}

      </div>
    </div>
  );
}
