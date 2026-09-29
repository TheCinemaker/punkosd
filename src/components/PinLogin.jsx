import React, { useState } from 'react';
import { Lock, Shield, Sparkles, AlertCircle, Key, Check } from 'lucide-react';
import { DEFAULT_USERS } from '../lib/initialData';

export function PinLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState(DEFAULT_USERS[0].name);
  const [customUser, setCustomUser] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() !== '1532') {
      setError('Hibás PIN kód! A kőszegi ostrom éve a helyes belépési kód (1532).');
      return;
    }
    const finalUserName = customUser.trim() ? customUser.trim() : selectedUser;
    onLogin(finalUserName);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#0b0f19'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#111827',
        border: '1.5px solid #334155',
        borderRadius: '12px',
        padding: '36px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: '#2563eb',
            marginBottom: '16px',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)'
          }}>
            <Lock size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
            KTSZE Fesztivál Menedzser
          </h1>
          <p style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '6px' }}>
            Világ- és Utcazenei Fesztivál Kőszeg 2026 (Pünkösd)
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* User selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#ffffff', marginBottom: '10px' }}>
              Válassz csapattag profilt (Módosítások naplózása):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {DEFAULT_USERS.map(u => {
                const isSelected = selectedUser === u.name && !customUser;
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => { setSelectedUser(u.name); setCustomUser(''); }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isSelected ? '700' : '600',
                      border: isSelected ? '2px solid #3b82f6' : '1.5px solid #334155',
                      backgroundColor: isSelected ? '#1e3a8a' : '#172033',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{u.name}</span>
                    {isSelected && <Check size={14} color="#60a5fa" />}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="vagy írj be egyedi nevet (pl. Szilveszter)..."
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value)}
              style={{ width: '100%', fontSize: '13.5px' }}
            />
          </div>

          {/* PIN input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                Mester PIN kód (1532):
              </label>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
                Kőszeg 1532
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
                padding: '12px',
                fontWeight: '800',
                color: '#ffffff'
              }}
            />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '12.5px', marginTop: '8px', fontWeight: '600' }}>
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
              padding: '14px',
              fontSize: '15px',
              fontWeight: '800',
              marginTop: '4px'
            }}
          >
            <Shield size={18} /> Belépés a Rendszerbe
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#0a0f1d',
          border: '1px solid #243044',
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'center'
        }}>
          Naplózás aktív: Minden feladat-kipipálás és módosítás a neveddel rögzítésre kerül.
        </div>
      </div>
    </div>
  );
}
