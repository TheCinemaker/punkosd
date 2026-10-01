import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Wallet, TrendingDown, TrendingUp, Scale, Plus, X, Trash2, FileSpreadsheet, AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';
import { uid } from '../lib/store';
import { numOr } from '../lib/form';
import { FESTIVAL } from '../lib/config';
import {
  expenseEntries, incomeEntries, assignedByBudgetLine, budgetTotal, huf, INCOME_TYPES, INCOME_STATUSES
} from '../lib/finance';

const SOURCES = ['Fellépő', 'Szolgáltató', 'Beszerzés', 'Engedély'];

function exportFinance({ expenses, incomes, budget, assigned }) {
  const wb = XLSX.utils.book_new();
  const budgetRows = [[`${FESTIVAL.name} ${FESTIVAL.year} — Költségvetés és tény`], [],
    ['Kód', 'Kategória', 'Tétel', 'Tervezett összeg', 'Pályázatból', 'Önrész', 'Hozzárendelt tény', 'Ebből kifizetve', 'Eltérés (terv - tény)', 'Hozzárendelt tételek', 'Bizonylatszám', 'Státusz']];
  budget.forEach(b => {
    const a = assigned[b.id] || { total: 0, paid: 0, count: 0 };
    budgetRows.push([b.code, b.category, b.name, budgetTotal(b), b.grant || 0, b.own || 0, a.total, a.paid, budgetTotal(b) - a.total, a.count, b.invoice, b.status]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budgetRows), 'Költségvetés és tény');

  const lineName = (id) => { const b = budget.find(x => x.id === id); return b ? `${b.code} · ${b.name}` : ''; };
  const expRows = [['Forrás', 'Megnevezés', 'Partner / leírás', 'Összeg', 'Kifizetve', 'Hátralék', 'Állapot', 'Költségvetési sor', 'Számla / bizonylat', 'Link']];
  expenses.forEach(e => expRows.push([e.source, e.name, e.partner || '', e.amount, e.paid, e.amount - e.paid, e.status, lineName(e.budgetLine), e.invoiceName, e.invoice && !e.invoice.startsWith('data:') ? e.invoice : '']));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expRows), 'Kiadások');

  const incRows = [['Forrás', 'Megnevezés', 'Összeg', 'Befolyt', 'Állapot']];
  incomes.forEach(i => incRows.push([i.source, i.name, i.amount, i.received, i.status]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incRows), 'Bevételek');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const url = URL.createObjectURL(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `KTSZE-penzugyi-elszamolas-${FESTIVAL.year}-${new Date().toLocaleDateString('sv-SE')}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function FinanceView({ artists, contractors, shoppingList, permits, vendors, sponsors, budget, income, onUpdateIncome, onNavigate, onAddLog, currentUser }) {
  const [editing, setEditing] = useState(null);
  const expenses = useMemo(() => expenseEntries({ artists, contractors, shoppingList, permits }), [artists, contractors, shoppingList, permits]);
  const incomes = useMemo(() => incomeEntries({ income, sponsors, vendors }), [income, sponsors, vendors]);
  const assigned = useMemo(() => assignedByBudgetLine(expenses), [expenses]);

  const sum = (list, f) => list.reduce((s, x) => s + (Number(x[f]) || 0), 0);
  const committed = sum(expenses, 'amount');
  const paid = sum(expenses, 'paid');
  const expectedIncome = sum(incomes, 'amount');
  const received = sum(incomes, 'received');
  const balance = expectedIncome - committed;
  const plannedBudget = budget.reduce((s, b) => s + budgetTotal(b), 0);
  const grantTotal = sum(budget, 'grant');
  const unassigned = expenses.filter(e => !e.budgetLine);
  const unpaid = expenses.filter(e => e.amount - e.paid > 0.5).sort((a, b) => (b.amount - b.paid) - (a.amount - a.paid));

  const saveIncome = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const item = {
      ...editing,
      name: f.get('name').trim(),
      type: f.get('type'),
      amount: numOr(f.get('amount'), 0),
      status: f.get('status'),
      date: f.get('date'),
      notes: f.get('notes').trim()
    };
    const exists = income.some(i => i.id === item.id);
    onUpdateIncome(exists ? income.map(i => (i.id === item.id ? item : i)) : [...income, item]);
    onAddLog({ user: currentUser, action: exists ? 'UPDATE' : 'CREATE', module: 'Pénzügy', description: `${exists ? 'Módosította' : 'Új bevétel'}: ${item.name} (${huf(item.amount)}, ${item.status})` });
    setEditing(null);
  };

  const deleteIncome = () => {
    if (!window.confirm(`Törlöd: „${editing.name}”?`)) return;
    onUpdateIncome(income.filter(i => i.id !== editing.id));
    onAddLog({ user: currentUser, action: 'DELETE', module: 'Pénzügy', description: `Törölte a bevételt: ${editing.name}` });
    setEditing(null);
  };

  return (
    <div>
      <div className="view-head">
        <div>
          <h2 className="view-title"><Wallet size={20} color="#059669" /> Pénzügyi áttekintés</h2>
          <p className="view-subtitle">Minden kiadás és bevétel egy helyen — a fellépők, szolgáltatók, beszerzések, engedélyek, szponzorok és standdíjak adataiból</p>
        </div>
        <button className="btn-secondary" onClick={() => {
          exportFinance({ expenses, incomes, budget, assigned });
          onAddLog({ user: currentUser, action: 'EXPORT', module: 'Pénzügy', description: 'Letöltötte a pénzügyi elszámolást (Excel)' });
        }}>
          <FileSpreadsheet size={16} /> Elszámolás letöltése (Excel)
        </button>
      </div>

      <div className="fin-kpis">
        <div className="fin-kpi"><span><TrendingDown size={15} /> Vállalt kiadás</span><strong>{huf(committed)}</strong><small>ebből kifizetve: {huf(paid)}</small></div>
        <div className="fin-kpi"><span><AlertTriangle size={15} /> Még fizetendő</span><strong style={{ color: committed - paid > 0 ? '#b45309' : '#047857' }}>{huf(committed - paid)}</strong><small>{unpaid.length} tétel</small></div>
        <div className="fin-kpi"><span><TrendingUp size={15} /> Várható bevétel</span><strong>{huf(expectedIncome)}</strong><small>ebből befolyt: {huf(received)}</small></div>
        <div className="fin-kpi"><span><Scale size={15} /> Egyenleg (bevétel − kiadás)</span><strong style={{ color: balance < 0 ? '#b91c1c' : '#047857' }}>{huf(balance)}</strong><small>{balance < 0 ? 'hiány' : 'többlet'}</small></div>
      </div>

      <div className="fin-grid">
        <section className="dash-card">
          <div className="dash-card-title">Kiadások forrásonként</div>
          <table className="fin-table">
            <thead><tr><th>Forrás</th><th>Vállalt</th><th>Kifizetve</th><th>Hátralék</th></tr></thead>
            <tbody>
              {SOURCES.map(src => {
                const list = expenses.filter(e => e.source === src);
                const a = sum(list, 'amount');
                const p = sum(list, 'paid');
                return (
                  <tr key={src}>
                    <td><strong>{src}</strong> <span className="dash-muted">({list.length})</span></td>
                    <td>{huf(a)}</td><td>{huf(p)}</td><td style={{ color: a - p > 0 ? '#b45309' : undefined }}>{huf(a - p)}</td>
                  </tr>
                );
              })}
              <tr className="fin-total"><td>Összesen</td><td>{huf(committed)}</td><td>{huf(paid)}</td><td>{huf(committed - paid)}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="dash-card">
          <div className="dash-card-title">Pályázati költségvetés vs. tény
            <button className="link-btn" onClick={() => onNavigate('budget')}>Költségvetés <ChevronRight size={14} /></button>
          </div>
          <div className="fin-lines">
            <div><span>Tervezett költségvetés</span><strong>{huf(plannedBudget)}</strong></div>
            <div><span>Ebből pályázati támogatás</span><strong>{huf(grantTotal)}</strong></div>
            <div><span>Sorokhoz rendelt tény</span><strong>{huf(committed - sum(unassigned, 'amount'))}</strong></div>
            <div><span>Hozzá nem rendelt kiadás</span><strong style={{ color: unassigned.length ? '#b45309' : undefined }}>{huf(sum(unassigned, 'amount'))} ({unassigned.length} tétel)</strong></div>
          </div>
          {unassigned.length > 0 && (
            <div className="field-hint" style={{ marginTop: '8px' }}>
              Az elszámoláshoz minden kiadást rendelj költségvetési sorhoz (a tétel adatlapján: „Költségvetési sor”).
            </div>
          )}
        </section>
      </div>

      <section className="dash-card" style={{ marginTop: '14px' }}>
        <div className="dash-card-title">Fizetendő tételek ({unpaid.length})</div>
        {unpaid.length === 0 ? <div className="dash-empty">Nincs kifizetetlen tétel.</div> : (
          <div className="ops-table-container">
            <table className="ops-table">
              <thead><tr><th>Megnevezés</th><th>Forrás</th><th>Összeg</th><th>Hátralék</th><th>Állapot</th><th>Számla</th></tr></thead>
              <tbody>
                {unpaid.map(e => (
                  <tr key={`${e.source}-${e.id}`} onClick={() => onNavigate(e.tab)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700 }}>{e.name}</td>
                    <td><span className="badge badge-gray">{e.source}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{huf(e.amount)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 800, color: '#b45309' }}>{huf(e.amount - e.paid)}</td>
                    <td>{e.status}</td>
                    <td>{e.invoice ? <a href={e.invoice} target="_blank" rel="noopener noreferrer" onClick={(ev) => ev.stopPropagation()} className="phone-link"><ExternalLink size={12} /> megnyitás</a> : <span className="dash-muted">nincs</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dash-card" style={{ marginTop: '14px' }}>
        <div className="dash-card-title">Bevételek ({incomes.length})
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setEditing({ id: uid('bev'), name: '', type: 'Pályázati támogatás', amount: 0, status: 'Várható', date: '', notes: '' })}>
            <Plus size={15} /> Új bevétel
          </button>
        </div>
        <div className="field-hint" style={{ marginTop: '-6px', marginBottom: '10px' }}>A szponzorok (pénzbeli) és az árusok standdíja automatikusan ide kerül — azokat a saját menüjükben szerkeszd.</div>
        {incomes.length === 0 ? <div className="dash-empty" style={{ color: '#475569' }}>Még nincs bevétel rögzítve.</div> : (
          <div className="ops-table-container">
            <table className="ops-table">
              <thead><tr><th>Megnevezés</th><th>Forrás</th><th>Összeg</th><th>Befolyt</th><th>Állapot</th></tr></thead>
              <tbody>
                {incomes.map(i => (
                  <tr key={`${i.source}-${i.id}`} style={{ cursor: 'pointer' }}
                    onClick={() => (i.manual ? setEditing(income.find(x => x.id === i.id)) : onNavigate(i.tab))}>
                    <td style={{ fontWeight: 700 }}>{i.name}</td>
                    <td><span className="badge badge-gray">{i.source}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{huf(i.amount)}</td>
                    <td style={{ whiteSpace: 'nowrap', color: '#047857', fontWeight: 700 }}>{huf(i.received)}</td>
                    <td><span className={`badge ${i.status === 'Befolyt' || i.status === 'Befizetve / teljesítve' ? 'badge-green' : 'badge-amber'}`}>{i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{income.some(i => i.id === editing.id) ? 'Bevétel szerkesztése' : 'Új bevétel'}</h2>
              <button onClick={() => setEditing(null)} className="icon-btn" aria-label="Bezárás"><X size={20} /></button>
            </div>
            <form onSubmit={saveIncome}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="field-label">Megnevezés *</label>
                  <input name="name" defaultValue={editing.name} required placeholder="pl. NKA pályázat, Önkormányzati támogatás 2027" />
                </div>
                <div className="grid-3">
                  <div>
                    <label className="field-label">Típus</label>
                    <select name="type" defaultValue={editing.type}>{INCOME_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                  </div>
                  <div>
                    <label className="field-label">Összeg (Ft)</label>
                    <input type="number" name="amount" min="0" defaultValue={editing.amount} />
                  </div>
                  <div>
                    <label className="field-label">Állapot</label>
                    <select name="status" defaultValue={editing.status}>{INCOME_STATUSES.map(t => <option key={t}>{t}</option>)}</select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Dátum (megítélés / beérkezés)</label>
                  <input type="date" name="date" defaultValue={editing.date} />
                </div>
                <div>
                  <label className="field-label">Megjegyzés</label>
                  <textarea name="notes" rows={2} defaultValue={editing.notes} placeholder="pl. Támogatói okirat száma, elszámolási határidő..." />
                </div>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>{income.some(i => i.id === editing.id) && <button type="button" className="text-danger-btn" onClick={deleteIncome}><Trash2 size={15} /> Törlés</button>}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Mégse</button>
                  <button type="submit" className="btn-primary">Mentés</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
