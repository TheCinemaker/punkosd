import { docUrl } from './files';

// Fizetési állapotból a kifizetett arány ("Előleg kifizetve (30%)" -> 0.3, "Kifizetve" -> 1)
export function paidRatio(status) {
  const s = (status || '').toLowerCase();
  const m = /(\d+)\s*%/.exec(s);
  if (m && s.includes('kifizetve')) return Math.min(1, Number(m[1]) / 100);
  if (s.includes('teljesen kifizetve') || s === 'kifizetve' || s.startsWith('kifizetve')) return 1;
  return 0;
}

export const huf = (n) => `${Math.round(Number(n) || 0).toLocaleString('hu-HU')} Ft`;

// Minden kiadás egy listában, forrás szerint (fellépő, szolgáltató, beszerzés, engedély)
export function expenseEntries({ artists = [], contractors = [], shoppingList = [], permits = [] }) {
  const out = [];
  artists.forEach(a => {
    const amount = Number(a.fee) || 0;
    if (!amount) return;
    out.push({
      source: 'Fellépő', tab: 'artists', id: a.id, name: a.name, partner: a.contact,
      amount, paid: amount * paidRatio(a.paymentStatus), status: a.paymentStatus || 'Fizetésre vár',
      budgetLine: a.budgetLine || '', invoice: docUrl(a.invoiceDoc), invoiceName: a.invoiceDoc?.name || ''
    });
  });
  contractors.forEach(c => {
    const amount = Number(c.feeHuf) || 0;
    if (!amount) return;
    out.push({
      source: 'Szolgáltató', tab: 'contractors', id: c.id, name: c.companyName, partner: c.service,
      amount, paid: amount * paidRatio(c.paymentStatus), status: c.paymentStatus || 'Fizetésre vár',
      budgetLine: c.budgetLine || '', invoice: docUrl(c.completionDoc), invoiceName: c.completionDoc?.name || c.invoiceNumber || ''
    });
  });
  shoppingList.forEach(s => {
    const amount = Number(s.isPurchased ? (s.actualPrice || s.estimatedPrice) : (s.estimatedPrice || s.actualPrice)) || 0;
    if (!amount) return;
    out.push({
      source: 'Beszerzés', tab: 'shopping', id: s.id, name: s.name, partner: s.store,
      amount, paid: s.isPurchased ? amount : 0, status: s.isPurchased ? 'Beszerezve' : 'Beszerzendő',
      budgetLine: s.budgetLine || '', invoice: docUrl(s.receiptDoc), invoiceName: s.receiptDoc?.name || ''
    });
  });
  permits.forEach(p => {
    const amount = Number(p.fee) || 0;
    if (!amount) return;
    out.push({
      source: 'Engedély', tab: 'permits', id: p.id, name: p.name, partner: p.authority,
      amount, paid: p.feePaid ? amount : 0, status: p.feePaid ? 'Kifizetve' : 'Fizetendő',
      budgetLine: p.budgetLine || '', invoice: docUrl(p.permitDoc), invoiceName: p.permitDoc?.name || ''
    });
  });
  return out;
}

export const INCOME_TYPES = ['Pályázati támogatás', 'Önkormányzati támogatás', 'Szponzor', 'Standdíj', 'Jegy / belépő', 'Egyéb'];
export const INCOME_STATUSES = ['Várható', 'Megítélve / megállapodva', 'Befolyt'];

// Minden bevétel: kézi bevételek + szponzorok (pénzbeli) + árusok standdíja
export function incomeEntries({ income = [], sponsors = [], vendors = [] }) {
  const out = income.map(i => ({
    source: i.type || 'Egyéb', tab: 'finance', id: i.id, name: i.name, amount: Number(i.amount) || 0,
    received: i.status === 'Befolyt' ? Number(i.amount) || 0 : 0, status: i.status || 'Várható', manual: true
  }));
  sponsors.forEach(s => {
    const amount = Number(s.amount) || 0;
    if (!amount || s.kind !== 'Pénzbeli' || s.status === 'Nem vállalta' || s.status === 'Megkeresve') return;
    out.push({
      source: 'Szponzor', tab: 'sponsors', id: s.id, name: s.name, amount,
      received: s.status === 'Befizetve / teljesítve' ? amount : 0, status: s.status
    });
  });
  vendors.forEach(v => {
    const amount = Number(v.fee) || 0;
    if (!amount || v.contractStatus === 'Visszalépett / lemondta') return;
    out.push({
      source: 'Standdíj', tab: 'vendors', id: v.id, name: `${v.code ? `${v.code} · ` : ''}${v.name}`, amount,
      received: v.feePaid ? amount : 0, status: v.feePaid ? 'Befolyt' : 'Várható'
    });
  });
  return out;
}

// Költségvetési soronként a hozzárendelt tényleges kiadás
export function assignedByBudgetLine(expenses) {
  const map = {};
  expenses.forEach(e => {
    if (!e.budgetLine) return;
    const m = (map[e.budgetLine] = map[e.budgetLine] || { total: 0, paid: 0, count: 0 });
    m.total += e.amount;
    m.paid += e.paid;
    m.count += 1;
  });
  return map;
}

export const budgetTotal = (b) => (Number(b.qty) || 0) * (Number(b.unitPrice) || 0);
