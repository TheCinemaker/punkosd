import React from 'react';
import { Calendar, Users, Building2, MapPin, CheckSquare, ShoppingCart, Wine, Package, Music, DollarSign, History } from 'lucide-react';

export function Navigation({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'schedule', label: 'Menetrend & Színpadok', icon: Calendar, badge: counts.schedule, color: '#3b82f6' },
    { id: 'artists', label: 'Fellépők & Riderek', icon: Users, badge: counts.artists, color: '#8b5cf6' },
    { id: 'contractors', label: 'Szolgáltatók & Szerződések', icon: Building2, badge: counts.contractors, color: '#38bdf8' },
    { id: 'map', label: 'Helyszínrajz & Standok', icon: MapPin, badge: counts.mapPoints, color: '#10b981' },
    { id: 'tasks', label: 'To-Do & Ki csinálta', icon: CheckSquare, badge: counts.pendingTasks, color: '#f59e0b', alertBadge: counts.pendingTasks > 0 },
    { id: 'shopping', label: 'Beszerzés & Anyagigény', icon: ShoppingCart, badge: counts.pendingShopping, color: '#ec4899', alertBadge: counts.pendingShopping > 0 },
    { id: 'vendors', label: 'Árusok & Közművek', icon: Wine, badge: counts.vendors, color: '#f97316' },
    { id: 'inventory', label: 'Készlet & Zsákok', icon: Package, badge: counts.inventory, color: '#06b6d4' },
    { id: 'tracklist', label: 'Tracklist & Artisjus', icon: Music, badge: counts.tracklist, color: '#a855f7' },
    { id: 'budget', label: 'Pályázati Költségvetés', icon: DollarSign, badge: counts.budgetFormatted, color: '#eab308' },
    { id: 'logs', label: 'Aktivitási Napló', icon: History, badge: counts.logs, color: '#94a3b8' },
  ];

  return (
    <nav style={{
      backgroundColor: '#0f172a',
      borderBottom: '1.5px solid #334155',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1750px',
        margin: '0 auto',
        display: 'flex',
        gap: '4px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 15px',
                fontSize: '13.5px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#ffffff' : '#cbd5e1',
                borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(30, 41, 59, 0.7)' : 'transparent',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              <Icon size={17} color={isActive ? tab.color : '#94a3b8'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    backgroundColor: tab.alertBadge ? '#7f1d1d' : isActive ? '#1e3a8a' : '#1e293b',
                    color: tab.alertBadge ? '#fecaca' : isActive ? '#bfdbfe' : '#ffffff',
                    border: tab.alertBadge ? '1px solid #dc2626' : '1px solid #334155',
                    marginLeft: '2px'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
