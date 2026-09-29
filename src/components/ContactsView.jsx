import React, { useState } from 'react';
import { Phone, Mail, Radio, Siren, Search } from 'lucide-react';
import { telHref } from '../lib/artists';

const GROUPS = [
  { id: 'all', label: 'Mind' },
  { id: 'team', label: 'Stáb' },
  { id: 'artist', label: 'Fellépők' },
  { id: 'contractor', label: 'Szolgáltatók' },
  { id: 'vendor', label: 'Árusok' }
];

const GROUP_BADGE = {
  team: { label: 'Stáb', cls: 'badge-green' },
  artist: { label: 'Fellépő', cls: 'badge-blue' },
  contractor: { label: 'Szolgáltató', cls: 'badge-amber' },
  vendor: { label: 'Árus', cls: 'badge-gray' }
};

// Egyetlen telefonkönyv: stáb, fellépők, szolgáltatók és árusok egy helyen, egy koppintásos hívással
export function ContactsView({ users, artists, contractors, vendors, searchQuery = '' }) {
  const [group, setGroup] = useState('all');
  const [localQuery, setLocalQuery] = useState('');

  const contacts = [
    ...users.map(u => ({ id: u.id, group: 'team', title: u.name, person: u.name, subtitle: u.role, phone: u.phone, email: u.email, radio: u.radio })),
    ...artists.map(a => ({ id: a.id, group: 'artist', title: a.name, person: a.contact, subtitle: 'Kapcsolattartó', phone: a.phone, email: a.email })),
    ...contractors.map(c => ({ id: c.id, group: 'contractor', title: c.companyName, person: c.contactName, subtitle: c.category, phone: c.phone, email: c.email })),
    ...vendors.map(v => ({ id: v.id, group: 'vendor', title: `${v.code ? `${v.code} · ` : ''}${v.name}`, person: v.contact, subtitle: v.location, phone: v.phone, email: v.email }))
  ];

  const q = `${searchQuery} ${localQuery}`.trim().toLowerCase();
  const filtered = contacts.filter(c => {
    if (group !== 'all' && c.group !== group) return false;
    if (!q) return true;
    return q.split(/\s+/).every(word =>
      [c.title, c.person, c.subtitle, c.phone, c.email, c.radio].some(v => v && v.toLowerCase().includes(word))
    );
  });

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><Phone size={20} color="#059669" /> Telefonkönyv</h2>
          <p className="view-subtitle">Mindenki egy helyen — koppints a számra a híváshoz</p>
        </div>
      </div>

      <a href="tel:112" className="emergency-bar">
        <Siren size={20} /> Vészhelyzet: <strong>112</strong> <span className="call-pill danger"><Phone size={14} /> Hívás</span>
      </a>

      <div className="contacts-toolbar">
        <div className="contacts-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Név, cég, stand, telefonszám..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>
        <div className="chip-row">
          {GROUPS.map(g => (
            <button key={g.id} onClick={() => setGroup(g.id)} className={`chip${group === g.id ? ' active' : ''}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Nincs találat.</div>
      ) : (
        <div className="contacts-grid">
          {filtered.map(c => {
            const href = telHref(c.phone);
            const badge = GROUP_BADGE[c.group];
            return (
              <div key={`${c.group}-${c.id}`} className="contact-card">
                <div className="contact-main">
                  <div className="contact-title">
                    <span>{c.title}</span>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                  {c.person && c.person !== c.title && <div className="contact-person">{c.person}</div>}
                  {c.subtitle && <div className="contact-sub">{c.subtitle}</div>}
                  <div className="contact-meta">
                    {c.phone && <span>{c.phone}</span>}
                    {c.radio && <span><Radio size={12} /> {c.radio}</span>}
                    {c.email && <a href={`mailto:${c.email}`}><Mail size={12} /> {c.email}</a>}
                  </div>
                </div>
                {href ? (
                  <a href={href} className="call-pill big"><Phone size={16} /> Hívás</a>
                ) : (
                  <span className="contact-nophone">Nincs szám</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
