import React, { useEffect, useState } from 'react';
import { Lock, Shield, AlertCircle, Check } from 'lucide-react';
import { FESTIVAL, MASTER_PIN } from '../lib/config';
import { getLocalData, setLocalData } from '../lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export function PinLogin({ onLogin, users }) {
  const activeUsers = users.filter(u => u.isActive !== false);
  const [selectedUser, setSelectedUser] = useState(() => getLocalData('lastUser', activeUsers[0]?.name || ''));
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const locked = lockedUntil > now;

  useEffect(() => {
    if (!locked) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [locked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    const user = activeUsers.find(u => u.name === selectedUser);
    if (!user) {
      setError('Válaszd ki a profilodat!');
      return;
    }
    const entered = pin.trim();
    const ok = (user.pin && entered === String(user.pin)) || (MASTER_PIN && entered === MASTER_PIN);
    if (!ok) {
      const next = attempts + 1;
      setAttempts(next);
      setPin('');
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
        setNow(Date.now());
        setAttempts(0);
        setError(`Túl sok hibás próbálkozás. Várj ${LOCK_SECONDS} másodpercet.`);
      } else {
        setError(`Hibás PIN kód. (${MAX_ATTEMPTS - next} próbálkozás maradt)`);
      }
      return;
    }
    setLocalData('lastUser', user.name);
    onLogin(user.name);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-head">
          <div className="login-icon"><Lock size={26} color="#ffffff" /></div>
          <h1>KTSZE Fesztivál Menedzser</h1>
          <p>{FESTIVAL.name} · {FESTIVAL.place} {FESTIVAL.year}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="field-label">Ki vagy?</label>
            <div className="login-users">
              {activeUsers.map(u => {
                const isSelected = selectedUser === u.name;
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => { setSelectedUser(u.name); setError(''); }}
                    className={`login-user${isSelected ? ' active' : ''}`}
                  >
                    <span>
                      <strong>{u.name}</strong>
                      <small>{u.badge || u.role}</small>
                    </span>
                    {isSelected && <Check size={16} color="#2563eb" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="pin">Saját PIN kódod</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={8}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              disabled={locked}
              className={`login-pin${error ? ' error' : ''}`}
              autoFocus
            />
            {error && (
              <div className="form-error" style={{ marginTop: '8px' }}>
                <AlertCircle size={15} /> {locked ? `Túl sok hibás próbálkozás. Várj még ${Math.ceil((lockedUntil - now) / 1000)} mp-et.` : error}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={locked || !pin}>
            <Shield size={17} /> Belépés
          </button>
        </form>

        <div className="login-foot">
          A PIN kódot a főszervezőtől kapod. Minden módosítás a neveddel naplózódik.
        </div>
      </div>
    </div>
  );
}
