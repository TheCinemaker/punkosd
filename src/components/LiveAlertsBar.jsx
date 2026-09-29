import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, Bell, X, Send, Radio } from 'lucide-react';

export function LiveAlertsBar({ incidents, onUpdateIncidents, onAddLog, currentUser }) {
  const [isOpenPanel, setIsOpenPanel] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeIncidents = incidents.filter(i => !i.isResolved);
  const criticalCount = activeIncidents.filter(i => i.severity === 'critical').length;
  const warningCount = activeIncidents.filter(i => i.severity === 'warning').length;

  const handleResolve = (id, text) => {
    const now = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    const updated = incidents.map(i => {
      if (i.id === id) {
        return {
          ...i,
          isResolved: true,
          resolvedBy: currentUser,
          resolvedAt: now
        };
      }
      return i;
    });

    onUpdateIncidents(updated);
    onAddLog({
      user: currentUser,
      action: 'RESOLVE_INCIDENT',
      module: 'Helyszíni SOS Problémafal',
      description: `Megoldotta a problémát: "${text}"`
    });
  };

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const now = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

    const newInc = {
      id: 'inc-' + Date.now(),
      severity: formData.get('severity'),
      location: formData.get('location'),
      reporter: currentUser,
      time: now,
      text: formData.get('text'),
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null
    };

    onUpdateIncidents([newInc, ...incidents]);
    onAddLog({
      user: currentUser,
      action: newInc.severity === 'critical' ? 'REPORT_SOS' : 'ADD_NOTE',
      module: 'Helyszíni SOS Problémafal',
      description: `[${newInc.severity.toUpperCase()}] Helyszíni észrevétel (${newInc.location}): "${newInc.text}"`
    });

    setIsAddModalOpen(false);
  };

  return (
    <>
      {/* Sticky Real-Time Alerts Ticker Bar */}
      <div style={{
        backgroundColor: criticalCount > 0 ? '#7f1d1d' : warningCount > 0 ? '#78350f' : '#111827',
        borderBottom: criticalCount > 0 ? '1.5px solid #dc2626' : warningCount > 0 ? '1.5px solid #d97706' : '1.5px solid #334155',
        padding: '8px 24px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        zIndex: 90
      }}>
        {/* Left: Status Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {criticalCount > 0 ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '4px',
              fontWeight: '800',
              fontSize: '12px'
            }}>
              <AlertCircle size={15} /> {criticalCount} AKTÍV SOS PROBLÉMA!
            </span>
          ) : warningCount > 0 ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '4px',
              fontWeight: '800',
              fontSize: '12px'
            }}>
              <AlertTriangle size={15} /> {warningCount} FIGYELMEZTETÉS
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: '700' }}>
              <CheckCircle2 size={15} color="#34d399" /> Minden helyszín és stand zavartalanul üzemel
            </span>
          )}

          {/* Latest Incident snippet */}
          {activeIncidents.length > 0 && (
            <span style={{ color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '650px', fontSize: '13px' }}>
              <strong>{activeIncidents[0].location}:</strong> {activeIncidents[0].text} <span style={{ color: '#cbd5e1' }}>({activeIncidents[0].reporter}, {activeIncidents[0].time})</span>
            </span>
          )}
        </div>

        {/* Right: Quick Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsOpenPanel(true)}
            style={{
              padding: '5px 12px',
              borderRadius: '5px',
              fontSize: '12.5px',
              fontWeight: '700',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #475569',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <Bell size={14} color="#60a5fa" /> Problémafal ({activeIncidents.length})
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '5px 12px',
              borderRadius: '5px',
              fontSize: '12.5px',
              fontWeight: '800',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> Helyszíni SOS / Észrevétel
          </button>
        </div>
      </div>

      {/* Slide-over Incident Log Panel */}
      {isOpenPanel && (
        <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
          <div style={{
            width: '100%',
            maxWidth: '540px',
            height: '100vh',
            backgroundColor: '#111827',
            borderLeft: '2px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.8)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1.5px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#172033'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={18} color="#ef4444" /> Valós Idejű SOS & Helyszíni Problémafal
                </h3>
                <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Minden csapattagnál azonnal megjelenő értesítések</p>
              </div>
              <button onClick={() => setIsOpenPanel(false)} style={{ color: '#ffffff', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Panel Body: Incident Feed */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', backgroundColor: '#dc2626' }}
              >
                <Plus size={16} /> Új Probléma / Megjegyzés Beküldése
              </button>

              {incidents.map(inc => {
                const isCrit = inc.severity === 'critical';
                const isWarn = inc.severity === 'warning';

                return (
                  <div
                    key={inc.id}
                    style={{
                      backgroundColor: inc.isResolved ? '#0f172a' : isCrit ? '#450a0a' : '#422006',
                      border: inc.isResolved ? '1px solid #334155' : isCrit ? '1.5px solid #dc2626' : '1.5px solid #d97706',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      opacity: inc.isResolved ? 0.75 : 1
                    }}
                  >
                    {/* Top Row: Severity, Location, Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className={`badge ${inc.isResolved ? 'badge-green' : isCrit ? 'badge-rose' : 'badge-amber'}`}>
                        {inc.isResolved ? 'MEGOLDVA' : isCrit ? 'SOS PROBLÉMA' : 'FIGYELMEZTETÉS'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#ffffff', fontFamily: 'JetBrains Mono', fontWeight: '700' }}>
                        {inc.time}
                      </span>
                    </div>

                    {/* Location */}
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isCrit && !inc.isResolved ? '#fca5a5' : '#93c5fd', marginBottom: '6px' }}>
                      Helyszín: {inc.location}
                    </div>

                    {/* Text */}
                    <div style={{ fontSize: '13.5px', color: '#ffffff', lineHeight: 1.5, marginBottom: '10px' }}>
                      {inc.text}
                    </div>

                    {/* Footer: Reporter & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
                      <span style={{ color: '#cbd5e1' }}>
                        Jelentette: <strong style={{ color: '#ffffff' }}>{inc.reporter}</strong>
                      </span>

                      {!inc.isResolved ? (
                        <button
                          onClick={() => handleResolve(inc.id, inc.text)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            fontWeight: '800',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Megoldva
                        </button>
                      ) : (
                        <span style={{ color: '#6ee7b7', fontWeight: '700' }}>
                          Megoldotta: {inc.resolvedBy} ({inc.resolvedAt})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New SOS / Note */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                Helyszíni SOS Probléma vagy Megjegyzés Rögzítése
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: '#cbd5e1', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                    Sürgősségi Szint:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <label style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #dc2626',
                      backgroundColor: '#7f1d1d',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <input type="radio" name="severity" value="critical" defaultChecked />
                      <span>SOS Probléma</span>
                    </label>

                    <label style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #d97706',
                      backgroundColor: '#78350f',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <input type="radio" name="severity" value="warning" />
                      <span>Figyelmeztetés</span>
                    </label>

                    <label style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #334155',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <input type="radio" name="severity" value="info" />
                      <span>Infó / Megjegyzés</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                    Pontos Helyszín / Stand / Színpad:
                  </label>
                  <input
                    name="location"
                    placeholder="pl. Jurisics tér — GASZT-02 Burger Truck vagy Fő tér 4. Boros pavilon"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                    Probléma / Megjegyzés Részletes Leírása:
                  </label>
                  <textarea
                    name="text"
                    rows={3}
                    placeholder="pl. Levágta az ipari 32A biztosítékot a fritőz, azonnal villanyszerelő kell! Vagy: Kifogyott a szemeteszsák..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Mégse</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#dc2626' }}>
                  <Send size={15} /> Azonnali Beküldés (Realtime)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
