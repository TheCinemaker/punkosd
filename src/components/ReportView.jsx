import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ClipboardList, ThumbsUp, Wrench, Lightbulb, Trash2, Send, FileSpreadsheet, Plus, ExternalLink } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';
import { FESTIVAL } from '../lib/config';
import { expenseEntries, incomeEntries, huf } from '../lib/finance';
import { docUrl } from '../lib/files';
import { DocSlot } from './DocSlot';

const KINDS = [
  { value: 'Jól ment', icon: ThumbsUp, cls: 'good' },
  { value: 'Javítani kell', icon: Wrench, cls: 'fix' },
  { value: 'Ötlet jövőre', icon: Lightbulb, cls: 'idea' }
];

// Fesztivál utáni beszámoló: statisztika, látogatók, tanulságok, fotók — és Excel-export a pályázati beszámolóhoz
export function ReportView({ data, reportDays, onUpdateReportDays, lessons, onUpdateLessons, reportDocs, onUpdateReportDocs, onAddLog, currentUser }) {
  const [kind, setKind] = useState('Jól ment');
  const [text, setText] = useState('');
  const [area, setArea] = useState('');
  const [newDoc, setNewDoc] = useState(null);

  const expenses = expenseEntries(data);
  const incomes = incomeEntries(data);
  const stats = [
    ['Műsorok a menetrendben', data.schedule.length],
    ['Fellépők', data.artists.length],
    ['Árusok', data.vendors.filter(v => v.contractStatus !== 'Visszalépett / lemondta').length],
    ['Szolgáltatók', data.contractors.length],
    ['Kiadások összesen', huf(expenses.reduce((s, e) => s + e.amount, 0))],
    ['Bevételek összesen', huf(incomes.reduce((s, i) => s + i.amount, 0))],
    ['SOS / probléma bejelentés', `${data.incidents.length} (megoldva: ${data.incidents.filter(i => i.isResolved).length})`],
    ['Elvégzett feladatok', `${data.tasks.filter(t => t.completed).length} / ${data.tasks.length}`],
    ['Önkéntes / stáb műszak', data.shifts.length],
    ['Kiadott akkreditáció', `${data.accreditations.filter(a => a.issued).length} / ${data.accreditations.length}`]
  ];
  const dayOf = (date) => reportDays.find(r => r.id === date) || { id: date, visitors: '', weather: '', notes: '' };
  const setDay = (date, patch) => {
    const next = { ...dayOf(date), ...patch };
    onUpdateReportDays(reportDays.some(r => r.id === date) ? reportDays.map(r => (r.id === date ? next : r)) : [...reportDays, next]);
  };
  const totalVisitors = FESTIVAL.days.reduce((s, d) => s + (Number(dayOf(d.date).visitors) || 0), 0);

  const addLesson = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onUpdateLessons([...lessons, { id: uid('les'), kind, text: text.trim(), area: area.trim(), author: currentUser, time: new Date().toISOString() }]);
    onAddLog({ user: currentUser, action: 'CREATE', module: 'Beszámoló', description: `${kind}: ${text.trim().slice(0, 80)}` });
    setText('');
  };

  const exportReport = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[`${FESTIVAL.name} ${FESTIVAL.year} — beszámoló`], [], ['Mutató', 'Érték'], ...stats, ['Becsült látogatószám összesen', totalVisitors]]), 'Összesítő');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Nap', 'Dátum', 'Becsült látogató', 'Időjárás', 'Megjegyzés'], ...FESTIVAL.days.map(d => { const r = dayOf(d.date); return [d.name, d.date, r.visitors, r.weather, r.notes]; })]), 'Napok');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Típus', 'Terület', 'Tanulság', 'Ki írta'], ...lessons.map(l => [l.kind, l.area, l.text, l.author])]), 'Tanulságok');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Leírás', 'Fájl', 'Link'], ...reportDocs.map(d => [d.caption, d.doc?.name || '', docUrl(d.doc) && !docUrl(d.doc).startsWith('data:') ? docUrl(d.doc) : ''])]), 'Fotók & dokumentumok');
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const url = URL.createObjectURL(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `KTSZE-beszamolo-${FESTIVAL.year}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    onAddLog({ user: currentUser, action: 'EXPORT', module: 'Beszámoló', description: 'Letöltötte a beszámolót (Excel)' });
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><ClipboardList size={20} color="#2563eb" /> Beszámoló & tanulságok</h2>
          <p className="view-subtitle">A pályázati beszámolóhoz és a jövő évi fesztiválhoz — közben is lehet gyűjteni</p>
        </div>
        <button className="btn-secondary" onClick={exportReport}><FileSpreadsheet size={16} /> Beszámoló letöltése (Excel)</button>
      </div>

      <div className="fin-grid">
        <section className="dash-card">
          <div className="dash-card-title">Számokban (automatikus)</div>
          <div className="fin-lines">
            {stats.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
            <div><span>Becsült látogatószám</span><strong>{totalVisitors.toLocaleString('hu-HU')} fő</strong></div>
          </div>
        </section>

        <section className="dash-card">
          <div className="dash-card-title">Napok: látogatók, időjárás</div>
          {FESTIVAL.days.map(d => {
            const r = dayOf(d.date);
            return (
              <div key={d.date} className="report-day">
                <strong>{d.name}</strong>
                <input type="number" min="0" defaultValue={r.visitors} placeholder="látogató (fő)" onBlur={(e) => setDay(d.date, { visitors: numOr(e.target.value, '') })} />
                <input defaultValue={r.weather} placeholder="időjárás" onBlur={(e) => setDay(d.date, { weather: e.target.value })} />
                <input defaultValue={r.notes} placeholder="megjegyzés" onBlur={(e) => setDay(d.date, { notes: e.target.value })} />
              </div>
            );
          })}
        </section>
      </div>

      <section className="dash-card" style={{ marginTop: '14px' }}>
        <div className="dash-card-title">Tanulságok</div>
        <form onSubmit={addLesson} className="lesson-form">
          <div className="segmented">
            {KINDS.map(k => {
              const Icon = k.icon;
              return <button type="button" key={k.value} className={kind === k.value ? 'active' : ''} onClick={() => setKind(k.value)}><Icon size={14} /> {k.value}</button>;
            })}
          </div>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Terület (pl. Nagyszínpad, Árusok, Hulladék)" />
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="pl. A Jurisics téri áramelosztó kevés volt a food truckoknak — jövőre +1 elosztó kell." />
          <button type="submit" className="btn-primary" disabled={!text.trim()}><Send size={15} /> Hozzáadás</button>
        </form>
        <div className="lesson-cols">
          {KINDS.map(k => {
            const Icon = k.icon;
            const list = lessons.filter(l => l.kind === k.value);
            return (
              <div key={k.value} className={`lesson-col ${k.cls}`}>
                <div className="lesson-head"><Icon size={16} /> {k.value} ({list.length})</div>
                {list.map(l => (
                  <div key={l.id} className="lesson">
                    <div>{l.area && <span className="badge badge-gray">{l.area}</span>} {l.text}</div>
                    <div className="dash-sub">{l.author}
                      <button className="icon-btn danger" style={{ marginLeft: 'auto', minHeight: 0, padding: 2 }} onClick={() => { if (window.confirm('Törlöd?')) onUpdateLessons(lessons.filter(x => x.id !== l.id)); }} aria-label="Törlés"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dash-card" style={{ marginTop: '14px' }}>
        <div className="dash-card-title">Fotók & dokumentumok (beszámolóhoz)</div>
        <div className="report-docs">
          {reportDocs.map(d => (
            <div key={d.id} className="report-doc">
              {docUrl(d.doc) && /\.(jpe?g|png|webp)$/i.test(d.doc?.name || '') && <img src={docUrl(d.doc)} alt={d.caption} />}
              <div className="report-doc-body">
                <strong>{d.caption || d.doc?.name}</strong>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {docUrl(d.doc) && <a href={docUrl(d.doc)} target="_blank" rel="noopener noreferrer" className="phone-link"><ExternalLink size={12} /> Megnyitás</a>}
                  <button className="icon-btn danger" onClick={() => { if (window.confirm('Törlöd a listából?')) onUpdateReportDocs(reportDocs.filter(x => x.id !== d.id)); }} aria-label="Törlés"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          <div className="report-doc add">
            {newDoc ? (
              <>
                <input placeholder="Leírás (pl. Szombat esti koncert, Fő tér)" value={newDoc.caption} onChange={(e) => setNewDoc({ ...newDoc, caption: e.target.value })} />
                <DocSlot label="Fájl" doc={newDoc.doc} folder="report" onChange={(doc) => setNewDoc(prev => ({ ...prev, doc }))} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-primary" disabled={!newDoc.doc} onClick={() => { onUpdateReportDocs([...reportDocs, { id: uid('rdc'), caption: newDoc.caption, doc: newDoc.doc, author: currentUser }]); setNewDoc(null); }}>Hozzáadás</button>
                  <button className="btn-secondary" onClick={() => setNewDoc(null)}>Mégse</button>
                </div>
              </>
            ) : (
              <button className="btn-secondary" onClick={() => setNewDoc({ caption: '', doc: null })}><Plus size={15} /> Fotó / dokumentum</button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
