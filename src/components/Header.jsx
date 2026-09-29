import React from 'react';
import { Search, X, LogOut, User, Wifi, WifiOff, HardDrive, Loader2 } from 'lucide-react';

function SyncPill({ status, pendingCount }) {
  if (status === 'local') {
    return (
      <span className="sync-pill local" title="Nincs Supabase kapcsolat beállítva: az adatok csak ezen az eszközön vannak">
        <HardDrive size={13} /> Helyi mód
      </span>
    );
  }
  if (status === 'offline') {
    return (
      <span className="sync-pill offline" title="Nincs kapcsolat. A módosítások elmentődnek, és visszatéréskor automatikusan felkerülnek.">
        <WifiOff size={13} /> Offline{pendingCount > 0 ? ` · ${pendingCount} várakozik` : ''}
      </span>
    );
  }
  if (status === 'connecting' || pendingCount > 0) {
    return (
      <span className="sync-pill connecting" title="Szinkronizálás folyamatban">
        <Loader2 size={13} className="spin" /> Szinkron...
      </span>
    );
  }
  return (
    <span className="sync-pill online" title="Élő kapcsolat: minden módosítás azonnal megjelenik mindenkinél">
      <Wifi size={13} /> Élő
    </span>
  );
}

export function Header({ currentUser, onLogout, searchQuery, onSearchChange, syncStatus, pendingCount }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <h1 className="app-title">KTSZE Fesztivál</h1>

        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="search"
            placeholder="Keresés mindenben (név, telefon, stand...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Keresés"
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange('')} className="header-search-clear" aria-label="Keresés törlése">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="header-right">
          <SyncPill status={syncStatus} pendingCount={pendingCount} />
          <span className="user-chip">
            <User size={14} color="#2563eb" />
            <span>{currentUser}</span>
          </span>
          <button onClick={onLogout} title="Kijelentkezés" className="icon-btn" aria-label="Kijelentkezés">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
