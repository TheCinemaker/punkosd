import React from 'react';
import { Search, X, LogOut, User } from 'lucide-react';

export function Header({ currentUser, onSwitchUser, onLogout, searchQuery, onSearchChange }) {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '10px 16px',
      position: 'relative', /* Nem sticky, elgörgethető természetesen */
      width: '100%',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        maxWidth: '1750px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Bal oldal: Csak a Manager cím */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            KTSZE Fesztivál Menedzser
          </h1>
        </div>

        {/* Közép: Keresősáv */}
        <div style={{ flex: '1', maxWidth: '360px', minWidth: '180px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: searchQuery ? '30px' : '10px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '13px',
                backgroundColor: '#f8fafc',
                borderColor: searchQuery ? '#2563eb' : '#cbd5e1',
                color: '#0f172a',
                borderRadius: '6px',
                height: '36px'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '11px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Jobb oldal: Kompakt felhasználó és kilépés */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12.5px'
          }}>
            <User size={13} color="#2563eb" />
            <span style={{ fontWeight: '700', color: '#0f172a' }}>{currentUser}</span>
            <button
              onClick={onSwitchUser}
              title="Váltás másik csapattagra"
              style={{
                color: '#2563eb',
                fontSize: '11px',
                marginLeft: '4px',
                fontWeight: '600',
                padding: '2px 4px'
              }}
            >
              Váltás
            </button>
          </div>

          <button
            onClick={onLogout}
            title="Kijelentkezés"
            style={{
              color: '#64748b',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
