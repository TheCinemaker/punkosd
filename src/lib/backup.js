import * as XLSX from 'xlsx';
import { FESTIVAL } from './config';

// A gyűjtemények magyar neve (lomtár, mentés, napló)
export const COLLECTION_LABELS = {
  users: 'Stáb',
  stages: 'Helyszínek',
  schedule: 'Menetrend',
  artists: 'Fellépők',
  contractors: 'Szolgáltatók',
  vendors: 'Árusok',
  tasks: 'Feladatok',
  shoppingList: 'Beszerzés',
  inventory: 'Készlet',
  budget: 'Költségvetés',
  logs: 'Napló',
  incidents: 'SOS / problémák',
  mapPoints: 'Térképpontok',
  permits: 'Engedélyek',
  income: 'Bevételek',
  sponsors: 'Szponzorok',
  production: 'Építés–bontás',
  accommodation: 'Szállás',
  transfers: 'Transzfer',
  catering: 'Catering',
  shifts: 'Műszakok',
  accreditations: 'Akkreditáció',
  notices: 'Közlemények',
  emergency: 'Vészkontaktok',
  settings: 'Beállítások',
  reportDays: 'Beszámoló - napok',
  lessons: 'Tanulságok',
  reportDocs: 'Beszámoló - fotók',
  trash: 'Lomtár'
};

export const labelOf = (key) => COLLECTION_LABELS[key] || key;

// Egy tétel rövid megnevezése (lomtárhoz, naplóhoz)
export function itemLabel(item) {
  if (!item) return '—';
  return item.name || item.title || item.artist || item.companyName || item.text || item.code || item.id;
}

const stamp = () => new Date().toLocaleString('sv-SE').slice(0, 16).replace(/[: ]/g, '-');

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Táblázatba írható érték (feltöltött dokumentumnál a név + link)
function cell(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(cell).join(' | ');
  if (typeof value === 'object') {
    if (value.url || value.name) return [value.name, value.url && !String(value.url).startsWith('data:') ? value.url : ''].filter(Boolean).join(' — ');
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') return value ? 'igen' : 'nem';
  return value;
}

// Teljes mentés Excelben: gyűjteményenként egy munkalap, minden mező egy oszlop
export function downloadExcelBackup(data) {
  const wb = XLSX.utils.book_new();
  Object.keys(data).forEach(key => {
    const items = data[key] || [];
    const cols = Array.from(new Set(items.flatMap(it => Object.keys(it)))).filter(c => c !== '_sort' && c !== 'pin');
    const rows = [cols, ...items.map(it => cols.map(c => cell(it[c])))];
    const ws = XLSX.utils.aoa_to_sheet(items.length ? rows : [['(üres)']]);
    XLSX.utils.book_append_sheet(wb, ws, labelOf(key).replace(/[\\/?*[\]:]/g, '-').slice(0, 31));
  });
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  download(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `KTSZE-fesztival-${FESTIVAL.year}-mentes-${stamp()}.xlsx`);
}

// Teljes mentés JSON-ban (ebből minden pontosan visszaállítható)
export function downloadJsonBackup(data) {
  const payload = { app: 'ktsze-fesztival-menedzser', festivalYear: FESTIVAL.year, exportedAt: new Date().toISOString(), data };
  download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `KTSZE-fesztival-${FESTIVAL.year}-mentes-${stamp()}.json`);
}
