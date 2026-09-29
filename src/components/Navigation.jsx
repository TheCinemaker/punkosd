import React from 'react';
import { Calendar, Users, Building2, MapPin, CheckSquare, ShoppingCart, Wine, Package, Music, DollarSign, History, UserCheck } from 'lucide-react';

export function Navigation({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'schedule', label: 'Menetrend & Színpadok', icon: Calendar, badge: counts.schedule, color: '#2563eb' },
    { id: 'artists', label: 'Fellépők & Riderek', icon: Users, badge: counts.artists, color: '#7c3aed' },
    { id: 'contractors', label: 'Szolgáltatók & Szerződések', icon: Building2, badge: counts.contractors, color: '#0284c7' },
    { id: 'team', label: 'Szervezők & Stáb', icon: UserCheck, badge: counts.users, color: '#059669' },
    { id: 'map', label: 'Helyszínrajz & Standok', icon: MapPin, badge: counts.mapPoints, color: '#0d9488' },
    { id: 'tasks', label: 'To-Do & Ki csinálta', icon: CheckSquare, badge: counts.pendingTasks, color: '#d97706', alertBadge: counts.pendingTasks > 0 },
    { id: 'shopping', label: 'Beszerzés & Anyagigény', icon: ShoppingCart, badge: counts.pendingShopping, color: '#db2777', alertBadge: counts.pendingShopping > 0 },
    { id: 'vendors', label: 'Árusok & Közművek', icon: Wine, badge: counts.vendors, color: '#ea580c' },
    { id: 'inventory', label: 'Készlet & Zsákok', icon: Package, badge: counts.inventory, color: '#0891b2' },
    { id: 'tracklist', label: 'Tracklist & Artisjus', icon: Music, badge: counts.tracklist, color: '#9333ea' },
    { id: 'budget', label: 'Pályázati Költségvetés', icon: DollarSign, badge: counts.budgetFormatted, color: '#ca8a04' },
    { id: 'logs', label: 'Aktivitási Napló', icon: History, badge: counts.logs, color: '#64748b' },
  ];

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '0 16px',
      WebkitOverflowScrolling: 'touch'
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
                gap: '7px',
                padding: '11px 13px',
                fontSize: '13px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#1d4ed8' : '#0f172a',
                borderBottom: isActive ? `3px solid #2563eb` : '3px solid transparent',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Icon size={16} color={isActive ? '#2563eb' : '#0f172a'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: tab.alertBadge ? '#fee2e2' : isActive ? '#dbeafe' : '#f1f5f9',
                    color: tab.alertBadge ? '#b91c1c' : isActive ? '#1e40af' : '#475569',
                    border: tab.alertBadge ? '1px solid #fca5a5' : '1px solid #e2e8f0',
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
