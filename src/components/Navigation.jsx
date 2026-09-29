import React, { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { TABS, MOBILE_PRIMARY } from '../lib/tabs';

function Badge({ value, alert, active }) {
  if (value === undefined || value === null || value === '') return null;
  return <span className={`nav-badge${alert ? ' alert' : ''}${active ? ' active' : ''}`}>{value}</span>;
}

export function Navigation({ activeTab, onTabChange, counts }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const secondaryTabs = TABS.filter(t => !MOBILE_PRIMARY.includes(t.id));
  const activeIsSecondary = secondaryTabs.some(t => t.id === activeTab);
  const secondaryAlert = secondaryTabs.some(t => counts[`${t.id}Alert`]);

  const go = (id) => {
    onTabChange(id);
    setMoreOpen(false);
  };

  return (
    <>
      {/* Asztali / tablet: felső menüsor */}
      <nav className="top-nav" aria-label="Fő menü">
        <div className="top-nav-inner">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => go(tab.id)}
                className={`top-nav-tab${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{tab.longLabel}</span>
                <Badge value={counts[tab.id]} alert={counts[`${tab.id}Alert`]} active={isActive} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobil: alsó menüsor */}
      <nav className="bottom-nav" aria-label="Fő menü">
        {TABS.filter(t => MOBILE_PRIMARY.includes(t.id)).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => go(tab.id)} className={`bottom-nav-tab${isActive ? ' active' : ''}`}>
              <span className="bottom-nav-icon">
                <Icon size={22} />
                {counts[`${tab.id}Alert`] && <span className="bottom-nav-dot" />}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className={`bottom-nav-tab${activeIsSecondary ? ' active' : ''}`}>
          <span className="bottom-nav-icon">
            <MoreHorizontal size={22} />
            {secondaryAlert && <span className="bottom-nav-dot" />}
          </span>
          <span>Több</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="sheet-overlay" onClick={() => setMoreOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <strong>Minden modul</strong>
              <button onClick={() => setMoreOpen(false)} aria-label="Bezárás"><X size={22} /></button>
            </div>
            <div className="sheet-grid">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => go(tab.id)} className={`sheet-item${isActive ? ' active' : ''}`}>
                    <Icon size={22} />
                    <span>{tab.longLabel}</span>
                    <Badge value={counts[tab.id]} alert={counts[`${tab.id}Alert`]} active={isActive} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
