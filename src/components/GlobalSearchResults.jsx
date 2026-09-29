import React from 'react';
import { Search } from 'lucide-react';
import { TABS } from '../lib/tabs';

const HIDDEN_FIELDS = new Set(['pin', '_sort', 'url', 'path']);

function matches(item, q) {
  return Object.entries(item).some(([k, v]) => {
    if (HIDDEN_FIELDS.has(k) || v == null) return false;
    if (typeof v === 'object') return matches(v, q);
    return String(v).toLowerCase().includes(q);
  });
}

// A keresés az összes modulban fut: megmutatja, hol van még találat
export function GlobalSearchResults({ query, data, activeTab, onNavigate }) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;

  const results = TABS
    .filter(t => t.collection && data[t.collection])
    .map(t => ({ tab: t, count: data[t.collection].filter(item => matches(item, q)).length }))
    .filter(r => r.count > 0);

  const phoneHits = ['users', 'artists', 'contractors', 'vendors']
    .reduce((n, key) => n + data[key].filter(item => matches(item, q)).length, 0);
  if (phoneHits > 0) results.push({ tab: TABS.find(t => t.id === 'contacts'), count: phoneHits });

  return (
    <div className="global-search">
      <span className="global-search-title">
        <Search size={14} /> „{query.trim()}”
      </span>
      {results.length === 0 ? (
        <span className="global-search-empty">Nincs találat egyik modulban sem.</span>
      ) : (
        results.map(({ tab, count }) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`global-search-chip${activeTab === tab.id ? ' active' : ''}`}
            >
              <Icon size={14} /> {tab.label} <strong>{count}</strong>
            </button>
          );
        })
      )}
    </div>
  );
}
