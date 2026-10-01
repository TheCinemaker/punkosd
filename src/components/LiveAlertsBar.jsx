import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, Bell, BellRing, X, Send, Radio } from 'lucide-react';
import { uid } from '../lib/store';
import { notificationsSupported, requestNotificationPermission } from '../lib/notify';

export function LiveAlertsBar({ incidents, onUpdateIncidents, onAddLog, currentUser }) {
  const [isOpenPanel, setIsOpenPanel] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState(() => (notificationsSupported() ? Notification.permission : 'unsupported'));

  const enableNotifications = async () => {
    setNotifPermission(await requestNotificationPermission());
  };

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

  const handleTakeOver = (inc) => {
    const time = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    onUpdateIncidents(incidents.map(i => (i.id === inc.id ? { ...i, assignee: currentUser, takenAt: time } : i)));
    onAddLog({ user: currentUser, action: 'TAKE_INCIDENT', module: 'Helyszíni SOS Problémafal', description: `Átvette, úton van: "${inc.text}"` });
  };

  const handleEditText = (inc) => {
    const text = window.prompt('A bejelentés szövege:', inc.text);
    if (text === null || !text.trim() || text.trim() === inc.text) return;
    onUpdateIncidents(incidents.map(i => (i.id === inc.id ? { ...i, text: text.trim() } : i)));
    onAddLog({ user: currentUser, action: 'UPDATE', module: 'Helyszíni SOS Problémafal', description: `Javította a bejelentést: "${text.trim()}"` });
  };

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const now = new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

    const newInc = {
      id: uid('inc'),
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

  const isAlertActive = criticalCount > 0 || warningCount > 0;

  return (
    <>
      {/* Real-Time Alerts Ticker Bar (Light Mode) */}
      <div className="alerts-bar" style={{
        backgroundColor: criticalCount > 0 ? '#fee2e2' : warningCount > 0 ? '#fef3c7' : '#ffffff',
        borderBottom: criticalCount > 0 ? '2px solid #ef4444' : warningCount > 0 ? '2px solid #f59e0b' : '1px solid #cbd5e1',
        padding: '8px 20px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        transition: 'all 0.15s ease'
      }}>
        {/* Left: Status Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '700' }}>
              <CheckCircle2 size={16} color="#059669" /> Nincs nyitott probléma
            </span>
          )}

          {/* Latest Incident snippet */}
          {activeIncidents.length > 0 && (
            <span className="alerts-snippet" style={{ color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '650px', fontSize: '13px', fontWeight: '600' }}>
              <strong>{activeIncidents[0].location}:</strong> {activeIncidents[0].text} <span style={{ color: '#475569' }}>({activeIncidents[0].reporter}, {activeIncidents[0].time})</span>
            </span>
          )}
        </div>

        {/* Right: Quick Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsOpenPanel(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '5px',
              fontSize: '12.5px',
              fontWeight: '700',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <Bell size={14} color="#2563eb" /> Problémafal ({activeIncidents.length})
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '6px 14px',
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
            <Plus size={15} /> SOS / Észrevétel
          </button>
        </div>
      </div>

      {/* Slide-over Incident Log Panel */}
      {isOpenPanel && (
        <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
          <div style={{
            width: '100%',
            maxWidth: '540px',
            height: '100%',
            backgroundColor: '#ffffff',
            borderLeft: '2px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.15)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={18} color="#dc2626" /> Valós Idejű SOS & Helyszíni Problémafal
                </h3>
                <p style={{ fontSize: '12px', color: '#334155' }}>Minden csapattagnál azonnal megjelenő értesítések</p>
              </div>
              <button onClick={() => setIsOpenPanel(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {notifPermission === 'default' && (
              <button onClick={enableNotifications} className="notif-banner">
                <BellRing size={16} /> Értesítések bekapcsolása — új SOS esetén a telefonod is jelez
              </button>
            )}
            {notifPermission === 'denied' && (
              <div className="notif-banner muted">
                Az értesítések le vannak tiltva ebben a böngészőben. A böngésző beállításaiban engedélyezheted.
              </div>
            )}

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
                      backgroundColor: inc.isResolved ? '#f8fafc' : isCrit ? '#fef2f2' : '#fffbeb',
                      border: inc.isResolved ? '1px solid #cbd5e1' : isCrit ? '1.5px solid #f87171' : '1.5px solid #fde68a',
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
                      <span style={{ fontSize: '12px', color: '#0f172a', fontFamily: 'JetBrains Mono', fontWeight: '800' }}>
                        {inc.time}
                      </span>
                    </div>

                    {/* Location */}
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isCrit && !inc.isResolved ? '#b91c1c' : '#1e40af', marginBottom: '6px' }}>
                      Helyszín: {inc.location}
                    </div>

                    {/* Text */}
                    <div style={{ fontSize: '13.5px', color: '#000000', lineHeight: 1.5, marginBottom: '10px', fontWeight: '600' }}>
                      {inc.text}
                    </div>

                    {/* Footer: Reporter & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      <span style={{ color: '#475569' }}>
                        Jelentette: <strong style={{ color: '#0f172a' }}>{inc.reporter}</strong>
                        {inc.assignee && !inc.isResolved && <span className="badge badge-blue" style={{ marginLeft: '6px' }}>Úton: {inc.assignee} ({inc.takenAt})</span>}
                      </span>
                      {!inc.isResolved && (
                        <span style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditText(inc)} className="btn-secondary compact-btn">Javítás</button>
                          {inc.assignee !== currentUser && <button onClick={() => handleTakeOver(inc)} className="btn-secondary compact-btn">Átvettem</button>}
                        </span>
                      )}

                      {!inc.isResolved ? (
                        <button
                          onClick={() => handleResolve(inc.id, inc.text)}
                          style={{
                            padding: '4px 12px',
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
                        <span style={{ color: '#166534', fontWeight: '800' }}>
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
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                Helyszíni SOS Probléma vagy Megjegyzés Rögzítése
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: '#475569', padding: '6px', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Sürgősségi Szint:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <label style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '2px solid #dc2626',
                      backgroundColor: '#fef2f2',
                      color: '#991b1b',
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
                      backgroundColor: '#fffbeb',
                      color: '#92400e',
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
                      border: '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
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
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
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
