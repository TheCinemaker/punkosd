import React, { useState } from 'react';
import { Lock, Shield, Sparkles, AlertCircle, Key, Check } from 'lucide-react';
import { DEFAULT_USERS } from '../lib/initialData';

export function PinLogin({ onLogin, users = DEFAULT_USERS }) {
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState(users[0]?.name || 'Szilveszter');
  const [customUser, setCustomUser] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUserName = customUser.trim() ? customUser.trim() : selectedUser;
    const targetUserObj = users.find(u => u.name.toLowerCase() === finalUserName.toLowerCase());
    const validPin = targetUserObj?.pin ? targetUserObj.pin : '1532';

    // Bárki beléphet a 1532 mesterkóddal VAGY a szervező saját egyedi PIN-jével
    if (pin.trim() !== '1532' && pin.trim() !== validPin) {
      setError('Hibás PIN kód! A megadott szervezői kód vagy a mesterkód (1532) szükséges.');
      return;
    }
    onLogin(finalUserName);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '32px 26px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#2563eb',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Lock size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', color: '#000000' }}>
            KTSZE Fesztivál Menedzser
          </h1>
          <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '500' }}>
            Világ- és Utcazenei Fesztivál Kőszeg 2026 (Pünkösd)
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              Válassz csapattag profilt (Módosítások naplózása):
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
              marginBottom: '10px',
              paddingRight: '4px'
            }}>
              {users.map(u => {
                const isSelected = selectedUser === u.name && !customUser;
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => { setSelectedUser(u.name); setCustomUser(''); }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isSelected ? '700' : '500',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1e40af' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: isSelected ? '#1e40af' : '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{u.badge || u.role}</div>
                    </div>
                    {isSelected && <Check size={15} color="#2563eb" />}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="vagy írj be egyedi nevet (pl. Szilveszter)..."
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value)}
              style={{
                width: '100%',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                color: '#0f172a'
              }}
            />
          </div>

          {/* PIN input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                Belépési PIN kód:
              </label>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                Mesterkód: 1532
              </span>
            </div>
            <input
              type="password"
              maxLength={8}
              placeholder="1532"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              autoFocus
              style={{
                width: '100%',
                fontSize: '22px',
                textAlign: 'center',
                letterSpacing: '0.25em',
                padding: '10px',
                fontWeight: '800',
                backgroundColor: '#f8fafc',
                borderColor: error ? '#dc2626' : '#cbd5e1',
                color: '#0f172a'
              }}
            />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontSize: '12.5px', marginTop: '6px', fontWeight: '600' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '12px',
              fontSize: '14.5px',
              fontWeight: '700',
              marginTop: '4px'
            }}
          >
            <Shield size={17} /> Belépés a Rendszerbe
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          fontSize: '11.5px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          Naplózás aktív: Minden feladat-kipipálás és módosítás a neveddel rögzítésre kerül.
        </div>
      </div>
    </div>
  );
}
