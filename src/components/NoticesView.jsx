import React, { useState } from 'react';
import { Megaphone, Pin, Trash2, Send, AlertTriangle } from 'lucide-react';
import { uid } from '../lib/store';

const fmt = (iso) => new Date(iso).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// A kezdőlap tetején: kitűzött + az utolsó 24 óra fontos közleményei
export function NoticesBoard({ notices, onNavigate }) {
  const dayAgo = Date.now() - 86400000;
  const shown = notices.filter(n => n.pinned || (n.important && new Date(n.time).getTime() > dayAgo)).slice(0, 4);
  if (!shown.length) return null;
  return (
    <section className="notice-board">
      {shown.map(n => (
        <div key={n.id} className={`notice${n.important ? ' important' : ''}`}>
          {n.pinned ? <Pin size={15} /> : <Megaphone size={15} />}
          <div>
            <div className="notice-text">{n.text}</div>
            <div className="dash-sub">{n.author} · {fmt(n.time)}</div>
          </div>
        </div>
      ))}
      <button className="link-btn" onClick={() => onNavigate('notices')}>Összes közlemény</button>
    </section>
  );
}

export function NoticesView({ notices, onUpdateNotices, onAddLog, currentUser }) {
  const [text, setText] = useState('');
  const [important, setImportant] = useState(false);
  const [pinned, setPinned] = useState(false);

  const post = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onUpdateNotices([{ id: uid('ntc'), text: t, important, pinned, author: currentUser, time: new Date().toISOString() }, ...notices]);
    onAddLog({ user: currentUser, action: 'CREATE', module: 'Közlemények', description: `${important ? '[FONTOS] ' : ''}${t.slice(0, 80)}` });
    setText('');
    setImportant(false);
    setPinned(false);
  };

  const togglePin = (n) => onUpdateNotices(notices.map(x => (x.id === n.id ? { ...x, pinned: !x.pinned } : x)));
  const remove = (n) => {
    if (!window.confirm('Törlöd ezt a közleményt?')) return;
    onUpdateNotices(notices.filter(x => x.id !== n.id));
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><Megaphone size={20} color="#b45309" /> Közlemények</h2>
          <p className="view-subtitle">Napi eligazítás, változások mindenkinek — a fontosak a kezdőlap tetején is megjelennek, és értesítést küldenek</p>
        </div>
      </div>

      <form onSubmit={post} className="section-box" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="pl. Ma a Hősök kapu zárva, a fellépők a Várkörön hajtanak be. Reggeli eligazítás 9:00 az info sátornál." />
        <div className="toolbar-right" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <label className="checkbox-row"><input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} /> <AlertTriangle size={15} color="#b45309" /> Fontos (értesítést küld)</label>
            <label className="checkbox-row"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> <Pin size={15} /> Kitűzve a kezdőlapra</label>
          </div>
          <button type="submit" className="btn-primary" disabled={!text.trim()}><Send size={15} /> Közzététel</button>
        </div>
      </form>

      {notices.length === 0 ? <div className="empty-state">Még nincs közlemény.</div> : (
        <div className="dash-list">
          {notices.map(n => (
            <div key={n.id} className={`notice${n.important ? ' important' : ''}`}>
              {n.pinned ? <Pin size={15} /> : <Megaphone size={15} />}
              <div style={{ flex: 1 }}>
                <div className="notice-text">{n.text}</div>
                <div className="dash-sub">{n.author} · {fmt(n.time)}</div>
              </div>
              <button className="icon-btn" title={n.pinned ? 'Levétel a kezdőlapról' : 'Kitűzés a kezdőlapra'} onClick={() => togglePin(n)}><Pin size={15} /></button>
              <button className="icon-btn danger" title="Törlés" onClick={() => remove(n)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
