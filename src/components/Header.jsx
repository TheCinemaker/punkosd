import React from 'react';
import { Download, Search, User, LogOut, Calendar, MapPin, Radio, ShieldCheck, X } from 'lucide-react';

export function Header({ currentUser, onSwitchUser, onLogout, onExportExcel, searchQuery, onSearchChange }) {
  return (
    <header style={{
      backgroundColor: '#111827',
      borderBottom: '1.5px solid #334155',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        maxWidth: '1750px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Brand & Festival Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)'
          }}>
            <Radio size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                KTSZE Fesztivál Menedzser 2026
              </h1>
              <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                PÜNKÖSD (4 NAP)
              </span>
              <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                PIN: 1532
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', color: '#cbd5e1', marginTop: '3px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#38bdf8" /> Kőszeg: Fő tér (Borok) • Jurisics tér (Ételek) • Várjátszótér
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#60a5fa" /> Péntek – Hétfő
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div style={{ flex: '1', maxWidth: '380px', minWidth: '220px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Keresés (zenekar, árus, feladat, ZSAK-01)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                fontSize: '13px',
                backgroundColor: '#0b0f19',
                borderColor: searchQuery ? '#3b82f6' : '#334155',
                color: '#ffffff'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ffffff',
                  fontSize: '11px',
                  background: '#334155',
                  borderRadius: '4px',
                  padding: '2px 6px'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right: User Chip & Excel Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active User Chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#172033',
            border: '1.5px solid #334155',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '13px'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '12px'
            }}>
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#ffffff', lineHeight: 1.1 }}>{currentUser}</div>
              <div style={{ fontSize: '10.5px', color: '#38bdf8' }}>Aktív szerkesztő</div>
            </div>
            <button
              onClick={onSwitchUser}
              title="Váltás másik csapattagra"
              style={{
                color: '#ffffff',
                fontSize: '11px',
                marginLeft: '6px',
                padding: '3px 7px',
                borderRadius: '4px',
                background: '#334155',
                fontWeight: '600'
              }}
            >
              Váltás
            </button>
          </div>

          {/* 1-Click Excel Export Button */}
          <button
            onClick={onExportExcel}
            className="btn-success"
            title="Letölti a teljes hivatalos pályázati és operatív Excel munkafüzetet"
            style={{ fontWeight: '800', fontSize: '13.5px' }}
          >
            <Download size={16} /> Excel Export (.xlsx)
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Kijelentkezés"
            style={{
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '6px'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
